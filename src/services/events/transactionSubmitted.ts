import prisma from "../../services/database.js"
import * as RandomString from "randomstring"
import { DefaultCurrencyGuid } from "../../config/index.js";
import { NocoTransaction } from "../../controllers/nocoController.js"
import getNocoClient from '../../services/noco.js'
import { AccountsWhereInput } from "../../generated/prisma/models.js";

function getAccountsWhereInputFromFullAccountName(fullAcctName: string): AccountsWhereInput {
  const segments = fullAcctName.split(':')
  if (segments.length == 0) throw Error(`Invalid full account string in payload: ${fullAcctName}`)
  return segments.reduce((acc, accountName) => ({name: accountName, parent_account: acc}), {})
}

export default async function transactionSubmittedHandler(submittedTrans: NocoTransaction): Promise<void> {
  // Write transactions into database
  //  Debit expense account
  //  Credit cash account
  // Set transactions as submitted in Noco
  // Return success code
  const noco = getNocoClient()
  const preexistingTransaction = await prisma.transactions.findMany({
    where: {
      num: submittedTrans.refNumber
    }
  })
  if (preexistingTransaction.length > 0) {
		console.warn(`Duplicate transaction detected, skipping ${submittedTrans.refNumber}`);
		return;
	}
  const matchedAccounts = await prisma.accounts.findMany({
    where: {
      OR: [
        getAccountsWhereInputFromFullAccountName(submittedTrans.expenseAccount.fullString),
        getAccountsWhereInputFromFullAccountName(submittedTrans.cashAccount.fullString)
      ]
    }
  })
  if (matchedAccounts.length !== 2)
		throw new Error(
			"The number of accounts found did not match the request submitted to the TransactionSubmitted handler. The payload may contain nonexistent accounts."
		);
  const expenseAccount = matchedAccounts.find(({name}) => name === submittedTrans.expenseAccount.accountName)
  const cashAccount = matchedAccounts.find(({name}) => name === submittedTrans.cashAccount.accountName)
  if (!(expenseAccount && cashAccount)) throw new Error("Unable to find the expense or cash accounts requested by the payload.")
  const transaction = await prisma.transactions.create({
    data: {
      guid: RandomString.generate({
        length:32,
        charset: "hex"
      }),
      currency_guid: DefaultCurrencyGuid,
      num: submittedTrans.refNumber,
      description: submittedTrans.description || submittedTrans.merchantName,
      post_date: submittedTrans.occurred,
      enter_date: new Date(),
      splits: {
        create: [
          {
            guid: RandomString.generate({
              length: 32,
              charset: 'hex'
            }),
            account_guid: expenseAccount.guid,
            memo: '',
            action: '',
            reconcile_state: "n",
            value_num: Math.round(submittedTrans.billedAmount * 100),
            value_denom: 100,
            quantity_num: Math.round(submittedTrans.billedAmount * 100),
            quantity_denom: 100
          },
          {
            guid: RandomString.generate({
              length: 32,
              charset: 'hex'
            }),
            account_guid: cashAccount.guid,
            memo: '',
            action: '',
            reconcile_state: "n",
            value_num: Math.round(-submittedTrans.billedAmount * 100),
            value_denom: 100,
            quantity_num: Math.round(-submittedTrans.billedAmount * 100),
            quantity_denom: 100
          }
        ]
      }
    }
  })
  const response = await noco.dbTableRow.update(
    'noco',
    'Accounting',
    'Transactions to Categorize',
    submittedTrans.id,
    {
      "Submitted":1
    }
  )
}