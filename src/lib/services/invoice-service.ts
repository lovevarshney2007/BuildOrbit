import PDFDocument from "pdfkit"
import { prisma } from "@/lib/prisma"
import { putObject, generateStorageKey } from "@/lib/services/private-storage"
import { InvoiceStatus } from "@prisma/client"
import { sendWebhookAlert } from "@/lib/webhook"

export async function generateInvoicePdf(invoiceId: string): Promise<string> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: true }
  })

  if (!invoice) throw new Error("Invoice not found")
  
  const client = invoice.client
  const filename = `Invoice_${invoice.invoiceNumber}.pdf`

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []
      
      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))

      // Simple Invoice Design
      doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", { align: "right" })
      doc.fontSize(10).font("Helvetica").text(`Invoice #: ${invoice.invoiceNumber}`, { align: "right" })
      doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`, { align: "right" })
      doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, { align: "right" }).moveDown(2)
      
      doc.fontSize(16).text("Billed To:")
      doc.fontSize(12).font("Helvetica")
      doc.text(`Client: ${client.name}`)
      if (client.company) doc.text(`Company: ${client.company}`)
      if (client.email) doc.text(`Email: ${client.email}`)
      if (client.phone) doc.text(`Phone: ${client.phone}`).moveDown(2)

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown()
      
      doc.fontSize(12)
      doc.text(`Amount: $${invoice.amount.toFixed(2)}`)
      if (invoice.tax) {
        doc.text(`Tax: $${invoice.tax.toFixed(2)}`)
      }
      doc.moveDown()
      
      doc.fontSize(16).font("Helvetica-Bold")
      doc.text(`Total: $${invoice.total.toFixed(2)}`)

      if (invoice.notes) {
        doc.moveDown(2).fontSize(10).font("Helvetica").text(`Notes:\n${invoice.notes}`)
      }
      
      doc.end()
    } catch (err) {
      reject(err)
    }
  })

  // Upload to Cloudinary
  const folderKey = generateStorageKey("invoices", invoice.id, "pdf")
  const storedKey = await putObject(folderKey, pdfBuffer)

  // Save the URL to Invoice
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl: storedKey }
  })

  return storedKey
}

export async function createInvoice(data: {
  clientId: string
  amount: number
  tax?: number
  dueDate: Date
  notes?: string
}) {
  const count = await prisma.invoice.count()
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

  const total = data.amount + (data.tax || 0)

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId: data.clientId,
      amount: data.amount,
      tax: data.tax || 0,
      total,
      dueDate: data.dueDate,
      notes: data.notes,
      status: InvoiceStatus.DRAFT,
    },
    include: { client: true }
  })

  // Generate PDF and save its URL
  await generateInvoicePdf(invoice.id)
  
  await sendWebhookAlert(`🧾 *New Invoice Created:* ${invoiceNumber} for ${invoice.client.name} (Amount: $${total.toFixed(2)})`)

  return invoice
}
