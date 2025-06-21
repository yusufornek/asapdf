import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { sql } from "@/lib/db"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handleSuccessfulPayment(paymentIntent)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancellation(deletedSubscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const customerId = paymentIntent.customer as string
  const plan = paymentIntent.metadata.plan

  if (!plan) return

  // Find user by Stripe customer ID
  const [user] = await sql`
    SELECT id FROM users WHERE stripe_customer_id = ${customerId}
  `

  if (user) {
    // Update user plan
    await sql`
      UPDATE users 
      SET plan = ${plan}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    console.log(`Updated user ${user.id} to ${plan} plan`)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const [user] = await sql`
    SELECT id FROM users WHERE stripe_customer_id = ${customerId}
  `

  if (user) {
    // Determine plan from subscription
    const plan = subscription.items.data[0]?.price.id === process.env.STRIPE_PRO_PRICE_ID ? "pro" : "enterprise"

    // Update or insert subscription record
    await sql`
      INSERT INTO subscriptions (user_id, stripe_subscription_id, plan, status, current_period_start, current_period_end)
      VALUES (${user.id}, ${subscription.id}, ${plan}, ${subscription.status}, 
              to_timestamp(${subscription.current_period_start}), 
              to_timestamp(${subscription.current_period_end}))
      ON CONFLICT (stripe_subscription_id) 
      DO UPDATE SET 
        plan = EXCLUDED.plan,
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW()
    `

    // Update user plan
    await sql`
      UPDATE users 
      SET plan = ${plan}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    console.log(`Updated subscription for user ${user.id}`)
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const [user] = await sql`
    SELECT id FROM users WHERE stripe_customer_id = ${customerId}
  `

  if (user) {
    // Update subscription status
    await sql`
      UPDATE subscriptions 
      SET status = 'canceled', updated_at = NOW()
      WHERE stripe_subscription_id = ${subscription.id}
    `

    // Downgrade user to free plan
    await sql`
      UPDATE users 
      SET plan = 'free', updated_at = NOW()
      WHERE id = ${user.id}
    `

    console.log(`Downgraded user ${user.id} to free plan`)
  }
}
