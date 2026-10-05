import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/cron/auto-checkout
// Called by Vercel Cron or external scheduler at end of shift (e.g. 7:30 PM daily)
// Marks any employees who checked in but didn't check out
export async function GET(req: NextRequest) {
  // Protect with a cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find all attendance records for today that have a checkIn but no checkOut
  const openAttendances = await prisma.attendance.findMany({
    where: {
      date: today,
      checkIn: { not: null },
      checkOut: null,
      status: "PRESENT",
    },
    include: { employee: { include: { user: { select: { name: true } } } } }
  })

  if (openAttendances.length === 0) {
    return NextResponse.json({ message: "No open attendances to close.", count: 0 })
  }

  // Auto checkout at 18:30 (end of standard shift)
  const autoCheckoutTime = new Date()
  autoCheckoutTime.setHours(18, 30, 0, 0)

  const updates = await Promise.allSettled(
    openAttendances.map(a =>
      prisma.attendance.update({
        where: { id: a.id },
        data: {
          checkOut: autoCheckoutTime,
          workedMinutes: Math.floor((autoCheckoutTime.getTime() - a.checkIn!.getTime()) / 60000),
          notes: (a.notes ? a.notes + " | " : "") + "Auto-checkout by system at 18:30",
        }
      })
    )
  )

  const successful = updates.filter(r => r.status === "fulfilled").length

  console.log(`Auto-checkout: Closed ${successful}/${openAttendances.length} attendance records.`)

  return NextResponse.json({
    message: `Auto-checkout complete.`,
    total: openAttendances.length,
    success: successful,
  })
}
