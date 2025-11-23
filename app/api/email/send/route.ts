import { type NextRequest, NextResponse } from "next/server"
import { getEmailTemplate } from "@/lib/email/email-service"
import nodemailer from "nodemailer"

// Configure your SMTP here (can be from settings in future)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
})

export async function POST(request: NextRequest) {
  try {
    const { to, subject, type, data } = await request.json()

    const htmlContent = getEmailTemplate(type, data)

    // Only send if SMTP is configured
    if (!process.env.SMTP_HOST) {
      console.log("[DEV] Email would be sent to:", to, "Subject:", subject)
      return NextResponse.json({ success: true, dev: true })
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@redeem.local",
      to,
      subject,
      html: htmlContent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email send error:", error)
    // Don't fail the app if email fails
    return NextResponse.json({ success: false, error: "Email could not be sent" }, { status: 500 })
  }
}
