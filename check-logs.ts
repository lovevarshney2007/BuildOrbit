import { prisma } from "./src/lib/prisma";

async function main() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10
  });
  console.log(logs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
