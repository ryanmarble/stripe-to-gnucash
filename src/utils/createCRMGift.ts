import Stripe from "stripe";
import VirtuousClient from "lib/virtuous.js";
import i18n from "i18n-iso-countries"; 
import { parseCompoundNames, combineParsedNames } from "./parseCompoundNames.js";
import * as z from 'zod'

export async function createCRMGiftFromStripeSession(
	session: Stripe.Checkout.Session
): Promise<void> {
    const virtuousClient = new VirtuousClient(process.env.VIRTUOUS_API_KEY!)
    const addressRequriedProps = z.object({
        city: z.string(),
        country: z.string().transform((s) => i18n.getName(s, 'en')),
        line1: z.string(),
        line2: z.string().nullable(),
        postal_code: z.string(),
        state: virtuousClient.stateEnum
    })
    const checkoutSessionRequiredProps = z.object({
        payment_intent: z.coerce.string(),
        created: z.number().transform((n) => new Date(n * 1000)),
        amount_total: z.number(),
        currency: z.string().toUpperCase().pipe(virtuousClient.currencyCodeEnum),
        customer: z.string().or(z.object({ id: z.string() }).transform(obj => obj.id)),
        customer_details: z.object({
            address: addressRequriedProps,
            business_name: z.string().nullable(),
            email: z.string(),
            individual_name: z.string().nullable(),
            name: z.string(),
            phone: z.string().nullable(),
        }),
        shipping: z.object({
            address: addressRequriedProps
        }).nullable(),
        mode: z.enum(['payment', 'subscription']),
        subscription: z.coerce.string().nullable()
    })
    const { success, data: checkoutData, error }  = checkoutSessionRequiredProps.safeParse(session)
    if (!success) throw new Error(`Error parsing webhook payload, ${error.message}`)
    const customerNameData = parseCompoundNames(checkoutData.customer_details.name)
    const primaryContactMethods: z.input<typeof virtuousClient.createContactMethodShape>[] = [{
        type: 'Email',
        value: checkoutData.customer_details.email,
        isOptedIn: true
    }]
    if (checkoutData.customer_details.phone) primaryContactMethods.push({
        type: 'Phone',
        value: checkoutData.customer_details.phone,
        isOptedIn: true
    })
    const statusCode = await virtuousClient.createGift({
        key: { type: 'email', value: checkoutData.customer_details.email },
        gift: {
            transactionSource: 'StripeWebhook',
            transactionId: checkoutData.payment_intent,
            giftDate: checkoutData.created,
            amount: checkoutData.amount_total / virtuousClient.amountDenominator,
            giftType: virtuousClient.giftTypeEnum.enum.Credit,
            currencyCode: checkoutData.currency,
            isRecurring: undefined
        },
        contact: {
            referenceSource: 'StripeWebhook',
            referenceId: checkoutData.customer,
            name: combineParsedNames(customerNameData),
            address: {
                address1: checkoutData.customer_details.address.line1,
                address2: checkoutData.customer_details.address.line2,
                city: checkoutData.customer_details.address.city,
                postal: checkoutData.customer_details.address.postal_code,
                state: checkoutData.customer_details.address.state,
                country: checkoutData.customer_details.address.country ?? 'US'
            },
            contactIndividuals: customerNameData.map((name, index) => ({
                prefix: name.title,
                firstName: name.first,
                middleName: name.middle,
                lastName: name.last,
                suffix: name.suffix,
                isPrimary: (index === 0),
                contactMethods: (index === 0) ? primaryContactMethods : []
            } satisfies z.input<typeof virtuousClient.createIndividualShape>))
        }
    })
    if (statusCode < 200 || statusCode >= 300) throw new Error(`Virtuous API endpoint responded with an error code of ${statusCode}`)
    console.log(`Virtuous gift created for Checkout Session [${session.id}]`)
}

export async function createCRMGiftFromStripeInvoice(invoice: Stripe.Invoice & { payment_intent: string }) {
    const virtuousClient = new VirtuousClient(process.env.VIRTUOUS_API_KEY!)
    const addressRequriedProps = z.object({
        city: z.string(),
        country: z.string().transform((s) => i18n.getName(s, 'en')),
        line1: z.string(),
        line2: z.string().nullable(),
        postal_code: z.string(),
        state: virtuousClient.stateEnum
    })
    const invoiceRequiredProps = z.object({
        id: z.string(),
        payment_intent: z.string().or(z.object({ id: z.string() }).transform(obj => obj.id)),
        finalized_at: z.number().transform((n) => new Date(n * 1000)),
        amount_paid: z.number(),
        currency: z.string().toUpperCase().pipe(virtuousClient.currencyCodeEnum),
        customer: z.string().or(z.object({ id: z.string() }).transform(obj => obj.id)),
        customer_email: z.string().nullable(),
        customer_name: z.string(),
        customer_phone: z.string().nullable(),
        customer_address: addressRequriedProps.nullable(),
        status: z.enum(['draft', 'open', 'paid', 'uncollectible', 'void'])
    })
    const { success, data: invoiceData, error }  = invoiceRequiredProps.safeParse(invoice)
    if (!success) throw new Error(`Error parsing webhook payload, ${error.message}`)
    const customerNameData = parseCompoundNames(invoiceData.customer_name)
    const primaryContactMethods: z.input<typeof virtuousClient.createContactMethodShape>[] = []
    if (invoiceData.customer_email) primaryContactMethods.push({
        type: 'Email',
        value: invoiceData.customer_email,
        isOptedIn: true
    })
    if (invoiceData.customer_phone) primaryContactMethods.push({
        type: 'Phone',
        value: invoiceData.customer_phone,
        isOptedIn: true
    })
    const statusCode = await virtuousClient.createGift({
        key: { type: (invoiceData.customer_email) ? 'email' : 'referenceId', value: invoiceData.customer_email ?? invoiceData.customer },
        contact: {
            name: invoiceData.customer_name,
            address: (invoiceData.customer_address) ? {
                address1: invoiceData.customer_address.line1,
                address2: invoiceData.customer_address.line2,
                city: invoiceData.customer_address.city,
                postal: invoiceData.customer_address.postal_code,
                state: invoiceData.customer_address.state,
                country: invoiceData.customer_address.country ?? 'US'
            } : null,
            contactIndividuals: customerNameData.map((name, index) => ({
                prefix: name.title,
                firstName: name.first,
                middleName: name.middle,
                lastName: name.last,
                suffix: name.suffix,
                isPrimary: (index === 0),
                contactMethods: (index === 0) ? primaryContactMethods : []
            } satisfies z.input<typeof virtuousClient.createIndividualShape>))
        },
        gift: {
            transactionSource: 'StripeWebhook',
            transactionId: invoiceData.payment_intent,
            giftDate: invoiceData.finalized_at,
            amount: invoiceData.amount_paid / virtuousClient.amountDenominator,
            giftType: 'Credit',
            currencyCode: invoiceData.currency,
            isRecurring: undefined
        }
    })
    if (statusCode < 200 || statusCode >= 300) throw new Error(`Virtuous API endpoint responded with an error code of ${statusCode}`)
    console.log(`Virtuous gift created for Invoice [${invoice.id}] | Payment Intent [${invoiceData.payment_intent}]`)
}