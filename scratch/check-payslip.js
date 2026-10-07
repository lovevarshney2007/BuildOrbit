const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const payslip = await prisma.payroll.findUnique({
    where: { id: "cmuxcwusf001710y095z69me3" },
    include: {
      employee: {
        include: { department: true, designation: true, user: true }
      }
    }
  });
  console.log(payslip);
}

main().catch(console.error).finally(() => prisma.$disconnect());
