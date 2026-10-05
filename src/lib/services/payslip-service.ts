import PDFDocument from "pdfkit"
import { prisma } from "@/lib/prisma"
import { putObject, generateStorageKey } from "@/lib/services/private-storage"
import { EmployeeDocumentType } from "@prisma/client"

export async function generateAndArchivePayslip(payrollId: string): Promise<void> {
  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
    include: {
      employee: {
        include: {
          user: true,
          department: true,
          designation: true,
        }
      }
    }
  })

  if (!payroll) throw new Error("Payroll not found")
  
  const emp = payroll.employee
  const monthName = new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' })
  const filename = `Payslip_${emp.employeeCode}_${monthName}_${payroll.year}.pdf`

  // Generate PDF
  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []
      
      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))

      // Simple PDF Design
      doc.fontSize(20).text("BuildOrbit", { align: "center" }).moveDown()
      doc.fontSize(16).text(`Payslip for ${monthName} ${payroll.year}`, { align: "center" }).moveDown(2)
      
      doc.fontSize(12)
      doc.text(`Employee Name: ${emp.user.name || emp.user.email}`)
      doc.text(`Employee Code: ${emp.employeeCode}`)
      doc.text(`Department: ${emp.department?.name || "N/A"}`)
      doc.text(`Designation: ${emp.designation?.title || "N/A"}`).moveDown(2)

      doc.text(`Basic Salary: $${payroll.basicSalary.toFixed(2)}`)
      doc.text(`Allowances: $${payroll.allowances.toFixed(2)}`)
      doc.text(`Deductions: $${payroll.deductions.toFixed(2)}`).moveDown()
      
      doc.fontSize(14).font("Helvetica-Bold")
      doc.text(`Net Salary: $${payroll.netSalary.toFixed(2)}`)

      if (payroll.notes) {
        doc.moveDown().fontSize(10).font("Helvetica").text(`Notes: ${payroll.notes}`)
      }
      
      doc.end()
    } catch (err) {
      reject(err)
    }
  })

  // Upload to Cloudinary
  const folderKey = generateStorageKey("payslips", emp.id, "pdf")
  const storedKey = await putObject(folderKey, pdfBuffer)

  // Save to EmployeeDocument
  await prisma.employeeDocument.create({
    data: {
      employeeId: emp.id,
      documentType: EmployeeDocumentType.PAYSLIP,
      title: `Payslip - ${monthName} ${payroll.year}`,
      originalFilename: filename,
      storageKey: storedKey,
      mimeType: "application/pdf",
      sizeBytes: pdfBuffer.length,
      uploadedById: emp.userId, // auto-generated system wise
    }
  })
}
