"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, CreditCard, Loader2, Shield } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: "pro" | "enterprise"
  onSuccess: (plan: string) => void
  userId: string
}

export function PaymentModal({ isOpen, onClose, plan, onSuccess, userId }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const planDetails = {
    pro: { name: "Pro", price: "$3", features: ["Unlimited files", "All conversion tools", "Priority support"] },
    enterprise: {
      name: "Enterprise",
      price: "$15",
      features: ["Everything in Pro", "API access", "24/7 support", "Custom integrations"],
    },
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setError("")

    try {
      // Create payment intent
      const intentResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId }),
      })

      const intentData = await intentResponse.json()

      if (!intentResponse.ok) {
        throw new Error(intentData.error)
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Confirm payment
      const confirmResponse = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: intentData.paymentIntentId,
          userId,
          plan,
        }),
      })

      const confirmData = await confirmResponse.json()

      if (confirmResponse.ok) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess(plan)
          onClose()
        }, 2000)
      } else {
        throw new Error(confirmData.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const currentPlan = planDetails[plan]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to {currentPlan.name}</DialogTitle>
          <DialogDescription>Unlock all features with our {currentPlan.name} plan</DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="text-4xl font-bold text-gray-900">{currentPlan.price}</div>
            <CardDescription>per month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Payment successful! Your plan has been upgraded.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">What's included:</h4>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Secure payment powered by Stripe</span>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing || success}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Payment Successful!
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {currentPlan.price}/month
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Cancel anytime. No hidden fees. 30-day money-back guarantee.
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
