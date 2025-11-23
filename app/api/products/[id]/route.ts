import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { StorageAdapter } from "@/lib/storage/storage-adapter"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update products" }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const category = formData.get("category") as string
    const isActive = formData.get("is_active") === "true"
    const imageFile = formData.get("image") as File | null

    let imageUrl: string | undefined
    if (imageFile) {
      const settings = await supabase.from("website_settings").select("storage_type").single()

      const storageAdapter = new StorageAdapter({
        provider: (settings.data?.storage_type || "supabase") as any,
      })

      const uploadResult = await storageAdapter.upload(imageFile, "products")
      imageUrl = uploadResult.url
    }

    const updateData: Record<string, any> = { name, description, price, category, is_active: isActive }
    if (imageUrl) updateData.image_url = imageUrl

    const { data: product } = await supabase.from("products").update(updateData).eq("id", params.id).select().single()

    return NextResponse.json(product)
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete products" }, { status: 403 })
    }

    await supabase.from("products").delete().eq("id", params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Product delete error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
