const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { name: { contains: 'Sharma', mode: 'insensitive' } }
  });
  console.log('Users found:', users);
  
  const leads = await prisma.lead.findMany({
    where: { contactName: { contains: 'Sharma', mode: 'insensitive' } }
  });
  console.log('Leads found:', leads);
}
main().catch(console.error).finally(() => prisma.$disconnect());
