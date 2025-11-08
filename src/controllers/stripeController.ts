// src/controllers/stripeController.ts

import { Request, Response } from "express";
import Stripe from "stripe";
import getStripeClient from "../services/stripe.js";
import payoutPaidHandler from "../services/events/payoutPaid.js";
import paymentIntentSucceededHandler from "../services/events/paymentIntentSucceeded.js";

export const handleStripeWebhook = async (req: Request, res: Response) => {
	const stripe = getStripeClient();
	const webhookSecret = process.env.STRIPE_WH_SECRET_LIVE as string;
	const signature = req.headers["stripe-signature"];
	const rawBody = req.body;
	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			rawBody,
			signature as string,
			webhookSecret
		);
	} catch (err: any) {
		console.error(`Webhook signature verification failed.`, err.message);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}
	try {
		switch (event.type) {
			case "payout.paid":
				payoutPaidHandler(event);
				break;
			case "payment_intent.succeeded":
				paymentIntentSucceededHandler(event);
				break;
			default:
				console.warn(`Unhandled event ${event.type}`);
		}
		res.status(200).json({ received: true });
	} catch (error) {
		console.error("Error processing webhook event:", error);
		res.status(500).json({ error: "Failed to process event" });
	}
};
