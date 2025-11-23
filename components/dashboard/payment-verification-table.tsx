"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PaymentVerificationModal from "./payment-verification-modal"

interface PendingOrder {
  id: string
  user_id: string
  product_id: string
  quantity: number
  total_price: number
  payment_proof_url: string
  created_at: string
  users?: { email: string; name: string }
  products?: { name: string }
}

export default function PaymentVerificationTable() {
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const { data } = await supabase
          .from("orders")
          .select("*, users(email, name), products(name)")
          .eq("status", "pending_payment")
          .order("created_at", { ascending: false })

        setOrders(data || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingOrders()
  }, [supabase])

  const handleVerifyClick = (order: PendingOrder) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedOrder(null)
  }

  const handleVerificationSuccess = () => {
    // Refresh orders list
    const fetchPendingOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, users(email, name), products(name)")
        .eq("status", "pending_payment")
        .order("created_at", { ascending: false })

      setOrders(data || [])
    }

    fetchPendingOrders()
    handleModalClose()
  }

  if (loading) return <div>Loading...</div>

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Payment Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.users?.name}</p>
                        <p className="text-sm text-gray-600">{order.users?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.products?.name}</TableCell>
                    <TableCell>Rp {order.total_price.toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      {order.payment_proof_url && (
                        <a
                          href={order.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleVerifyClick(order)}>
                        Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {orders.length === 0 && <div className="text-center py-8 text-gray-600">No pending verifications</div>}
        </CardContent>
      </Card>

      {selectedOrder && (
        <PaymentVerificationModal
          order={selectedOrder}
          isOpen={showModal}
          onClose={handleModalClose}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </>
  )
}
