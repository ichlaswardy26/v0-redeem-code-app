import SettingsForm from "@/components/dashboard/settings-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Website Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your website and configure storage</p>
      </div>

      <SettingsForm />
    </div>
  )
}
