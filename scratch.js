const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { name: { contains: 'Priya', mode: 'insensitive' } }
  });
  console.log('Users found:', users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
