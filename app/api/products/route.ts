import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { StorageAdapter } from "@/lib/storage/storage-adapter"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    return NextResponse.json(products || [])
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

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
      return NextResponse.json({ error: "Only admins can create products" }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const stock = Number.parseInt(formData.get("stock") as string)
    const category = formData.get("category") as string
    const imageFile = formData.get("image") as File | null

    let imageUrl = ""
    if (imageFile) {
      const settings = await supabase.from("website_settings").select("storage_type").single()

      const storageAdapter = new StorageAdapter({
        provider: (settings.data?.storage_type || "supabase") as any,
      })

      const uploadResult = await storageAdapter.upload(imageFile, "products")
      imageUrl = uploadResult.url
    }

    const { data: product } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price,
        stock,
        category,
        image_url: imageUrl,
        is_active: true,
      })
      .select()
      .single()

    return NextResponse.json(product)
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
