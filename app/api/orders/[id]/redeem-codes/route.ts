import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { decryptRedeemedCode } from "@/lib/crypto/encryption"
import { retrieveEncryptionKey } from "@/lib/crypto/key-manager"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get order and verify ownership
    const { data: order } = await supabase.from("orders").select("*, products(name)").eq("id", params.id).single()

    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "verified") {
      return NextResponse.json({ error: "Redeem codes not available yet" }, { status: 403 })
    }

    // Get redeem codes
    const { data: redeemCodes } = await supabase.from("redeem_codes").select("*").eq("order_id", params.id)

    if (!redeemCodes || redeemCodes.length === 0) {
      return NextResponse.json({
        codes: [],
        quantity: order.quantity,
        productName: order.products?.name,
        orderDate: order.created_at,
      })
    }

    // Retrieve encryption key and decrypt codes
    try {
      const encryptionKey = await retrieveEncryptionKey(params.id)
      const decryptedCodes = redeemCodes.map((item) => ({
        ...item,
        code: decryptRedeemedCode(item.code, encryptionKey),
      }))

      return NextResponse.json({
        codes: decryptedCodes,
        quantity: order.quantity,
        productName: order.products?.name,
        orderDate: order.created_at,
      })
    } catch (decryptError) {
      console.error("Decryption error:", decryptError)
      return NextResponse.json({ error: "Could not decrypt codes" }, { status: 500 })
    }
  } catch (error) {
    console.error("Redeem code fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch redeem codes" }, { status: 500 })
  }
}
