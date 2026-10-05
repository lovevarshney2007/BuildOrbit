import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { LeadStatus } from "@prisma/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { status, notes, value, assignedToId } = body

  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isConverting = status === "CONVERTED" && lead.status !== "CONVERTED"

  const updated = await prisma.$transaction(async (tx) => {
    const updatedLead = await tx.lead.update({
      where: { id },
      data: {
        status: status as LeadStatus || lead.status,
        notes: notes ?? lead.notes,
        value: value !== undefined ? value : lead.value,
        assignedToId: assignedToId !== undefined ? (assignedToId || null) : lead.assignedToId,
        convertedAt: isConverting ? new Date() : undefined,
      },
    })

    if (isConverting) {
      // Check if client already exists
      const existing = await tx.client.findUnique({ where: { leadId: id } })
      if (!existing) {
        await tx.client.create({
          data: {
            name: lead.contactName,
            email: lead.contactEmail,
            phone: lead.contactPhone,
            company: lead.company,
            leadId: lead.id,
          }
        })
      }
    }

    return updatedLead
  })

  return NextResponse.json(updated)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { name: true, email: true } },
      followUps: { orderBy: { followUpDate: "desc" } },
    },
  })

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(lead)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  
  try {
    await prisma.lead.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}
