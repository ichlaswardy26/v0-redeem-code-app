export async function generateRedeemCodePDF(codes: string[], productName: string, orderDate: string): Promise<Blob> {
  // Dynamically import pdfkit as it's only needed server-side
  const PDFDocument = (await import("pdfkit")).default

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    })

    const buffers: Uint8Array[] = []

    doc.on("data", (chunk: Uint8Array) => buffers.push(chunk))
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers)
      resolve(new Blob([pdfBuffer], { type: "application/pdf" }))
    })
    doc.on("error", reject)

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text("Redeem Codes", { align: "center" })
    doc.fontSize(12).font("Helvetica").text(`Product: ${productName}`, { align: "center" })
    doc.fontSize(10).font("Helvetica").text(`Order Date: ${orderDate}`, { align: "center" })
    doc.moveDown()

    // Add codes
    codes.forEach((code, index) => {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Code ${index + 1}:`)
      doc
        .fontSize(14)
        .font("Courier-Bold")
        .text(code, {
          align: "center",
          box: { width: 200, height: 40, x: 157 },
        })
      doc.moveDown()
    })

    // Footer
    doc.fontSize(8).font("Helvetica").text("Keep this safe and secure.", { align: "center" })
    doc.end()
  })
}
