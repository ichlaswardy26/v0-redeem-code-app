"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Upload, Copy, Star } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  product_id: string
  quantity: number
  total_price: number
  status: string
  payment_proof_url?: string
  created_at: string
  products?: { name: string }
  redeem_codes?: Array<{ code: string }>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        let query = supabase.from("orders").select("*, products(name), redeem_codes(code)").eq("user_id", user.id)

        if (filterStatus !== "all") {
          query = query.eq("status", filterStatus)
        }

        const { data } = await query.order("created_at", { ascending: false })
        setOrders(data || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [supabase, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "secondary"
      case "verified":
        return "default"
      case "completed":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Menunggu Pembayaran"
      case "verified":
        return "Terverifikasi"
      case "completed":
        return "Selesai"
      case "rejected":
        return "Ditolak"
      default:
        return status
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Kode berhasil disalin!")
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pesanan Saya</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola semua pesanan Anda</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending_payment", "verified", "completed"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            onClick={() => setFilterStatus(status)}
            size="sm"
          >
            {status === "all"
              ? "Semua"
              : status === "pending_payment"
                ? "Menunggu"
                : status === "verified"
                  ? "Terverifikasi"
                  : "Selesai"}
          </Button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-12">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">Belum ada pesanan</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Order ID: {order.id.slice(0, 8)}</p>
                      <h3 className="font-bold text-lg">{order.products?.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm py-4 border-t border-b">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Jumlah</p>
                      <p className="font-semibold">{order.quantity} unit</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total</p>
                      <p className="font-semibold">Rp {order.total_price.toLocaleString("id-ID")}</p>
                    </div>
                  </div>

                  {/* Status Actions */}
                  {order.status === "pending_payment" && (
                    <Link href={`/dashboard/orders/${order.id}/upload-payment`}>
                      <Button className="w-full" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Bukti Pembayaran
                      </Button>
                    </Link>
                  )}

                  {order.status === "verified" && order.redeem_codes && (
                    <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="font-semibold text-sm">Redeem Code Anda:</p>
                      {order.redeem_codes.map((rc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-lg"
                        >
                          <code className="font-mono font-bold text-blue-600">{rc.code}</code>
                          <button
                            onClick={() => copyToClipboard(rc.code)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {order.status === "completed" && (
                    <Link href={`/dashboard/orders/${order.id}/review`}>
                      <Button variant="outline" className="w-full bg-transparent" size="sm">
                        <Star className="w-4 h-4 mr-2" />
                        Beri Review
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
