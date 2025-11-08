import Stripe from "stripe";

let _stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
	if (_stripeClient) {
		return _stripeClient;
	}

	const apiKey = process.env.STRIPE_API_KEY_LIVE as string;

	_stripeClient = new Stripe(apiKey, {
		typescript: true,
	});

	console.log("Stripe Client successfully initialized.");

	return _stripeClient;
}

export default getStripeClient;
