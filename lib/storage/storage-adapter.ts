type StorageProvider = "supabase" | "vercel_blob" | "cloudinary" | "local"

interface StorageConfig {
  provider: StorageProvider
  supabase?: {
    bucket: string
  }
  vercel?: {
    token: string
  }
  cloudinary?: {
    cloudName: string
    apiKey: string
    apiSecret: string
  }
  local?: {
    basePath: string
  }
}

interface UploadResult {
  url: string
  filename: string
  size: number
  provider: StorageProvider
}

export class StorageAdapter {
  private config: StorageConfig

  constructor(config: StorageConfig) {
    if (!config.provider) {
      config.provider = "supabase"
    }

    // Inject environment variables for sensitive data
    if (config.provider === "vercel" && !config.vercel?.token) {
      config.vercel = {
        token: process.env.BLOB_READ_WRITE_TOKEN || "",
      }
    }

    if (config.provider === "cloudinary" && !config.cloudinary) {
      config.cloudinary = {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        apiKey: process.env.CLOUDINARY_API_KEY || "",
        apiSecret: process.env.CLOUDINARY_API_SECRET || "",
      }
    }

    this.config = config
  }

  async upload(file: File, folder: string): Promise<UploadResult> {
    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]

    if (file.size > maxSize) {
      throw new Error("File size exceeds 5MB limit")
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, and PDF files are allowed")
    }

    switch (this.config.provider) {
      case "supabase":
        return this.uploadToSupabase(file, folder)
      case "vercel_blob":
        return this.uploadToVercelBlob(file, folder)
      case "cloudinary":
        return this.uploadToCloudinary(file, folder)
      case "local":
        return this.uploadToLocal(file, folder)
      default:
        throw new Error(`Unknown storage provider: ${this.config.provider}`)
    }
  }

  private async uploadToSupabase(file: File, folder: string): Promise<UploadResult> {
    const formData = new FormData()
    const timestamp = Date.now()
    const filename = `${folder}/${timestamp}-${file.name}`

    formData.append("file", file)

    const response = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
      headers: {
        "X-Storage-Provider": "supabase",
        "X-Storage-Path": filename,
      },
    })

    if (!response.ok) throw new Error("Supabase upload failed")

    const data = await response.json()
    return {
      url: data.url,
      filename: data.filename,
      size: file.size,
      provider: "supabase",
    }
  }

  private async uploadToVercelBlob(file: File, folder: string): Promise<UploadResult> {
    const formData = new FormData()
    const timestamp = Date.now()
    const filename = `${folder}/${timestamp}-${file.name}`

    formData.append("file", file)

    const response = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
      headers: {
        "X-Storage-Provider": "vercel_blob",
        "X-Storage-Path": filename,
      },
    })

    if (!response.ok) throw new Error("Vercel Blob upload failed")

    const data = await response.json()
    return {
      url: data.url,
      filename: data.filename,
      size: file.size,
      provider: "vercel_blob",
    }
  }

  private async uploadToCloudinary(file: File, folder: string): Promise<UploadResult> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)
    formData.append("upload_preset", "redeem_code_app")

    const response = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
      headers: {
        "X-Storage-Provider": "cloudinary",
      },
    })

    if (!response.ok) throw new Error("Cloudinary upload failed")

    const data = await response.json()
    return {
      url: data.url,
      filename: data.filename,
      size: file.size,
      provider: "cloudinary",
    }
  }

  private async uploadToLocal(file: File, folder: string): Promise<UploadResult> {
    const formData = new FormData()
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`

    formData.append("file", file)
    formData.append("folder", folder)

    const response = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
      headers: {
        "X-Storage-Provider": "local",
      },
    })

    if (!response.ok) throw new Error("Local storage upload failed")

    const data = await response.json()
    return {
      url: data.url,
      filename,
      size: file.size,
      provider: "local",
    }
  }
}
