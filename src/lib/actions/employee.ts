"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function createEmployee(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser || !["SUPER_ADMIN", "ADMIN", "HR"].includes(currentUser.role)) {
    throw new Error("Unauthorized to create employees")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as Role
  
  const phone = formData.get("phone") as string
  const joiningDate = formData.get("joiningDate") as string
  const departmentId = formData.get("departmentId") as string
  const designationId = formData.get("designationId") as string
  const basicSalary = formData.get("basicSalary") as string

  if (!name || !email || !password || !role || !joiningDate) {
    throw new Error("Missing required fields")
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  // Generate a random employee code like EMP-123456
  const employeeCode = `EMP-${Math.floor(100000 + Math.random() * 900000)}`

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role,
        isActive: true
      }
    })

    await tx.employee.create({
      data: {
        userId: user.id,
        employeeCode,
        phone: phone || null,
        joiningDate: new Date(joiningDate),
        departmentId: departmentId || null,
        designationId: designationId || null,
        basicSalary: basicSalary ? parseFloat(basicSalary) : 0,
      }
    })
  })

  revalidatePath("/workforce/employees")
  return { success: true }
}
