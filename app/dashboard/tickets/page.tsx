"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Ticket {
  id: string
  subject: string
  status: string
  category: string
  created_at: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from("tickets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        setTickets(data || [])
      } catch (error) {
        console.error("Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [supabase])

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tiket Bantuan</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola tiket dukungan Anda</p>
        </div>
        <Link href="/dashboard/tickets/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Tiket
          </Button>
        </Link>
      </div>

      {/* Tickets */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="pt-12">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Belum ada tiket</p>
                <Link href="/dashboard/tickets/create">
                  <Button>Buat Tiket Pertama</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold">{ticket.subject}</h3>
                        <Badge variant={ticket.status === "open" ? "default" : "secondary"}>
                          {ticket.status === "open" ? "Terbuka" : "Tertutup"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Kategori: {ticket.category}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(ticket.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
