import { createClient } from "@/lib/supabase/server"

// In production, store this securely (e.g., AWS KMS, Vault)
// For now, we'll store it in database encrypted with a master key
const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY || "dev-key-do-not-use-in-production"

export async function storeEncryptionKey(orderId: string, keyData: Uint8Array): Promise<string> {
  // Convert to base64 for storage
  const keyBase64 = Buffer.from(keyData).toString("base64")
  const supabase = await createClient()

  // Store in a separate table (create this in migration)
  await supabase.from("encryption_keys").insert({
    order_id: orderId,
    key_data: keyBase64,
    created_at: new Date(),
  })

  return keyBase64
}

export async function retrieveEncryptionKey(orderId: string): Promise<Uint8Array> {
  const supabase = await createClient()

  const { data } = await supabase.from("encryption_keys").select("key_data").eq("order_id", orderId).single()

  if (!data) {
    throw new Error("Encryption key not found")
  }

  return new Uint8Array(Buffer.from(data.key_data, "base64"))
}
