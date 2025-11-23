"use client"

import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">Tentang Kami</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Platform terpercaya untuk membeli redeem code dengan sistem verifikasi pembayaran yang aman dan
              transparan.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Kontak</h3>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href="mailto:support@redeemcode.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <Mail className="w-4 h-4" /> support@redeemcode.com
              </a>
              <a href="tel:+62123456789" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <Phone className="w-4 h-4" /> +62 (123) 456-789
              </a>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" /> Indonesia
              </div>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-bold text-lg mb-4">Kebijakan</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="#" className="text-gray-400 hover:text-white">
                Syarat & Ketentuan
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                Kebijakan Privasi
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                Kebijakan Pengembalian
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">Ikuti Kami</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 text-sm">Copyright © 2025 Redeem Code Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
