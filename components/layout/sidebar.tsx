"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Ticket, BarChart3, Users, Settings, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const customerNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/orders", icon: ShoppingCart, label: "Pesanan Saya" },
    { href: "/dashboard/cart", icon: Package, label: "Keranjang" },
    { href: "/dashboard/tickets", icon: Ticket, label: "Tiket Bantuan" },
  ]

  const staffNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/verify-payment", icon: BarChart3, label: "Verifikasi Pembayaran" },
    { href: "/dashboard/tickets", icon: Ticket, label: "Tiket Bantuan" },
    { href: "/dashboard/reviews", icon: Package, label: "Review Produk" },
  ]

  const adminNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/products", icon: Package, label: "Manajemen Produk" },
    { href: "/dashboard/users", icon: Users, label: "Manajemen User" },
    { href: "/dashboard/stock-logs", icon: BarChart3, label: "Log Stock" },
    { href: "/dashboard/tickets", icon: Ticket, label: "Tiket Bantuan" },
    { href: "/dashboard/reviews", icon: Package, label: "Review Produk" },
    { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
  ]

  const navItems = userRole === "admin" ? adminNavItems : userRole === "staff" ? staffNavItems : customerNavItems

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <h2 className="font-bold text-lg">Dashboard</h2>
        <p className="text-xs text-gray-500 mt-1 capitalize">{userRole}</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
