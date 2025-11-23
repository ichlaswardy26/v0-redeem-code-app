"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category?: string
}

export function PricingCards() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Check auth status
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setIsLoggedIn(!!user)

        // Fetch products
        const { data, error } = await supabase.from("products").select("*").eq("is_active", true).limit(6)

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [supabase])

  const handleBuyClick = (productId: string) => {
    if (!isLoggedIn) {
      router.push("/auth/login")
    } else {
      router.push(`/cart?add=${productId}`)
    }
  }

  if (loading) {
    return (
      <section id="pricing" className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Harga Redeem Code</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Pilih paket yang sesuai dengan kebutuhan Anda</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Belum ada produk tersedia</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle>{product.name}</CardTitle>
                    <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                      {product.stock > 0 ? `${product.stock} tersedia` : "Habis"}
                    </Badge>
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-6">
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-blue-600">Rp {product.price.toLocaleString("id-ID")}</p>
                    {product.category && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Kategori: {product.category}</p>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-4 pt-4 border-t">
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Instan dikirim</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Dijamin 100% valid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Support 24/7</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleBuyClick(product.id)}
                      disabled={product.stock === 0}
                      className="w-full mt-auto"
                    >
                      {product.stock > 0 ? "Beli Sekarang" : "Stok Habis"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
