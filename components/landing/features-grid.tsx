"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Lock, RotateCcw, Shield } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Instan & Cepat",
    description: "Dapatkan redeem code Anda dalam hitungan menit setelah pembayaran diverifikasi.",
  },
  {
    icon: Lock,
    title: "Keamanan End-to-End",
    description: "Enkripsi tingkat enterprise untuk melindungi data dan transaksi Anda.",
  },
  {
    icon: RotateCcw,
    title: "Sinkronisasi Real-Time",
    description: "Pantau status pesanan Anda secara real-time dengan update instan.",
  },
  {
    icon: Shield,
    title: "Terjamin 100%",
    description: "Jaminan uang kembali jika kode tidak valid atau masalah teknis.",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-16 md:py-24 px-4 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Unggulan</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Semuanya dirancang untuk memberikan pengalaman terbaik
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
