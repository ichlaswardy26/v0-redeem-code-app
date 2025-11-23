"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Plus, Minus } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface CartItem {
  id: string
  product_id: string
  quantity: number
  products?: { id: string; name: string; price: number; stock: number }
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const addProductId = searchParams.get("add")

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Add product if coming from pricing page
        if (addProductId) {
          const existingItem = await supabase
            .from("cart_items")
            .select("*")
            .eq("user_id", user.id)
            .eq("product_id", addProductId)
            .single()

          if (existingItem.data) {
            await supabase
              .from("cart_items")
              .update({ quantity: existingItem.data.quantity + 1 })
              .eq("id", existingItem.data.id)
          } else {
            await supabase.from("cart_items").insert({
              user_id: user.id,
              product_id: addProductId,
              quantity: 1,
            })
          }
        }

        // Fetch cart items
        const { data } = await supabase
          .from("cart_items")
          .select("*, products(id, name, price, stock)")
          .eq("user_id", user.id)

        setCartItems(data || [])
      } catch (error) {
        console.error("Error fetching cart:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [supabase, addProductId])

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId)
      return
    }

    const product = cartItems.find((i) => i.id === cartItemId)?.products
    if (product && newQuantity > product.stock) {
      return
    }

    try {
      await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", cartItemId)

      setCartItems(cartItems.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item)))
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  const removeItem = async (cartItemId: string) => {
    try {
      await supabase.from("cart_items").delete().eq("id", cartItemId)
      setCartItems(cartItems.filter((item) => item.id !== cartItemId))
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    setIsCheckingOut(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Create orders for each cart item
      for (const item of cartItems) {
        const product = item.products
        if (!product) continue

        const totalPrice = product.price * item.quantity

        await supabase.from("orders").insert({
          user_id: user.id,
          product_id: product.id,
          quantity: item.quantity,
          total_price: totalPrice,
          status: "pending_payment",
        })
      }

      // Clear cart
      await supabase.from("cart_items").delete().eq("user_id", user.id)

      setCartItems([])
      alert("Checkout berhasil! Silakan bayar di halaman pesanan Anda.")
    } catch (error) {
      console.error("Error during checkout:", error)
      alert("Checkout gagal, silakan coba lagi.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Keranjang Belanja</h1>
        <p className="text-gray-600 dark:text-gray-400">{cartItems.length} item di keranjang</p>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="pt-12">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Keranjang Anda kosong</p>
              <Button variant="outline">Lanjutkan Belanja</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold">{item.products?.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Rp {(item.products?.price || 0).toLocaleString("id-ID")} / unit
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Stok: {item.products?.stock || 0}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2 border border-gray-300 dark:border-slate-700 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={(item.products?.stock || 0) <= item.quantity}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pajak:</span>
                    <span>Rp 0</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                  <div className="flex justify-between font-bold mb-4">
                    <span>Total:</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || cartItems.length === 0}
                    className="w-full"
                  >
                    {isCheckingOut ? "Processing..." : "Lanjut ke Pembayaran"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
