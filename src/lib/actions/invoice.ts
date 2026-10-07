"use server"

import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { InvoiceStatus } from "@prisma/client"

export async function createInvoice(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  const clientId = formData.get("clientId") as string
  const invoiceNumber = formData.get("invoiceNumber") as string
  const amount = parseFloat(formData.get("amount") as string)
  const tax = formData.get("tax") ? parseFloat(formData.get("tax") as string) : 0
  const total = amount + tax
  const dueDate = new Date(formData.get("dueDate") as string)
  const notes = formData.get("notes") as string
  const status = formData.get("status") as InvoiceStatus || "DRAFT"

  if (!clientId || !invoiceNumber || isNaN(amount) || !dueDate) {
    throw new Error("Missing required fields")
  }

  await prisma.invoice.create({
    data: {
      clientId,
      invoiceNumber,
      amount,
      tax,
      total,
      dueDate,
      notes,
      status,
    }
  })

  revalidatePath("/crm/invoices")
}
