
import { Request, Response } from "express";
import { parseISO } from "date-fns"
import transactionSubmittedHandler from "../services/events/transactionSubmitted.js";

interface NocoPayload {
  type: string
  id: string
  data: NocoTable
}

interface NocoTable {
  table_id: string
  table_name: string
  rows: NocoTransaction[]
}

interface NocoTransactionRaw {
  [key: string]: any
}

export interface Account {
  fullString: string
  accountName: string
  parentAccount: Account
}

export interface NocoTransaction {
  id: number
  createdAt: Date
  updatedAt: Date
  occurred: Date
  description: string
  merchantName: string
  merchantCity: string
  merchantState: string
  merchantZipCode: string
  originatingAccountName: string
  mmcCode: string
  merchantCodeDescription: string
  billedAmount: number
  refNumber: string
  submitted: boolean
  expenseAccount: Account
  cashAccount: Account
}

const NocoKeyMap = {
  "Id":"id",
  "CreatedAt":"createdAt",
  "UpdatedAt":"updatedAt",
  "Occurred":"occurred",
  "Description":"description",
  "Merchant Name": "merchantName",
  "Merchant City":"merchantCity",
  "Merchant State":"merchantState",
  "Merchant Zip Code":"merchantZipCode",
  "Originating Account Name":"originatingAccountName",
  "MCC/SIC Code":"mmcCode",
  "Merchant Code Description":"merchantCodeDesc",
  "Billed Amount":"billedAmount",
  "Reference Number":"refNumber",
  "Submitted":"submitted",
  "Full Expense Account Name":"expenseAccount",
  "Full Cash/Liability Account Name":"cashAccount"
} as const

function parseFullAccountString(fullAcctName: string): Account | null {
  const segments = fullAcctName.split(':')
  if (segments.length == 0) return null
  return segments.reduce((acc, accountName) => ({fullString: fullAcctName, accountName: accountName, parentAccount: acc} as Account), {} as Account)
}

function transformRawTransactionData(rawTransaction: NocoTransactionRaw): NocoTransaction {
  const transformedTransaction: Partial<NocoTransaction> = {};
  const rawKeys = Object.keys(rawTransaction)

  // Map raw payload keys to defined keys
  for (const rawKey of rawKeys) {
    // Handle special cases
    switch (rawKey) {
      // Handle Date transformations
      case "CreatedAt":
      case "UpdatedAt":
      case "Occurred":
        transformedTransaction[NocoKeyMap[rawKey]] = parseISO(rawTransaction[rawKey].replace(' ', 'T'))
        break
      case "Submitted":
        transformedTransaction.submitted = Boolean(rawTransaction[rawKey])
        break
      case "Full Expense Account Name":
      case "Full Cash/Liability Account Name":
        const fullAccountString = rawTransaction[rawKey]
        const segments = fullAccountString.split(':')
        if (segments.length < 2) throw new Error(`Invalid ${rawKey}`)
        const [parentAccount, childAccount] = segments.slice(-2);
        const account = {accountName: childAccount, parentAccount: parentAccount, fullString: fullAccountString} as Account
        transformedTransaction[NocoKeyMap[rawKey]] = account
        break
      default:
        const newKey = NocoKeyMap[rawKey as keyof typeof NocoKeyMap] || rawKey;    
        transformedTransaction[newKey as keyof NocoTransaction] = rawTransaction[rawKey];
    }
  }
  return transformedTransaction as NocoTransaction
}

export const handleNocoWebhook = async (req: Request, res: Response) => {
  const rawPayload = req.body
  if (!rawPayload.type || !rawPayload.data || !rawPayload.data.rows || !Array.isArray(rawPayload.data.rows)) res.status(400)
  const payload = rawPayload as NocoPayload
  try {
    payload.data.rows.forEach((rawTrans) => transactionSubmittedHandler(transformRawTransactionData(rawTrans)))
  } catch (err) {
    console.error("Error processing webhook event:", err);
		res.status(500).json({ error: "Failed to process event" });
  }
}
