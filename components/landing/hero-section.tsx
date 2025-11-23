"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="py-12 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Beli Redeem Code dengan <span className="text-blue-600">Mudah & Aman</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Platform terpercaya dengan sistem verifikasi pembayaran otomatis. Dapatkan kode Anda secara instan setelah
              verifikasi staff kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Belanja Sekarang <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-gray-600 dark:text-gray-400">Gambar Hero Produk</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
