const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.site.deleteMany({ where: { code: '402' } });
    console.log("Deleted test site");
  } catch(e) {
    console.log("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
