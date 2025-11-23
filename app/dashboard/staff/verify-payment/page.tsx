import PaymentVerificationTable from "@/components/dashboard/payment-verification-table"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function StaffVerifyPaymentPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userData || !["staff", "admin"].includes(userData.role)) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payment Verification</h1>
        <p className="text-gray-600 dark:text-gray-400">Verify customer payments and input redeem codes</p>
      </div>

      <PaymentVerificationTable />
    </div>
  )
}
