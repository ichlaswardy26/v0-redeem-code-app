"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Ticket, BarChart3, Users, Settings, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface BottomNavbarProps {
  userRole: string
}

export function BottomNavbar({ userRole }: BottomNavbarProps) {
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
    { href: "/dashboard/orders", icon: ShoppingCart, label: "Pesanan" },
    { href: "/dashboard/cart", icon: Package, label: "Keranjang" },
    { href: "/dashboard/tickets", icon: Ticket, label: "Tiket" },
  ]

  const staffNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/staff/verify-payment", icon: BarChart3, label: "Verifikasi" },
    { href: "/dashboard/tickets", icon: Ticket, label: "Tiket" },
  ]

  const adminNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/admin/products", icon: Package, label: "Produk" },
    { href: "/dashboard/admin/users", icon: Users, label: "User" },
    { href: "/dashboard/admin/settings", icon: Settings, label: "Pengaturan" },
  ]

  const navItems = userRole === "admin" ? adminNavItems : userRole === "staff" ? staffNavItems : customerNavItems

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 z-40">
      <div className="flex items-center justify-around h-20">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 flex-1 transition-colors text-center",
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-3 py-2 flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-center"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs whitespace-nowrap">Logout</span>
        </button>
      </div>
    </nav>
  )
}
