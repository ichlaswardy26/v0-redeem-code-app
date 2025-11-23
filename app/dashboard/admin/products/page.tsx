import ProductManagementTable from "@/components/dashboard/product-management-table"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminProductsPage() {
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
        <h1 className="text-3xl font-bold mb-2">Product Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Add, edit, and manage your redeem code products</p>
      </div>

      <ProductManagementTable />
    </div>
  )
}
