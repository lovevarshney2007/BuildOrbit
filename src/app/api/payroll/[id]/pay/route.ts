import { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    return new Response(null, { status: 303, headers: { Location: "/login" } })
  }

  const { id } = await params

  const current = await prisma.payroll.findUnique({ where: { id } })
  if (!current) {
    return new Response("Not found", { status: 404 })
  }
  if (current.status !== "PROCESSED") {
    return new Response("Must be PROCESSED before paying", { status: 400 })
  }

  const payroll = await prisma.payroll.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
    include: { employee: { include: { user: true } } }
  })

  // Send Payslip Generated Email Notification
  if (payroll.employee?.user?.email && payroll.employee?.user?.name) {
    try {
      const { emailService } = await import("@/lib/services/email-service")
      await emailService.sendPayslipGeneratedAlert(
        payroll.employee.user.email,
        payroll.employee.user.name,
        payroll.month,
        payroll.year
      )
    } catch (e) {
      console.error("Failed to send payslip email", e)
    }
  }

  return new Response(null, { status: 303, headers: { Location: "/hr/payroll" } })
}
