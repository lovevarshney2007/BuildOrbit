import { NextRequest, NextResponse } from "next/server"
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

  await prisma.payroll.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  })

  return new Response(null, { status: 303, headers: { Location: "/hr/payroll" } })
}
