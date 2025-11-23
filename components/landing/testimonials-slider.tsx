"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment: string
  users?: { name: string; avatar_url?: string }
  products?: { name: string }
}

export function TestimonialsSlider() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, rating, comment, users(name, avatar_url), products(name)")
          .eq("orders.status", "completed")
          .limit(6)
          .order("created_at", { ascending: false })

        if (error) throw error
        setReviews(data || [])
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [supabase])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (reviews.length || 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + (reviews.length || 1)) % (reviews.length || 1))
  }

  if (loading || reviews.length === 0) {
    return (
      <section id="testimonials" className="py-16 md:py-24 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Testimoni Pelanggan</h2>
          <p className="text-gray-600 dark:text-gray-400">Belum ada testimoni</p>
        </div>
      </section>
    )
  }

  const visibleReviews = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1
  const displayedReviews = reviews.slice(currentIndex, currentIndex + visibleReviews)

  return (
    <section id="testimonials" className="py-16 md:py-24 px-4 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Testimoni Pelanggan</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Ribuan pelanggan puas dengan layanan kami</p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{review.users?.name || "Anonymous"}</p>
                      <p className="text-sm text-gray-500">Membeli: {review.products?.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reviews.length > visibleReviews && (
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={prevSlide}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                {[...Array(Math.ceil(reviews.length / visibleReviews))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i * visibleReviews)}
                    className={`w-2 h-2 rounded-full transition ${
                      i === Math.floor(currentIndex / visibleReviews) ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
