import prisma from "../services/database.js";
import getStripeClient from "../services/stripe.js";
import * as RandomString from "randomstring";
import {
	DefaultCurrencyGuid,
	transactionDescription,
	Accounts,
} from "../config/index.js";

export default async function createDatabaseTransaction(
	paymentIntentId: string
): Promise<void> {
	const stripe = getStripeClient();
	const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
		expand: ["latest_charge.balance_transaction"],
	});
    if (!paymentIntent.latest_charge || typeof paymentIntent.latest_charge === 'string') throw new Error('Stripe Charge object "latest_charge" was not expanded')
    const { latest_charge: {
        id: chargeId,
		balance_transaction: balanceTransaction,
		billing_details: billingDetails,
		created,
		amount
    }} = paymentIntent
	if (!balanceTransaction || typeof balanceTransaction === "string")
		throw new Error('Stripe BalanceTransaction object "balance_transaction" was not expanded');
	const feeAmount = balanceTransaction.fee;
	const matchedAccounts = await prisma.accounts.findMany({
		where: {
			OR: [
				{ name: Accounts.charges.debit },
				{ name: Accounts.charges.credit },
				{ name: Accounts.fees.debit },
			],
		},
	});
	if (matchedAccounts.length !== 3)
		throw new Error(
			"The number of accounts found did not match the configuration for the PaymentIntentSucceeded handler. Edit the Accounts object exported by config/index.ts, check the database for non-unique account names, or add the requested accounts to the database."
		);
	const accountChargeDebit = matchedAccounts.find(
		({ name }) => name === Accounts.charges.debit
	);
	const accountChargeCredit = matchedAccounts.find(
		({ name }) => name === Accounts.charges.credit
	);
	const accountFeesDebit = matchedAccounts.find(
		({ name }) => name === Accounts.fees.debit
	);
	if (!(accountChargeDebit && accountChargeCredit && accountFeesDebit))
		throw new Error(
			"Unable to find the debit and/or credit accounts specified in the configuration for the PaymentIntentSucceeded handler. Edit the Accounts object exported by config/index.ts or add the requested accounts to the database."
		);
	const preexistingTransaction = await prisma.transactions.findMany({
		where: {
			num: chargeId,
		},
	});
	if (preexistingTransaction.length > 0) {
		console.warn(`Duplicate transaction detected, skipping ${chargeId}`);
		return;
	}
	await prisma.transactions.create({
		data: {
			guid: RandomString.generate({
				length: 32,
				charset: "hex",
			}),
			currency_guid: DefaultCurrencyGuid,
			num: chargeId,
			description: transactionDescription({
				name: billingDetails.name,
			}),
			post_date: new Date(created * 1000),
			enter_date: new Date(),
			/* Create three splits:
                -Credit the income account the gross amount
                -Debit the fee expense account the fee amount
                -Debit the asset account the net amount
            */
			splits: {
				create: [
					{
						guid: RandomString.generate({
							length: 32,
							charset: "hex",
						}),
						account_guid: accountChargeCredit.guid,
						memo: "Donation gross",
						action: "",
						reconcile_state: "n",
						value_num: -amount,
						value_denom: 100,
						quantity_num: -amount,
						quantity_denom: 100,
					},
					{
						guid: RandomString.generate({
							length: 32,
							charset: "hex",
						}),
						account_guid: accountChargeDebit.guid,
						memo: "Donation net",
						action: "",
						reconcile_state: "n",
						value_num: amount - feeAmount,
						value_denom: 100,
						quantity_num: amount - feeAmount,
						quantity_denom: 100,
					},
					{
						guid: RandomString.generate({
							length: 32,
							charset: "hex",
						}),
						account_guid: accountFeesDebit.guid,
						memo: "Stripe transaction fee",
						action: "",
						reconcile_state: "n",
						value_num: feeAmount,
						value_denom: 100,
						quantity_num: feeAmount,
						quantity_denom: 100,
					},
				],
			},
		},
	});
    console.log(`Database transaction successfully created for Payment Intent [${paymentIntentId}]`)
}
