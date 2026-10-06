import { PrismaClient, LeadSource, LeadStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { name: { contains: "Shyam Varshney", mode: "insensitive" } }
  })

  if (!user) {
    console.log("User 'Shyam Varshney' not found.")
    process.exit(1)
  }

  console.log(`Found user ${user.name} with ID ${user.id}`)

  const lead1 = await prisma.lead.create({
    data: {
      title: "E-Commerce Website Revamp",
      contactName: "Rahul Sharma",
      contactEmail: "rahul@sharmaretail.com",
      company: "Sharma Retail",
      source: "WEBSITE",
      status: "NEW",
      value: 120000,
      assignedToId: user.id,
      createdById: user.id,
      expectedClose: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000)
    }
  })

  const lead2 = await prisma.lead.create({
    data: {
      title: "Inventory Management App",
      contactName: "Priya Singh",
      company: "Singh Logistics",
      source: "REFERRAL",
      status: "QUALIFIED",
      value: 350000,
      assignedToId: user.id,
      createdById: user.id,
      expectedClose: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  await prisma.leadFollowUp.create({
    data: {
      leadId: lead1.id,
      notes: "Initial requirement gathering call scheduled.",
      followUpDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
      isDone: false
    }
  })

  console.log("Mock leads created successfully!")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
