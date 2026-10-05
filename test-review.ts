import { prisma } from "./src/lib/prisma";
import { reviewLeave } from "./src/lib/services/leave-service";
import { Role } from "@prisma/client";
import { createTestLeaveRequest } from "./tests/e2e/helpers/db";

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: Role.SUPER_ADMIN } });
  if (!admin) throw new Error("No admin");

  const { leaveRequestId } = await createTestLeaveRequest("engineer@buildorbit.dev", { status: "PENDING" });
  
  console.log("Approving leave...");
  try {
    const res = await reviewLeave(prisma, {
      actor: { userId: admin.id, role: admin.role },
      requestId: leaveRequestId,
      decision: "APPROVE",
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
