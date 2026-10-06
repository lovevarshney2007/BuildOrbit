import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This should run annually (e.g., on Jan 1st)
export async function GET(request: Request) {
  // Add authentication or cron secret check in production
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1

    // Fetch all leave policies that allow carry forward
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        isActive: true,
        tracksBalance: true,
      }
    })

    let processedCount = 0

    for (const type of leaveTypes) {
      if (!type.carryForwardMaxDays || type.carryForwardMaxDays <= 0) continue

      // Get all active balances from previous year for this type
      const oldBalances = await prisma.leaveBalance.findMany({
        where: {
          leaveTypeId: type.id,
          year: previousYear
        }
      })

      // Chunk array to avoid database connection exhaustion or serverless timeouts
      const CHUNK_SIZE = 50;
      for (let i = 0; i < oldBalances.length; i += CHUNK_SIZE) {
        const chunk = oldBalances.slice(i, i + CHUNK_SIZE);

        await Promise.all(chunk.map(async (old) => {
          const remaining = old.totalDays - old.usedDays - old.pendingDays;
          if (remaining <= 0) return

          // Calculate how much can be carried forward
          const carryForwardAmount = Math.min(remaining, type.carryForwardMaxDays!)

          // Find or create balance for current year
          let newBalance = await prisma.leaveBalance.findUnique({
            where: {
              employeeId_leaveTypeId_year: {
                employeeId: old.employeeId,
                leaveTypeId: type.id,
                year: currentYear
              }
            }
          })

          if (!newBalance) {
            await prisma.leaveBalance.create({
              data: {
                employeeId: old.employeeId,
                leaveTypeId: type.id,
                year: currentYear,
                totalDays: type.daysAllowed + carryForwardAmount,
                carriedForwardDays: carryForwardAmount,
              }
            })
          } else {
            // Update existing current year balance
            await prisma.leaveBalance.update({
              where: { id: newBalance.id },
              data: {
                carriedForwardDays: carryForwardAmount,
                totalDays: { increment: carryForwardAmount }
              }
            })
          }
          processedCount++
        }));
      }
    }

    return NextResponse.json({ success: true, processedCount })
  } catch (error) {
    console.error("Leave Carry Forward Cron Error:", error)
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 })
  }
}
