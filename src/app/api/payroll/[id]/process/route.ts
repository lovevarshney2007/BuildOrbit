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

  await prisma.payroll.update({
    where: { id },
    data: { status: "PROCESSED" },
  })

  // Redirect back to payroll page
  return new Response(null, { status: 303, headers: { Location: "/hr/payroll" } })
}
