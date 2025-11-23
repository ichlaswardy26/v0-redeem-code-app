import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"
import fs from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string
    const storageProvider = request.headers.get("X-Storage-Provider") || "supabase"
    const storagePath = request.headers.get("X-Storage-Path")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]

    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 5MB" }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, PDF allowed" }, { status: 400 })
    }

    let url = ""
    const timestamp = Date.now()
    const filename = `${folder}/${timestamp}-${file.name}`

    if (storageProvider === "supabase") {
      const arrayBuffer = await file.arrayBuffer()
      const { data, error } = await supabase.storage.from("uploads").upload(filename, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      })

      if (error) throw error
      const { data: publicData } = supabase.storage.from("uploads").getPublicUrl(data.path)
      url = publicData.publicUrl
    } else if (storageProvider === "vercel_blob") {
      const arrayBuffer = await file.arrayBuffer()
      const blob = await put(filename, Buffer.from(arrayBuffer), {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      url = blob.url
    } else if (storageProvider === "cloudinary") {
      const formDataCloudinary = new FormData()
      formDataCloudinary.append("file", file)
      formDataCloudinary.append("folder", folder)
      formDataCloudinary.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "redeem_code_app")

      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: formDataCloudinary,
      })

      const data = await response.json()
      url = data.secure_url
    } else if (storageProvider === "local") {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", folder)
      await fs.mkdir(uploadsDir, { recursive: true })

      const filepath = path.join(uploadsDir, filename.split("/").pop()!)
      const arrayBuffer = await file.arrayBuffer()
      await fs.writeFile(filepath, Buffer.from(arrayBuffer))

      url = `/uploads/${folder}/${filename.split("/").pop()}`
    }

    return NextResponse.json({
      url,
      filename: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("Storage upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
