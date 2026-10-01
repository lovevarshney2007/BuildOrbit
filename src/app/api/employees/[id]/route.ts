import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { EmployeeStatus, Role } from "@prisma/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { user: true },
  })

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  const body = await request.json()
  const { name, phone, departmentId, designationId, basicSalary, status, role } = body

  await prisma.$transaction(async (tx) => {
    // Update user record
    await tx.user.update({
      where: { id: employee.userId },
      data: {
        name: name || employee.user.name,
        role: (role as Role) || employee.user.role,
      },
    })

    // Update employee record
    await tx.employee.update({
      where: { id },
      data: {
        phone: phone || null,
        departmentId: departmentId || null,
        designationId: designationId || null,
        basicSalary: basicSalary !== undefined ? basicSalary : employee.basicSalary,
        status: (status as EmployeeStatus) || employee.status,
      },
    })
  })

  return NextResponse.json({ success: true })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, role: true, isActive: true } },
      department: true,
      designation: true,
    },
  })

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(employee)
}
