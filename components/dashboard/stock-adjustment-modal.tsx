"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader } from "lucide-react"

interface StockAdjustmentModalProps {
  productId: string
  productName: string
  currentStock: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function StockAdjustmentModal({
  productId,
  productName,
  currentStock,
  isOpen,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [adjustment, setAdjustment] = useState(0)
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const newStock = currentStock + adjustment

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for stock adjustment")
      return
    }

    if (adjustment === 0) {
      setError("Please enter an adjustment value")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stock-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity_change: adjustment,
          reason,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Stock adjustment failed")
      }

      onSuccess()
      setAdjustment(0)
      setReason("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to adjust stock")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock - {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <Label>Current Stock</Label>
            <Input value={currentStock} disabled />
          </div>

          <div>
            <Label>Adjustment (+/-)</Label>
            <Input
              type="number"
              placeholder="e.g., 10 or -5"
              value={adjustment || ""}
              onChange={(e) => setAdjustment(Number.parseInt(e.target.value) || 0)}
            />
            <p className="text-sm text-gray-600 mt-1">
              New Stock: {newStock} {newStock < 0 && <span className="text-red-600">(Invalid)</span>}
            </p>
          </div>

          <div>
            <Label>Reason (Required)</Label>
            <Textarea
              placeholder="e.g., Manual restock, order cancelled, inventory correction..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || newStock < 0}>
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Adjusting...
              </>
            ) : (
              "Confirm Adjustment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
