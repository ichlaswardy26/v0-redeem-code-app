"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader } from "lucide-react"
import Image from "next/image"

interface Order {
  id: string
  quantity: number
  payment_proof_url: string
  products?: { name: string }
}

interface PaymentVerificationModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentVerificationModal({ order, isOpen, onClose, onSuccess }: PaymentVerificationModalProps) {
  const [codes, setCodes] = useState<string[]>(Array(order.quantity).fill(""))
  const [rejectionReason, setRejectionReason] = useState("")
  const [verificationStatus, setVerificationStatus] = useState<"approve" | "reject" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCodes, setShowCodes] = useState(true) // Show codes before submit

  const handleCodeChange = (index: number, value: string) => {
    const newCodes = [...codes]
    newCodes[index] = value
    setCodes(newCodes)
  }

  const handleSubmit = async () => {
    if (verificationStatus === null) {
      setError("Please select approve or reject")
      return
    }

    if (verificationStatus === "approve" && codes.some((c) => !c.trim())) {
      setError("Please fill in all redeem codes")
      return
    }

    if (verificationStatus === "reject" && !rejectionReason.trim()) {
      setError("Please provide a rejection reason")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${order.id}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codes: verificationStatus === "approve" ? codes : [],
          status: verificationStatus === "approve" ? "verified" : "rejected",
          rejection_reason: rejectionReason,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Verification failed")
      }

      setShowCodes(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Payment - {order.products?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Proof */}
          <div>
            <Label className="mb-2 block">Payment Proof</Label>
            {order.payment_proof_url && (
              <div className="border rounded-lg overflow-hidden">
                <Image
                  src={order.payment_proof_url || "/placeholder.svg"}
                  alt="Payment proof"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Redeem Codes Input */}
          {verificationStatus === "approve" && showCodes && (
            <div className="space-y-3">
              <Label>Redeem Codes (Visible only before submit)</Label>
              {codes.map((code, index) => (
                <div key={index}>
                  <Label className="text-xs">Code {index + 1}</Label>
                  <Input
                    placeholder={`Enter redeem code ${index + 1}`}
                    value={code}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Rejection Reason */}
          {verificationStatus === "reject" && (
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Explain why the payment is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}

          {/* Action Buttons */}
          {!verificationStatus && (
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setVerificationStatus("approve")}>
                Approve Payment
              </Button>
              <Button className="flex-1" variant="destructive" onClick={() => setVerificationStatus("reject")}>
                Reject Payment
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          {verificationStatus && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setVerificationStatus(null)
                  setError(null)
                }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
