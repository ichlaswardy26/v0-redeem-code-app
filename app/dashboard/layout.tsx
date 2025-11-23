"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNavbar } from "@/components/layout/bottom-navbar"
import { createClient } from "@/lib/supabase/client"
import { Loader } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          redirect("/auth/login")
        }

        const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

        if (userData?.role) {
          setUserRole(userData.role)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        redirect("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unable to load dashboard</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar userRole={userRole} />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
      <BottomNavbar userRole={userRole} />
    </div>
  )
}
