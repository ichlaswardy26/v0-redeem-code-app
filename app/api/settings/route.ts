import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    let { data: settings } = await supabase.from("website_settings").select("*").single()

    // Create default if doesn't exist
    if (!settings) {
      const { data: newSettings } = await supabase
        .from("website_settings")
        .insert({
          storage_type: "supabase",
          primary_color: "#3b82f6",
          secondary_color: "#1f2937",
        })
        .select()
        .single()

      settings = newSettings
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update settings" }, { status: 403 })
    }

    const updateData = await request.json()

    if (updateData.cloudinary_cloud_name) {
      // Only allow storing cloud name publicly
      updateData.cloudinary_api_key = undefined
      updateData.cloudinary_api_secret = undefined
    }

    let { data: settings } = await supabase.from("website_settings").select("*").single()

    if (!settings) {
      const { data: newSettings } = await supabase.from("website_settings").insert(updateData).select().single()

      settings = newSettings
    } else {
      const { data: updatedSettings } = await supabase
        .from("website_settings")
        .update(updateData)
        .eq("id", settings.id)
        .select()
        .single()

      settings = updatedSettings
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
