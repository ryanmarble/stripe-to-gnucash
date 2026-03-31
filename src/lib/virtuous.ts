import * as z from 'zod'

interface VirtuousClientFetchHeaders extends Record<string, string> {
    Accept: string
    Authorization: string
    'Content-Type': string
}

class VirtuousClient {
    private baseUrl: string
    private headers: VirtuousClientFetchHeaders
    amountDenominator = 100

    // Enums
    public stateEnum = z.enum([
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", 
            "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", 
            "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", 
            "OK", "OR", "MD", "MA", "MI", "MN", "MS", "MO", "PA", "RI", 
            "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
        ])
    public currencyCodeEnum = z.enum([
        "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", 
        "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", 
        "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", 
        "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", 
        "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", 
        "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GGP", 
        "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", 
        "HTG", "HUF", "IDR", "ILS", "IMP", "INR", "IQD", "IRR", 
        "ISK", "JEP", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", 
        "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", 
        "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", 
        "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", 
        "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", 
        "OMR", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", 
        "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", 
        "SEK", "SGD", "SHP", "SLE", "SOS", "SRD", "SSP", "STN", 
        "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", 
        "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", 
        "VES", "VND", "VUV", "WST", "XAF", "XCD", "XDR", "XOF", 
        "XPF", "YER", "ZAR", "ZMW", "ZWG"
    ])
    public giftFrequencyEnum = z.enum(['Weekly', 'Bimonthly', 'Monthly', 'Quarterly', 'Semiannually', 'Annually', 'Biennially'])
    public giftTypeEnum = z.enum([
        'Cash',
        'Check',
        'Credit',
        'ElectronicFundTransfer(EFT)',
        'Cryptocoin',
        'Noncash',
        'Stock',
        'QualifiedCharitableContribution',
        'ReversingTransaction',
        'Other',
    ])

    public createContactMethodShape = z.object({
        type: z.string(),
        value: z.string(),
        isOptedIn: z.boolean(),
        isPrimary: z.boolean().default(true)
    })

    private contactMethodShape = this.createContactMethodShape.extend({
        id: z.number(),
    })

    private coreAddressShape = z.object({
        address1: z.string(),
        address2: z.string().nullable().default(null),
        city: z.string(),
        state: this.stateEnum,
        postal: z.string(),
        country: z.string(),
    })

    private createAddressShape = this.coreAddressShape.extend({
        label: z.string().default('New address'),
        isPrimary: z.boolean().default(true),
    })

    private addressShape = this.createAddressShape.extend({
        id: z.number(),
        startMonth: z.number(),
        startDay: z.number(),
        endMonth: z.number(),
        endDay: z.number(),
        createDateTimeUtc: z.coerce.date(),
        modifiedDateTimeUtc: z.coerce.date()
    })

    private customFieldShape = z.object({
        name: z.string(),
        value: z.string(),
        displayName: z.string()
    })

    public createIndividualShape = z.object({
        prefix: z.string().nullable().default(null),
        firstName: z.string().nullable().default(null),
        middleName: z.string().nullable().default(null),
        lastName: z.string().nullable().default(null),
        suffix: z.string().nullable().default(null),
        isPrimary: z.boolean().default(true),
        contactMethods: z.array(this.createContactMethodShape),
    })

    private individualShape = this.createIndividualShape.extend({
        id: z.number(),
        contactId: z.number(),
        gender: z.string().nullable(),
        contactMethods: z.array(this.contactMethodShape),
        isSecondary: z.boolean(),
        birthMonth: z.number().nullable(),
        birthDay: z.number().nullable(),
        birthYear: z.number().nullable(),
        birthDate: z.string(),
        isDeceased: z.boolean(),
        deceasedDate: z.string(),
        createDateTimeUtc: z.coerce.date(),
        modifiedDateTimeUtc: z.coerce.date(),
        customFields: z.array(this.customFieldShape),
    })

    private createContactShape = z.object({
        contactType: z.string().default('Household'),
        referenceSource: z.string().optional(),
        referenceId: z.string().optional(),
        name: z.string(),
        address: this.createAddressShape.nullable(),
        contactIndividuals: z.array(this.createIndividualShape)
    })

    private contactShape = this.createContactShape.extend({
        id: z.number(),
        informalName: z.string(),
        description: z.string().nullable(),
        website: z.string().nullable(),
        maritalStatus: z.string().nullable(),
        anniversaryMonth: z.number().nullable(),
        anniversaryDay: z.number().nullable(),
        anniversaryYear: z.number().nullable(),
        mergedIntoContactId: z.number().nullable(),
        address: this.addressShape.nullable(),
        contactIndividuals: z.array(this.individualShape)
    })

    private matchContactShape = z.object({
        referenceId: z.string().optional(),
        id: z.number().optional(),
        name: z.string().optional(),
        title: z.string().optional(),
        firstname: z.string().optional(),
        middlename: z.string().optional(),
        lastname: z.string().optional(),
        suffix: z.string().optional(),
        birthMonth: z.string().optional(),
        birthDay: z.string().optional(),
        birthYear: z.string().optional(),
        gender: z.string().optional(),
        emailType: z.string().optional(),
        email: z.string().optional(),
        phoneType: z.string().optional(),
        phone: z.string().optional(),
    })

    private matchContactWithAddressShape = this.matchContactShape.extend({
        address: this.coreAddressShape.optional(),
    })

    private matchContactShapeWithEmail = this.matchContactWithAddressShape.extend({
        email: z.string()
    })

    private matchContactShapeWithRefId = this.matchContactWithAddressShape.extend({
        referenceId: z.string()
    })

    private queueCreateContactInput = z.object({
        ...this.matchContactShape,
        ...this.coreAddressShape
    })

    private createGiftShape = z.object({
        // contactId: z.number(),
        transactionSource: z.string().nullable().default(null),
        transactionId: z.string().nullable().default(null),
        giftDate: z.date().transform((date) => date.toISOString()),
        amount: z.number(),
        giftType: this.giftTypeEnum,
        currencyCode: this.currencyCodeEnum,
        exchangeRate: z.number().default(1),
        isTaxDeductible: z.boolean().default(true),
        isRecurring: z.boolean().optional(),
        // contact: this.createContactShape
    })

    private createOneTimeGiftShape = this.createGiftShape.extend({
        isRecurring: z.literal(false),
    })

    private createRecurringGiftShape = this.createGiftShape.extend({
        isRecurring: z.literal(true),
        frequency: this.giftFrequencyEnum,
        recurringStartDate: z.coerce.date().transform((date) => date.toISOString()),
        recurringGiftId: z.number().nullable().default(null)
    })

    private createFollowupGiftShape = this.createGiftShape.extend({
        isRecurring: z.literal(undefined)
    })

    private giftShape = this.createGiftShape.extend({
        id: z.number(),
        contactId: z.number(),
        contactUrl: z.string(),
        amountFormatted: z.string(),
        batch: z.string().nullable(),
        createDateTimeUtc: z.coerce.date(),
        createdByUser: z.string(),
        modifiedDateTimeUtc: z.coerce.date(),
        modifiedByUser: z.string(),
    })

    constructor(apiKey: string, baseUrl = 'https://api.virtuoussoftware.com/api') {
        this.baseUrl = baseUrl
        this.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        }
    }

    async createContact(contact: z.input<typeof this.createContactShape>): Promise<z.infer<typeof this.contactShape>> {
        const res = await fetch(`${this.baseUrl}/Contact`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(this.createContactShape.parse(contact))
        })
        return this.contactShape.parse(await res.json())
    }

    async queueCreateContact(contact: z.input<typeof this.queueCreateContactInput>): Promise<number> {
        const res = await fetch(`${this.baseUrl}/Contact/Transaction`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(this.createContactShape.parse(contact))
        })
        return res.status
    }

    async getGiftById(id: number): Promise<z.infer<typeof this.giftShape>> {
        const res = await fetch(`${this.baseUrl}/Gift/${id}`, {
            method: 'GET',
            headers: this.headers
        })
        return this.giftShape.parse(await res.json())
    }

    public createGiftInput = z.object({
        key: z.discriminatedUnion('type', [
                z.object({
                    type: z.literal('email'),
                    value: z.string(),
                }),
                z.object({
                    type: z.literal('referenceId'),
                    value: z.string()
                })
            ],
        ),
        gift: z.discriminatedUnion('isRecurring', [this.createOneTimeGiftShape, this.createRecurringGiftShape, this.createFollowupGiftShape]),
        contact: this.createContactShape
    })

    async createGift(input: z.input<typeof this.createGiftInput>): Promise<number> {
        const parsedInput = this.createGiftInput.parse(input)
        console.log(`Searching for preexisting contact by key type ${parsedInput.key.type} [${parsedInput.key.value}]`)
        const contact = (parsedInput.key.type === 'email') ? await this.getContactByEmail(parsedInput.key.value) : await this.getContactByRefId(parsedInput.key.value)
        console.log((!contact) ? 'Contact not found, creating new Contact...' : `Contact found, id [${contact.id}]`)
        const contactId = (!contact) ? (await this.createContact(parsedInput.contact)).id : contact.id
        console.log(`Creating gift associated with Contact id [${contactId}]`)
        const res = await fetch(`${this.baseUrl}/Gift`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                ...parsedInput.gift,
                contactId
            })
        })
        console.log((res.status >= 200 && res.status < 300) ? 'Gift created successfully' : `Unable to create gift, endpoint responded with status code [${res.status}]`)
        return res.status
    }

    async getContactById(id: number): Promise<z.infer<typeof this.contactShape>> {
        const res = await fetch(`${this.baseUrl}/Contact/${id}`, {
            method: 'GET',
            headers: this.headers
        })
        return this.contactShape.parse(await res.json())
    }

    async getContactByRefId(refId: string): Promise<z.infer<typeof this.contactShape> | null> {
        const res = await fetch(`${this.baseUrl}/Contact/ByReference/StripeWebhook/${refId}`, {
            method: 'GET',
            headers: this.headers
        })
        if (res.status === 404) return null
        if (res.status < 200 || res.status >= 300) throw new Error(`Endpoint responded with an error code of ${res.status}`)
        return this.contactShape.parse(await res.json())
    }

    async getContactByEmail(email: string): Promise<z.infer<typeof this.contactShape> | null> {
        const res = await fetch(`${this.baseUrl}/Contact/Find?email=${email}`, {
            method: 'GET',
            headers: this.headers
        })
        if (res.status === 404) return null
        if (res.status < 200 || res.status >= 300) throw new Error(`Endpoint responded with an error code of ${res.status}`)
        return this.contactShape.parse(await res.json())
    }
}

export default VirtuousClient