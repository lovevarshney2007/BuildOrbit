"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { PayrollStatus } from "@prisma/client"

export async function createPayrollRecord(data: {
  employeeId: string
  month: number
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  notes?: string
}) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  const netSalary = data.basicSalary + data.allowances - data.deductions

  await prisma.payroll.create({
    data: {
      employeeId: data.employeeId,
      month: data.month,
      year: data.year,
      basicSalary: data.basicSalary,
      allowances: data.allowances,
      deductions: data.deductions,
      netSalary,
      notes: data.notes,
      status: PayrollStatus.DRAFT,
    },
  })

  revalidatePath("/hr/payroll")
  return { success: true }
}

export async function updatePayrollStatus(id: string, status: PayrollStatus) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  await prisma.payroll.update({
    where: { id },
    data: {
      status,
      paidAt: status === PayrollStatus.PAID ? new Date() : undefined,
    },
  })

  revalidatePath("/hr/payroll")
  return { success: true }
}

export async function generatePayrollForMonth(month: number, year: number) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, basicSalary: true },
  })

  let created = 0
  let skipped = 0

  for (const emp of employees) {
    const existing = await prisma.payroll.findUnique({
      where: { employeeId_month_year: { employeeId: emp.id, month, year } },
    })

    if (existing) {
      skipped++
      continue
    }

    const basic = Number(emp.basicSalary)
    // Simple allowance = 40% of basic, deductions = 10%
    const allowances = Math.round(basic * 0.4)
    const deductions = Math.round(basic * 0.1)
    const net = basic + allowances - deductions

    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        month,
        year,
        basicSalary: basic,
        allowances,
        deductions,
        netSalary: net,
        status: PayrollStatus.DRAFT,
        notes: `Auto-generated for ${month}/${year}`,
      },
    })
    created++
  }

  revalidatePath("/hr/payroll")
  return { success: true, created, skipped }
}
