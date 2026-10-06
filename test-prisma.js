const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const data = {
      name: "Akgec",
      code: "402",
      latitude: 28.675656,
      longitude: 77.502912,
      radiusMeters: 100,
      isActive: true,
      projectName: null,
      region: null,
      address: "Ajay Kumar Garg Engineering College - AKGEC, Ghaziabad"
    };
    
    // First let's check if the code exists
    const dup = await prisma.site.findUnique({ where: { code: data.code } });
    if (dup) {
      console.log("Duplicate exists!", dup);
      return;
    }
    
    // Try to create the site
    const site = await prisma.$transaction(async (tx) => {
      // Find admin user
      const admin = await tx.user.findFirst({ where: { role: 'ADMIN' }});
      const site = await tx.site.create({ data });
      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: "SITE_CREATED",
          entityType: "Site",
          entityId: site.id,
        },
      });
      return site;
    });
    
    console.log("Success:", site);
  } catch (err) {
    console.error("Database Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
