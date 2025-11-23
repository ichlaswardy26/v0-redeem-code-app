import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { encryptRedeemedCode, generateEncryptionKey } from "@/lib/crypto/encryption"
import { sendEmail } from "@/lib/email/email-service"
import { storeEncryptionKey } from "@/lib/crypto/key-manager"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || !["staff", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Only staff/admin can verify" }, { status: 403 })
    }

    const { codes, status, rejection_reason } = await request.json()

    if (!Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: "Invalid codes array" }, { status: 400 })
    }

    const { data: order } = await supabase
      .from("orders")
      .select("*, products(name), users(email)")
      .eq("id", params.id)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (status === "verified" && codes.length !== order.quantity) {
      return NextResponse.json({ error: `You must provide exactly ${order.quantity} redeem codes` }, { status: 400 })
    }

    if (status === "verified") {
      const encryptionKey = generateEncryptionKey()

      for (const code of codes) {
        const encryptedCode = encryptRedeemedCode(code, encryptionKey)

        await supabase.from("redeem_codes").insert({
          order_id: params.id,
          code: encryptedCode,
          is_used: false,
        })
      }

      await storeEncryptionKey(params.id, encryptionKey)

      const newStock = order.products.stock - order.quantity
      await supabase.from("products").update({ stock: newStock }).eq("id", order.product_id)

      await supabase.from("stock_logs").insert({
        product_id: order.product_id,
        quantity_change: -order.quantity,
        reason: `Order #${params.id} verified`,
        changed_by: user.id,
      })

      await sendEmail({
        to: order.users?.email || "",
        subject: "Payment Verified - Your Redeem Codes Ready",
        type: "payment_verified",
        data: {
          orderId: params.id.slice(0, 8),
          productName: order.products.name,
        },
      })
    } else if (status === "rejected") {
      await sendEmail({
        to: order.users?.email || "",
        subject: "Payment Could Not Be Verified",
        type: "payment_rejected",
        data: {
          orderId: params.id.slice(0, 8),
          reason: rejection_reason,
        },
      })
    }

    await supabase
      .from("orders")
      .update({ status, ...(rejection_reason && { rejection_reason }) })
      .eq("id", params.id)

    return NextResponse.json({
      success: true,
      message: `Order ${status} successfully`,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
