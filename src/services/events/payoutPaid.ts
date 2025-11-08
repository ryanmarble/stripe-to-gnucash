import Stripe from "stripe";
import prisma from "../../services/database.js";
import * as RandomString from "randomstring";
import { DefaultCurrencyGuid, Accounts } from "../../config/index.js";

export default async function payoutPaidHandler(event: Stripe.PayoutPaidEvent) {
	const { amount, created, id: payoutId } = event.data.object;
	const matchedAccounts = await prisma.accounts.findMany({
		where: {
			OR: [{ name: Accounts.payouts.debit }, { name: Accounts.payouts.credit }],
		},
	});
	if (matchedAccounts.length !== 2)
		throw new Error(
			"The number of accounts found did not match the configuration for the PayoutPaid handler. Edit the Accounts object exported by config/index.ts, check the database for non-unique account names, or add the requested accounts to the database."
		);
	const accountPayoutDebit = matchedAccounts.find(
		({ name }) => name === Accounts.payouts.debit
	);
	const accountPayoutCredit = matchedAccounts.find(
		({ name }) => name === Accounts.payouts.credit
	);

	if (!(accountPayoutDebit && accountPayoutCredit))
		throw new Error(
			"Unable to find the debit and/or credit accounts specified in the configuration for the PayoutPaid handler. Edit the Accounts object exported by config/index.ts or add the requested accounts to the database."
		);
	const preexistingTransaction = await prisma.transactions.findMany({
		where: {
			num: payoutId,
		},
	});
	if (preexistingTransaction.length > 0) {
		console.warn(`Duplicate transaction detected, skipping ${payoutId}`);
		return;
	}
	const transaction = await prisma.transactions.create({
		data: {
			guid: RandomString.generate({
				length: 32,
				charset: "hex",
			}),
			currency_guid: DefaultCurrencyGuid,
			num: payoutId,
			description: "Stripe transfer",
			post_date: new Date(created * 1000),
			enter_date: new Date(),
			/* Create two splits:
				-Debit the stripe account the gross amount
                -Credit the checking account the gross amount
            */
			splits: {
				create: [
					{
						guid: RandomString.generate({
							length: 32,
							charset: "hex",
						}),
						account_guid: accountPayoutDebit.guid,
						memo: "",
						action: "",
						reconcile_state: "n",
						value_num: amount,
						value_denom: 100,
						quantity_num: amount,
						quantity_denom: 100,
					},
					{
						guid: RandomString.generate({
							length: 32,
							charset: "hex",
						}),
						account_guid: accountPayoutCredit.guid,
						memo: "",
						action: "",
						reconcile_state: "n",
						value_num: -amount,
						value_denom: 100,
						quantity_num: -amount,
						quantity_denom: 100,
					},
				],
			},
		},
	});
}
