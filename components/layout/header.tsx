"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface HeaderProps {
  isLoggedIn?: boolean
  userName?: string
  userRole?: string
  cartCount?: number
}

export function Header({ isLoggedIn = false, userName, userRole, cartCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const isAdmin = userRole === "admin"
  const isStaff = userRole === "staff"

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">RC</div>
            <span>Redeem Code Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {!isLoggedIn ? (
              <>
                <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Home
                </Link>
                <Link href="/#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Fitur
                </Link>
                <Link href="/#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Harga
                </Link>
                <Link href="/#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Testimoni
                </Link>
              </>
            ) : isAdmin || isStaff ? (
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Home
                </Link>
                <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Produk
                </Link>
                <Link href="/cart" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Keranjang ({cartCount})
                </Link>
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {!isLoggedIn ? (
              <div className="hidden sm:flex gap-2">
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Register</Button>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{userName}</span>
                <button onClick={handleLogout} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-slate-800">
            <div className="flex flex-col gap-4">
              {!isLoggedIn ? (
                <>
                  <Link href="/" className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    Home
                  </Link>
                  <Link href="/#features" className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    Fitur
                  </Link>
                  <Link href="/#pricing" className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    Harga
                  </Link>
                  <Link href="/#testimonials" className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    Testimoni
                  </Link>
                  <div className="flex gap-2 px-4 pt-4">
                    <Link href="/auth/login" className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" className="flex-1">
                      <Button className="w-full">Register</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="px-4 py-2 text-red-600 dark:text-red-400 text-left">
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
