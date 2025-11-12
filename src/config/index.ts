export const DefaultCurrencyGuid = "4a99222352d94e43afc12a472f3d6cb4";
export const Accounts = {
	charges: {
		debit: "Stripe Account",
		credit: "Individual USD Donations",
	},
	fees: {
		debit: "Donation Processing Fees",
		credit: "Stripe Account",
	},
	payouts: {
		debit: "Checking Account 0508",
		credit: "Stripe Account",
	},
};
export const AccountQueryDepth = 3

interface transactionDescriptionParameters {
	name: string | null;
}

export function transactionDescription({
	name,
}: transactionDescriptionParameters): string {
	return `Donation from ${name ?? "anonymous"} via Stripe`;
}
