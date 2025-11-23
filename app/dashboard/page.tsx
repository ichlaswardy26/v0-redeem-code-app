"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart, Ticket, TrendingUp, Users, AlertCircle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardStats {
  totalOrders: number
  totalSpent: number
  openTickets: number
  userRole: string
  // Admin stats
  totalRevenue?: number
  totalUsers?: number
  lowStockProducts?: number
  revenueData?: Array<{ date: string; revenue: number }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    openTickets: 0,
    userRole: "customer",
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

        if (userData?.role === "admin") {
          // Admin dashboard stats
          const { data: ordersData } = await supabase
            .from("orders")
            .select("total_price, created_at")
            .eq("status", "verified")

          const { data: usersData } = await supabase.from("users").select("id").neq("role", "customer")

          const { data: productsData } = await supabase.from("products").select("id").lt("stock", 10)

          const { data: ticketsData } = await supabase.from("tickets").select("id").eq("status", "open")

          // Calculate daily revenue for last 7 days
          const revenueData: Record<string, number> = {}
          const today = new Date()
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            revenueData[date.toISOString().split("T")[0]] = 0
          }

          ordersData?.forEach((order) => {
            const dateStr = new Date(order.created_at).toISOString().split("T")[0]
            if (revenueData[dateStr] !== undefined) {
              revenueData[dateStr] += order.total_price || 0
            }
          })

          setStats({
            totalOrders: ordersData?.length || 0,
            totalSpent: ordersData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
            openTickets: ticketsData?.length || 0,
            userRole: userData.role,
            totalRevenue: ordersData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
            totalUsers: usersData?.length || 0,
            lowStockProducts: productsData?.length || 0,
            revenueData: Object.entries(revenueData).map(([date, revenue]) => ({ date, revenue })),
          })
        } else if (userData?.role === "staff") {
          // Staff dashboard stats
          const { data: pendingOrders } = await supabase.from("orders").select("id").eq("status", "pending_payment")

          const { data: openTickets } = await supabase.from("tickets").select("id").eq("status", "open")

          setStats({
            totalOrders: pendingOrders?.length || 0,
            totalSpent: 0,
            openTickets: openTickets?.length || 0,
            userRole: userData.role,
          })
        } else {
          // Customer dashboard stats
          const { data: ordersData } = await supabase.from("orders").select("total_price").eq("user_id", user.id)

          const { data: ticketsData } = await supabase
            .from("tickets")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "open")

          setStats({
            totalOrders: ordersData?.length || 0,
            totalSpent: ordersData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
            openTickets: ticketsData?.length || 0,
            userRole: userData?.role || "customer",
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {stats.userRole === "admin"
            ? "System Overview"
            : stats.userRole === "staff"
              ? "Verification Dashboard"
              : "Selamat datang kembali"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className={cn("gap-6", stats.userRole === "admin" ? "grid md:grid-cols-4" : "grid md:grid-cols-3")}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {stats.userRole === "admin"
                ? "Total Revenue"
                : stats.userRole === "staff"
                  ? "Pending Orders"
                  : "Total Orders"}
            </CardTitle>
            {stats.userRole === "admin" ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            )}
          </CardHeader>
          <CardContent>
            {stats.userRole === "admin" ? (
              <p className="text-2xl font-bold">Rp {stats.totalRevenue?.toLocaleString("id-ID")}</p>
            ) : (
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{stats.userRole === "admin" ? "Verified orders" : "Active"}</p>
          </CardContent>
        </Card>

        {stats.userRole !== "staff" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stats.userRole === "admin" ? "Total Users" : "Total Belanja"}
              </CardTitle>
              {stats.userRole === "admin" ? (
                <Users className="w-4 h-4 text-purple-600" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-600" />
              )}
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {stats.userRole === "admin" ? stats.totalUsers : `Rp ${stats.totalSpent.toLocaleString("id-ID")}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.userRole === "admin" ? "Staff & Admin" : "Total pengeluaran"}
              </p>
            </CardContent>
          </Card>
        )}

        {stats.userRole === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.lowStockProducts}</p>
              <p className="text-xs text-gray-500 mt-1">{"< 10 units"}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {stats.userRole === "admin" ? "Open Tickets" : "Tiket Terbuka"}
            </CardTitle>
            <Ticket className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.openTickets}</p>
            <p className="text-xs text-gray-500 mt-1">Aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Revenue Chart */}
      {stats.userRole === "admin" && stats.revenueData && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Last 7 Days</CardTitle>
            <CardDescription>Daily revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {stats.userRole === "customer" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Kelola pesanan dan keranjang Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full bg-transparent">
                    Lihat Pesanan
                  </Button>
                </Link>
                <Link href="/dashboard/cart">
                  <Button variant="outline" className="w-full bg-transparent">
                    Keranjang Belanja
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bantuan</CardTitle>
                <CardDescription>Hubungi kami jika ada pertanyaan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/tickets">
                  <Button variant="outline" className="w-full bg-transparent">
                    Buat Tiket Bantuan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {stats.userRole === "staff" && (
          <Card>
            <CardHeader>
              <CardTitle>Verifikasi Pembayaran</CardTitle>
              <CardDescription>Proses pesanan yang menunggu verifikasi</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/staff/verify-payment">
                <Button className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Buka Verifikasi
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {stats.userRole === "admin" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Produk</CardTitle>
                <CardDescription>Kelola katalog dan stok produk</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/admin/products">
                  <Button variant="outline" className="w-full bg-transparent">
                    Lihat Produk
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Sistem</CardTitle>
                <CardDescription>Konfigurasi website dan storage</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/admin/settings">
                  <Button variant="outline" className="w-full bg-transparent">
                    Buka Pengaturan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
