import { Prisma, type Transactions as Transaction } from '../generated/prisma/client.js';
import { Account } from '../controllers/nocoController.js'
import * as RandomString from "randomstring"
import { getAccountsWhereInputFromFullAccountName } from "../utils/getAccountsWhereInputFromFullAccountName.js";
import prisma from '../services/database.js';

const releaseAccount: Account = {
  fullString: "Income:Cash Donations:Restricted Cash Donations:Wilberforce Project Funds Released from Restriction:Wilberforce Released USD",
  accountName: "Wilberforce Released USD",
  parentAccount: {} as Account
} as const

const reclassifyAccount: Account = {
  fullString:"Income:Cash Donations:Unrestricted Cash Donations:Wilberforce Project Funds Reclassified as Unrestricted:Wilberforce Reclassified USD",
  accountName: "Wilberforce Reclassified USD",
  parentAccount: {} as Account
} as const

const transactionWithSplits = {
  include: {
    splits: true,
  },
} satisfies Prisma.TransactionsDefaultArgs

type TransactionWithSplits = Prisma.TransactionsGetPayload<typeof transactionWithSplits>;

export async function releaseRestrictedFunds(transaction: TransactionWithSplits, expenseAccount: Account, amount: number): Promise<TransactionWithSplits> {
  if (expenseAccount.fullString.includes('Wilberforce')) {
    const matchedAccounts = await prisma.accounts.findMany({
      where: {
        OR: [
          getAccountsWhereInputFromFullAccountName(releaseAccount.fullString),
          getAccountsWhereInputFromFullAccountName(reclassifyAccount.fullString)
        ]
      }
    })
    if (matchedAccounts.length !== 2)
      throw new Error(
        "The number of accounts found did not match the request submitted to the releaseRestrictedFunds handler. The configuration may contain nonexistent accounts."
      );
    const matchedReleaseAccount = matchedAccounts.find(({name}) => name === releaseAccount.accountName)
    const matchedReclassifyAccount = matchedAccounts.find(({name}) => name === reclassifyAccount.accountName)
    if (!(matchedReleaseAccount && matchedReclassifyAccount)) throw new Error("Unable to find the release or reclassification accounts requested by the payload.")
    // Debit the release account and credit the reclassify account
    const updatedTransaction = await prisma.transactions.update({
      where: {
        guid: transaction.guid
      },
      data: {
        splits: {
          create: [
            {
              guid: RandomString.generate({
                length: 32,
                charset: 'hex'
              }),
              account_guid: matchedReleaseAccount.guid,
              memo: 'Wilberforce restricted funds released from restriction',
              action: '',
              reconcile_state: "n",
              value_num: amount,
              value_denom: 100,
              quantity_num: amount,
              quantity_denom: 100
            },
            {
              guid: RandomString.generate({
                length: 32,
                charset: 'hex'
              }),
              account_guid: matchedReclassifyAccount.guid,
              memo: 'Wilberforce funds reclassified as unrestricted',
              action: '',
              reconcile_state: "n",
              value_num: -amount,
              value_denom: 100,
              quantity_num: -amount,
              quantity_denom: 100
            },
          ]
        }
      },
      include: {
        splits: true
      }
    })
    return updatedTransaction
  } else {
    return transaction
  }
}