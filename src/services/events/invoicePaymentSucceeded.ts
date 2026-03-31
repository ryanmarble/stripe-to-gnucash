import Stripe from "stripe";
import { createCRMGiftFromStripeInvoice } from "utils/createCRMGift.js";
import createDatabaseTransaction from "utils/createDatabaseTransaction.js";

export default async function invoicePaymentSucceededHandler(
	event: Stripe.InvoicePaymentSucceededEvent
): Promise<void> {
	try {
        const invoice = event.data.object as Stripe.Invoice & { payment_intent?: string | Stripe.PaymentIntent }
        if (!invoice.payment_intent) throw new Error('Stripe Payment Intent object not found on Invoice')
        const paymentIntentId = (typeof invoice.payment_intent !== 'string') ? invoice.payment_intent.id : invoice.payment_intent
        await createDatabaseTransaction(paymentIntentId)
        await createCRMGiftFromStripeInvoice({...invoice, payment_intent: paymentIntentId})
    } catch (e) {
        console.error(e)
    }
}