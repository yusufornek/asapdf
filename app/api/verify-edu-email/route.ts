import { type NextRequest, NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/email"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, action, code } = await request.json()

    if (action === "send-code") {
      // Check if email is .edu
      if (!email.endsWith(".edu")) {
        return NextResponse.json({ error: "Only .edu emails are eligible for free Pro access" }, { status: 400 })
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      // Store code in database
      await sql`
        INSERT INTO email_verifications (email, code, expires_at)
        VALUES (${email}, ${verificationCode}, NOW() + INTERVAL '10 minutes')
      `

      // Send verification email
      const emailSent = await sendVerificationEmail(email, verificationCode)

      if (!emailSent) {
        return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email",
      })
    }

    if (action === "verify-code") {
      // Verify code
      const [verification] = await sql`
        SELECT id, email, verified, expires_at
        FROM email_verifications
        WHERE email = ${email} AND code = ${code} AND verified = false
        ORDER BY created_at DESC
        LIMIT 1
      `

      if (!verification) {
        return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
      }

      if (new Date() > new Date(verification.expires_at)) {
        return NextResponse.json({ error: "Verification code has expired" }, { status: 400 })
      }

      // Mark as verified
      await sql`
        UPDATE email_verifications
        SET verified = true
        WHERE id = ${verification.id}
      `

      // Update user if they exist
      await sql`
        UPDATE users
        SET edu_verified = true, plan = 'pro'
        WHERE email = ${email}
      `

      return NextResponse.json({
        success: true,
        message: "Email verified successfully! Pro access granted.",
        proAccess: true,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
