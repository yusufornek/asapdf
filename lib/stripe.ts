import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    amount: 300, // $3.00
    name: "Pro Plan",
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    amount: 1500, // $15.00
    name: "Enterprise Plan",
  },
}

export async function createCustomer(email: string, name: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      source: "asapdf",
    },
  })

  return customer.id
}

export async function createPaymentIntent(
  customerId: string,
  plan: "pro" | "enterprise",
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const planConfig = STRIPE_PLANS[plan]

  const paymentIntent = await stripe.paymentIntents.create({
    amount: planConfig.amount,
    currency: "usd",
    customer: customerId,
    metadata: {
      plan,
      planName: planConfig.name,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  }
}

export async function createSubscription(customerId: string, plan: "pro" | "enterprise"): Promise<Stripe.Subscription> {
  const planConfig = STRIPE_PLANS[plan]

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: planConfig.priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  })

  return subscription
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.cancel(subscriptionId)
}

export async function getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  })

  return subscriptions.data
}

export { stripe }
