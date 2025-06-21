import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"
import { createCustomer, createPaymentIntent, STRIPE_PLANS } from "@/lib/stripe"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = await verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { plan } = await request.json()

    if (!STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    let customerId = user.stripeCustomerId

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      customerId = await createCustomer(user.email, user.name)

      // Update user with Stripe customer ID
      await sql`
        UPDATE users 
        SET stripe_customer_id = ${customerId}
        WHERE id = ${userId}
      `
    }

    // Create payment intent
    const { clientSecret, paymentIntentId } = await createPaymentIntent(customerId, plan)

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      amount: STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS].amount,
    })
  } catch (error) {
    console.error("Payment intent creation error:", error)
    return NextResponse.json({ error: "Payment setup failed" }, { status: 500 })
  }
}
