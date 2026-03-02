import * as z from "zod";
import prisma from "../services/database.js";
import * as RandomString from "randomstring";
import {
  DefaultCurrencyGuid,
  Accounts,
  defaultEarnings,
  ValidLaborAssignments,
  defaultExpenses,
  defaultWithholdings,
  defaultCompanyTaxExpenseLiabilites,
  unitDenominator,
} from "../config/index.js";
import {
  getAccountsWithFullNames,
  AccountWithFullName,
} from "./getAllAccounts.js";
import { SplitsUncheckedCreateWithoutTransactionsInput } from "generated/prisma/models.js";

export const payrollSplitShape = z.object({
  laborAssignment: z.string(),
  fullName: z.string(),
  checkDate: z.coerce.date(),
  checkNumber: z.coerce.string(),
  earningName: z.string().optional(),
  earningAmount: z.coerce.number().optional(),
  reimbursementAmount: z.coerce.number().optional(),
  expenseName: z.string().optional(),
  expenseAmount: z.coerce.number().optional(),
  withholdingName: z.string().optional(),
  withholdingAmount: z.coerce.number().optional(),
});

const payrollCompanyTaxExpenseSplitShape = payrollSplitShape.extend({
  earningName: z.any().transform(() => undefined),
  earningAmount: z.any().transform(() => undefined),
  expenseName: z.enum(["Medicare", "Social Security", "AZ Unemploy"]),
  expenseAmount: z.coerce.number(),
  withholdingName: z.any().transform(() => undefined),
  withholdingAmount: z.any().transform(() => undefined),
});

const payrollWithholdingSplitShape = payrollSplitShape.extend({
  earningName: z.any().transform(() => undefined),
  earningAmount: z.any().transform(() => undefined),
  expenseName: z.any().transform(() => undefined),
  expenseAmount: z.any().transform(() => undefined),
  withholdingName: z.enum([
    "Fed Income Tax",
    "AZ Income Tax",
    "Social Security",
    "Medicare",
  ]),
  withholdingAmount: z.coerce.number(),
});

export type PayrollSplitShape = z.infer<typeof payrollSplitShape>;
const guidSchema = {
  length: 32,
  charset: "hex",
};

const getFullAccountName = (split: PayrollSplitShape): string => {
  const account =
    Accounts.payroll[split.laborAssignment as ValidLaborAssignments];
  if (!account)
    throw new Error(`Invalid labor assignment passed ${split.laborAssignment}`);
  if (
    (split.earningName && split.earningAmount) ||
    (split.earningName && split.reimbursementAmount)
  ) {
    const earning =
      account.earnings[split.earningName as keyof typeof defaultEarnings] ??
      account.earnings.other;
    if (!earning)
      throw new Error(`Invalid earning name passed ${split.earningName}`);
    return earning.startsWith("@")
      ? earning.slice(1)
      : [account.prefix, earning].join(":");
  } else if (split.expenseName && split.expenseAmount) {
    const expense =
      account.expense[split.expenseName as keyof typeof defaultExpenses];
    if (!expense)
      throw new Error(`Invalid expense name passed ${split.expenseName}`);
    return expense.startsWith("@")
      ? expense.slice(1)
      : [account.prefix, expense].join(":");
  } else if (split.withholdingName && split.withholdingAmount) {
    const withholding =
      account.withholding[
        split.withholdingName as keyof typeof defaultWithholdings
      ];
    if (!withholding)
      throw new Error(
        `Invalid withholding name passed ${split.withholdingName}`,
      );
    return withholding.startsWith("@")
      ? withholding.slice(1)
      : [account.prefix, withholding].join(":");
  } else {
    console.error(
      `Invalid split object encountered [${JSON.stringify(split)}]`,
    );
    throw new Error("Invalid split object passed");
  }
};

const getGuidFromFullAccountName = (
  fullAccountName: string,
  accounts: AccountWithFullName[],
): string => {
  const parsedAccountName = fullAccountName.startsWith("@")
    ? fullAccountName.slice(1)
    : fullAccountName;
  const match = accounts.find(
    (account) => account.fullAccountName === parsedAccountName,
  );
  if (!match) throw Error(`No account found for ${fullAccountName}`);
  return match.guid;
};

const getValue = (split: PayrollSplitShape, denom: number): number => {
  if (split.earningAmount)
    return Math.round(split.earningAmount * (denom ?? 1));
  else if (split.reimbursementAmount)
    return Math.round(split.reimbursementAmount * (denom ?? 1));
  else if (split.expenseAmount)
    return Math.round(split.expenseAmount * (denom ?? 1));
  else if (split.withholdingAmount)
    return Math.round(-split.withholdingAmount * (denom ?? 1));
  else return 0;
};

interface ProcessedSplitData {
  data: SplitsUncheckedCreateWithoutTransactionsInput[];
  balance: number;
}

export const savePayrollTransaction = async (splits: PayrollSplitShape[]) => {
  if (splits.length === 0) throw new Error("No splits found");
  const accounts = await getAccountsWithFullNames();
  await prisma.$transaction(async (tx) => {
    console.log("⏳ Creating payroll transaction...");
    const createPayrollSplitsInput = splits.reduce(
      (accumulator, split) => {
        const value = getValue(split, unitDenominator);
        if (!value) return accumulator;
        accumulator.data.push({
          guid: RandomString.generate(guidSchema),
          account_guid: getGuidFromFullAccountName(
            getFullAccountName(split),
            accounts,
          ),
          memo: `${split.earningName || split.expenseName || split.withholdingName} for ${split.fullName}`,
          value_num: value,
          value_denom: unitDenominator,
          reconcile_state: "c",
          quantity_num: value,
          quantity_denom: unitDenominator,
          action: split.checkNumber,
        });
        accumulator.balance = accumulator.balance + value;
        const { success, data } =
          payrollCompanyTaxExpenseSplitShape.safeParse(split);
        if (!success) return accumulator;
        accumulator.data.push({
          guid: RandomString.generate(guidSchema),
          account_guid: getGuidFromFullAccountName(
            defaultCompanyTaxExpenseLiabilites[data.expenseName],
            accounts,
          ),
          memo: `${split.expenseName} company tax liability for ${data.fullName}`,
          value_num: -value,
          value_denom: unitDenominator,
          reconcile_state: "c",
          quantity_num: -value,
          quantity_denom: unitDenominator,
          action: split.checkNumber,
        });
        accumulator.balance = accumulator.balance - value;
        return accumulator;
      },
      { data: [], balance: 0 } as ProcessedSplitData,
    );
    // Primary payroll transaction
    const payrollTxGuid = RandomString.generate(guidSchema);
    await tx.transactions.create({
      data: {
        guid: payrollTxGuid,
        currency_guid: DefaultCurrencyGuid,
        description: "Paychex payroll",
        num: "",
        post_date: splits[0].checkDate,
        enter_date: new Date(),
        splits: {
          create: [
            ...createPayrollSplitsInput.data,
            {
              guid: RandomString.generate(guidSchema),
              account_guid: getGuidFromFullAccountName(
                Accounts.payrollFunding,
                accounts,
              ),
              memo: "Payroll funding",
              value_num: -createPayrollSplitsInput.balance,
              value_denom: unitDenominator,
              reconcile_state: "c",
              quantity_num: -createPayrollSplitsInput.balance,
              quantity_denom: unitDenominator,
              action: "",
            },
          ],
        },
      },
    });
    console.log(`🧮 Created payroll transaction, guid: [${payrollTxGuid}]`);
    // Immediate tax payment transaction (debit tax liabilities and credit cash)
    console.log("⏳ Creating tax payment transaction...");
    const createTaxPaymentSplitsInput = splits.reduce(
      (accumulator, split) => {
        const companyTaxExpenseSplit =
          payrollCompanyTaxExpenseSplitShape.safeParse(split);
        if (companyTaxExpenseSplit.success) {
          const { data } = companyTaxExpenseSplit;
          const value = Math.round(data.expenseAmount * unitDenominator);
          accumulator.data.push({
            guid: RandomString.generate(guidSchema),
            account_guid: getGuidFromFullAccountName(
              defaultCompanyTaxExpenseLiabilites[data.expenseName],
              accounts,
            ),
            memo: `${split.expenseName} company expense liability payment for ${data.fullName}`,
            value_num: value,
            value_denom: unitDenominator,
            reconcile_state: "c",
            quantity_num: value,
            quantity_denom: unitDenominator,
            action: split.checkNumber,
          });
          accumulator.balance = accumulator.balance - value;
        }
        const withholdingSplit = payrollWithholdingSplitShape.safeParse(split);
        if (withholdingSplit.success) {
          const { data } = withholdingSplit;
          const value = Math.round(data.withholdingAmount * unitDenominator);
          accumulator.data.push({
            guid: RandomString.generate(guidSchema),
            account_guid: getGuidFromFullAccountName(
              defaultWithholdings[data.withholdingName],
              accounts,
            ),
            memo: `${split.withholdingName} withholding liability payment for ${data.fullName}`,
            value_num: value,
            value_denom: unitDenominator,
            reconcile_state: "c",
            quantity_num: value,
            quantity_denom: unitDenominator,
            action: split.checkNumber,
          });
          accumulator.balance = accumulator.balance - value;
        }
        return accumulator;
      },
      { data: [], balance: 0 } as ProcessedSplitData,
    );
    const taxTxGuid = RandomString.generate(guidSchema);
    await tx.transactions.create({
      data: {
        guid: taxTxGuid,
        currency_guid: DefaultCurrencyGuid,
        description: "Paychex tax payment",
        num: "",
        post_date: splits[0].checkDate,
        enter_date: new Date(),
        splits: {
          create: [
            ...createTaxPaymentSplitsInput.data,
            {
              guid: RandomString.generate(guidSchema),
              account_guid: getGuidFromFullAccountName(
                Accounts.payrollFunding,
                accounts,
              ),
              memo: "Tax payment funding",
              value_num: createTaxPaymentSplitsInput.balance,
              value_denom: unitDenominator,
              reconcile_state: "c",
              quantity_num: createTaxPaymentSplitsInput.balance,
              quantity_denom: unitDenominator,
              action: "",
            },
          ],
        },
      },
    });
    console.log(`🧮 Created tax transaction, guid: [${taxTxGuid}]`);
  });
};
