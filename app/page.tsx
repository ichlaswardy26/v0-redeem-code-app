"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { PricingCards } from "@/components/landing/pricing-cards"
import { TestimonialsSlider } from "@/components/landing/testimonials-slider"
import { createClient } from "@/lib/supabase/client"

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setIsLoggedIn(true)
          const { data: userData } = await supabase.from("users").select("name, role").eq("id", user.id).single()

          if (userData) {
            setUserName(userData.name || user.email)
            setUserRole(userData.role)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      }
    }

    checkAuth()
  }, [supabase])

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} userName={userName} userRole={userRole} />
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <PricingCards />
        <TestimonialsSlider />
      </main>
      <Footer />
    </div>
  )
}
