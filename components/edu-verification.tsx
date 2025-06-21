"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Check, Loader2, GraduationCap } from "lucide-react"

interface EduVerificationProps {
  onVerified: () => void
}

export function EduVerification({ onVerified }: EduVerificationProps) {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const sendVerificationCode = async () => {
    if (!email.endsWith(".edu")) {
      setError("Please enter a valid .edu email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verify-edu-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "send-code" }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Verification code sent to ${email}`)
        setStep("code")
        // For demo purposes, show the code
        if (data.code) {
          setMessage(`Verification code sent! For demo: ${data.code}`)
        }
      } else {
        setError(data.error || "Failed to send verification code")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit verification code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verify-edu-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, action: "verify-code" }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Email verified! You now have free Pro access!")
        setTimeout(() => {
          onVerified()
        }, 2000)
      } else {
        setError(data.error || "Invalid verification code")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">Student/Educator Access</CardTitle>
        <CardDescription>Get free Pro access with your .edu email address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {step === "email" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edu-email">Educational Email Address</Label>
              <Input
                id="edu-email"
                type="email"
                placeholder="your.name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">Must be a valid .edu email address</p>
            </div>
            <Button onClick={sendVerificationCode} disabled={isLoading || !email} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Verification Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1 text-center text-2xl tracking-widest"
                maxLength={6}
              />
              <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code sent to {email}</p>
            </div>
            <Button onClick={verifyCode} disabled={isLoading || code.length !== 6} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Verify & Get Pro Access
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setStep("email")} className="w-full">
              Change Email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
