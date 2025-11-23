import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { generateRedeemCodePDF } from "@/lib/pdf/redeem-code-pdf"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { codes } = await request.json()

    if (!Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: "No codes provided" }, { status: 400 })
    }

    // Get order details
    const { data: order } = await supabase.from("orders").select("*, products(name)").eq("id", params.id).single()

    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Generate PDF
    const pdfBlob = await generateRedeemCodePDF(
      codes,
      order.products?.name || "Redeem Codes",
      new Date(order.created_at).toLocaleDateString("id-ID"),
    )

    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="redeem-codes-${params.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
