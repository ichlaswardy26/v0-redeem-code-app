import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Only admins can adjust stock" }, { status: 403 })
    }

    const { product_id, quantity_change, reason } = await request.json()

    // Get current product stock
    const { data: product } = await supabase.from("products").select("stock").eq("id", product_id).single()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const newStock = product.stock + quantity_change

    if (newStock < 0) {
      return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 })
    }

    // Update product stock
    await supabase.from("products").update({ stock: newStock }).eq("id", product_id)

    // Log the change
    const { data: log } = await supabase
      .from("stock_logs")
      .insert({
        product_id,
        quantity_change,
        reason,
        changed_by: user.id,
      })
      .select()
      .single()

    return NextResponse.json(log)
  } catch (error) {
    console.error("Stock adjustment error:", error)
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Check staff/admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || !["staff", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { data: logs } = await supabase
      .from("stock_logs")
      .select("*, products(name), users(name)")
      .order("created_at", { ascending: false })

    return NextResponse.json(logs || [])
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stock logs" }, { status: 500 })
  }
}
