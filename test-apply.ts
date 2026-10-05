import { prisma } from "./src/lib/prisma";
import { applyLeave } from "./src/lib/services/leave-service";
import { Role } from "@prisma/client";

async function main() {
  const engineer = await prisma.user.findUnique({ where: { email: "engineer@buildorbit.dev" } });
  const leaveType = await prisma.leaveType.findFirst({ where: { isActive: true } });
  
  if (!engineer || !leaveType) throw new Error("Missing data");

  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);
    const dateStr = futureDate.toISOString().split("T")[0];

    console.log("Applying leave...");
    const res = await applyLeave(prisma, {
      actor: { userId: engineer.id, role: Role.ENGINEER },
      leaveTypeId: leaveType.id,
      startDate: dateStr,
      endDate: dateStr,
      reason: "Automated test leave request - please ignore",
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
