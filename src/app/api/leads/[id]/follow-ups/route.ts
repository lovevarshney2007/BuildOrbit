import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { notes, followUpDate } = body

  if (!notes || !followUpDate) {
    return NextResponse.json({ error: "notes and followUpDate are required" }, { status: 400 })
  }

  const followUp = await prisma.leadFollowUp.create({
    data: {
      leadId: id,
      notes,
      followUpDate: new Date(followUpDate),
    },
  })

  return NextResponse.json(followUp)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const followUps = await prisma.leadFollowUp.findMany({
    where: { leadId: id },
    orderBy: { followUpDate: "desc" },
  })

  return NextResponse.json(followUps)
}
