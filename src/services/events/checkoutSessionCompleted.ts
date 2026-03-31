import Stripe from "stripe";
import { createCRMGiftFromStripeSession } from "utils/createCRMGift.js";
import createDatabaseTransaction from "utils/createDatabaseTransaction.js";

export default async function checkoutSessionCompletedHandler(
	event: Stripe.CheckoutSessionCompletedEvent
): Promise<void> {
    try {
        if (!event.data.object.payment_intent) throw new Error('Stripe Payment Intent object not found on Checkout.Session')
        const paymentIntentId = (typeof event.data.object.payment_intent !== 'string') ? event.data.object.payment_intent.id : event.data.object.payment_intent
        await createDatabaseTransaction(paymentIntentId)
        await createCRMGiftFromStripeSession(event.data.object)
    } catch (e) {
        console.error(e)
    }
}