import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Only admins can view users" }, { status: 403 })
    }

    const { data: users } = await supabase
      .from("users")
      .select("id, email, name, role, status, created_at")
      .order("created_at", { ascending: false })

    return NextResponse.json(users || [])
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
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
      return NextResponse.json({ error: "Only admins can manage users" }, { status: 403 })
    }

    const { userId, role, status } = await request.json()

    const updateData: Record<string, any> = {}
    if (role) updateData.role = role
    if (status) updateData.status = status

    const { data: updatedUser } = await supabase.from("users").update(updateData).eq("id", userId).select().single()

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
