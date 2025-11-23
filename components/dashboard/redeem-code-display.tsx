"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download, Loader, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface RedeemCodeDisplayProps {
  orderId: string
  quantity: number
}

export default function RedeemCodeDisplay({ orderId, quantity }: RedeemCodeDisplayProps) {
  const [codes, setCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/redeem-codes`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch codes")
        }

        const data = await response.json()
        setCodes(data.codes.map((c: any) => c.code))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load codes")
      } finally {
        setLoading(false)
      }
    }

    fetchCodes()
  }, [orderId])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "Copied to clipboard!" })
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  const handleDownloadPDF = async () => {
    if (codes.length === 0) {
      toast({ title: "No codes to download", variant: "destructive" })
      return
    }

    setDownloading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/redeem-codes/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes }),
      })

      if (!response.ok) throw new Error("PDF generation failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `redeem-codes-${orderId.slice(0, 8)}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast({ title: "PDF downloaded successfully!" })
    } catch (err) {
      toast({ title: "Failed to download PDF", variant: "destructive" })
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          Loading codes...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="text-blue-600 dark:text-blue-400">Your Redeem Codes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {codes.length === 0 && !error && <div className="text-center py-4 text-gray-500">No codes available</div>}

        <div className="space-y-2">
          {codes.map((code, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800"
            >
              <code className="font-mono font-bold text-blue-600 dark:text-blue-400 flex-1 break-all">{code}</code>
              <Button size="sm" variant="outline" onClick={() => handleCopy(code)} disabled={copying} className="ml-2">
                {copying ? "✓" : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          ))}
        </div>

        {quantity > 1 && codes.length > 0 && (
          <Button onClick={handleDownloadPDF} disabled={downloading} className="w-full">
            {downloading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-gray-600 dark:text-gray-400">
          {quantity === 1 ? "Use copy button to save your code" : "Download PDF for secure backup of all codes"}
        </p>
      </CardContent>
    </Card>
  )
}
