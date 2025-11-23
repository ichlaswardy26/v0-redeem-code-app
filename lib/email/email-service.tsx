interface EmailPayload {
  to: string
  subject: string
  type: "order_received" | "payment_verified" | "payment_rejected" | "ticket_reply" | "review_received"
  data: Record<string, any>
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch (error) {
    console.error("Email sending failed:", error)
    return false
  }
}

// Email templates
export function getEmailTemplate(type: EmailPayload["type"], data: Record<string, any>): string {
  switch (type) {
    case "order_received":
      return `
        <h2>Order Received</h2>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Total:</strong> Rp ${data.total.toLocaleString("id-ID")}</p>
        <p>Please upload your payment proof to verify your order.</p>
      `
    case "payment_verified":
      return `
        <h2>Payment Verified</h2>
        <p>Your payment has been verified!</p>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p>Your redeem codes are ready. Check your orders dashboard to view them.</p>
      `
    case "payment_rejected":
      return `
        <h2>Payment Rejected</h2>
        <p>Your payment could not be verified.</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
        <p>Please upload your payment proof again.</p>
      `
    case "ticket_reply":
      return `
        <h2>New Reply to Your Ticket</h2>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p>${data.message}</p>
      `
    case "review_received":
      return `
        <h2>Thank You for Your Review</h2>
        <p>We appreciate your feedback!</p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Rating:</strong> ${data.rating} / 5 stars</p>
      `
    default:
      return ""
  }
}
