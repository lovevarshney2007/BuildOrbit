import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { FileText, Download } from "lucide-react"
import Link from "next/link"
import { InvoiceCreateDialog } from "@/components/crm/InvoiceCreateDialog"

export default async function InvoicesPage() {
  const user = await requireAuth()
  if (!["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">You do not have permission to view invoices.</p>
      </div>
    )
  }

  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" }
  })

  const clients = await prisma.client.findMany({
    select: { id: true, name: true, company: true },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader title="Invoices" />
        <InvoiceCreateDialog clients={clients} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {invoices.map(invoice => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {invoice.invoiceNumber}
              </CardTitle>
              <Badge variant={
                invoice.status === "PAID" ? "success" :
                invoice.status === "SENT" ? "info" : "outline"
              }>
                {invoice.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${invoice.total.toString()}</div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                Client: {invoice.client.name} {invoice.client.company ? `(${invoice.client.company})` : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Due: {format(invoice.dueDate, "MMM d, yyyy")}
              </p>

              {invoice.pdfUrl && (
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => window.open(invoice.pdfUrl as string, '_blank')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {invoices.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No invoices found</h3>
            <p className="text-sm text-muted-foreground">You have not generated any invoices yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
