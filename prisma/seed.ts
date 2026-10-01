// BuildOrbit — Full Development Seed
// Requires: DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD in .env
// Run: npx prisma db seed

import {
  PrismaClient,
  Role,
  EmployeeStatus,
  AttendanceStatus,
  LeaveStatus,
  PayrollStatus,
  LeadStatus,
  LeadSource,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required env var: ${name}`)
  return val
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function thisYear(): number {
  return new Date().getFullYear()
}

async function main() {
  console.log("🌱 Starting BuildOrbit seed...")

  const adminEmail = requireEnv("SEED_ADMIN_EMAIL")
  const adminPassword = requireEnv("SEED_ADMIN_PASSWORD")

  // ---------------------------------------------------------------------------
  // 1. Departments
  // ---------------------------------------------------------------------------
  console.log("Creating departments...")
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: "Engineering" },
      update: {},
      create: { name: "Engineering", description: "Software development team" },
    }),
    prisma.department.upsert({
      where: { name: "Human Resources" },
      update: {},
      create: { name: "Human Resources", description: "HR and people operations" },
    }),
    prisma.department.upsert({
      where: { name: "Sales" },
      update: {},
      create: { name: "Sales", description: "Sales and CRM team" },
    }),
    prisma.department.upsert({
      where: { name: "Management" },
      update: {},
      create: { name: "Management", description: "Leadership and management" },
    }),
  ])
  const [engDept, hrDept, mgmtDept] = departments

  // ---------------------------------------------------------------------------
  // 2. Designations
  // ---------------------------------------------------------------------------
  console.log("Creating designations...")
  const designations = await Promise.all([
    prisma.designation.upsert({ where: { title: "Software Engineer" }, update: {}, create: { title: "Software Engineer" } }),
    prisma.designation.upsert({ where: { title: "Senior Software Engineer" }, update: {}, create: { title: "Senior Software Engineer" } }),
    prisma.designation.upsert({ where: { title: "Team Lead" }, update: {}, create: { title: "Team Lead" } }),
    prisma.designation.upsert({ where: { title: "HR Manager" }, update: {}, create: { title: "HR Manager" } }),
    prisma.designation.upsert({ where: { title: "Admin Manager" }, update: {}, create: { title: "Admin Manager" } }),
    prisma.designation.upsert({ where: { title: "Sales Executive" }, update: {}, create: { title: "Sales Executive" } }),
  ])
  const [seDes, sseDes, tlDes, hrDes, adminDes] = designations

  // ---------------------------------------------------------------------------
  // 3. Users
  // ---------------------------------------------------------------------------
  console.log("Creating users...")

  const superAdminHash = await hashPassword(adminPassword)
  const commonHash = await hashPassword("Password@123")

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: superAdminHash },
    create: {
      email: adminEmail,
      name: "Super Admin",
      passwordHash: superAdminHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  })

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@buildorbit.dev" },
    update: {},
    create: {
      email: "admin@buildorbit.dev",
      name: "Alex Johnson",
      passwordHash: commonHash,
      role: Role.ADMIN,
      isActive: true,
    },
  })

  const hrUser = await prisma.user.upsert({
    where: { email: "hr@buildorbit.dev" },
    update: {},
    create: {
      email: "hr@buildorbit.dev",
      name: "Sarah Williams",
      passwordHash: commonHash,
      role: Role.HR,
      isActive: true,
    },
  })

  const leadUser = await prisma.user.upsert({
    where: { email: "lead@buildorbit.dev" },
    update: {},
    create: {
      email: "lead@buildorbit.dev",
      name: "Michael Chen",
      passwordHash: commonHash,
      role: Role.LEAD,
      isActive: true,
    },
  })

  const eng1User = await prisma.user.upsert({
    where: { email: "engineer@buildorbit.dev" },
    update: { name: "Love Varshney" },
    create: {
      email: "engineer@buildorbit.dev",
      name: "Love Varshney",
      passwordHash: commonHash,
      role: Role.ENGINEER,
      isActive: true,
    },
  })

  const eng2User = await prisma.user.upsert({
    where: { email: "engineer2@buildorbit.dev" },
    update: {},
    create: {
      email: "engineer2@buildorbit.dev",
      name: "David Martinez",
      passwordHash: commonHash,
      role: Role.ENGINEER,
      isActive: true,
    },
  })

  // ---------------------------------------------------------------------------
  // 4. Employees
  // ---------------------------------------------------------------------------
  console.log("Creating employee profiles...")

  async function upsertEmployee(userId: string, code: string, deptId: string, desId: string, salary: number, joiningDaysAgo: number) {
    return prisma.employee.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        employeeCode: code,
        departmentId: deptId,
        designationId: desId,
        basicSalary: salary,
        joiningDate: daysAgo(joiningDaysAgo),
        status: EmployeeStatus.ACTIVE,
      },
    })
  }

  const empAdmin = await upsertEmployee(adminUser.id, "EMP001", mgmtDept.id, adminDes.id, 120000, 730)
  const empHr = await upsertEmployee(hrUser.id, "EMP002", hrDept.id, hrDes.id, 80000, 600)
  const empLead = await upsertEmployee(leadUser.id, "EMP003", engDept.id, tlDes.id, 100000, 500)
  const empEng1 = await upsertEmployee(eng1User.id, "EMP004", engDept.id, seDes.id, 70000, 365)
  const empEng2 = await upsertEmployee(eng2User.id, "EMP005", engDept.id, sseDes.id, 85000, 400)

  // ---------------------------------------------------------------------------
  // 5. Leave Types
  // ---------------------------------------------------------------------------
  console.log("Creating leave types...")

  const leaveTypes = await Promise.all([
    prisma.leaveType.upsert({ where: { name: "Paid Leave" }, update: {}, create: { name: "Paid Leave", daysAllowed: 15, isPaid: true, description: "Annual paid leave" } }),
    prisma.leaveType.upsert({ where: { name: "Sick Leave" }, update: {}, create: { name: "Sick Leave", daysAllowed: 10, isPaid: true, description: "Medical sick leave" } }),
    prisma.leaveType.upsert({ where: { name: "Unpaid Leave" }, update: {}, create: { name: "Unpaid Leave", daysAllowed: 30, isPaid: false, description: "Unpaid leave without pay" } }),
    prisma.leaveType.upsert({ where: { name: "Casual Leave" }, update: {}, create: { name: "Casual Leave", daysAllowed: 7, isPaid: true, description: "Short-notice casual leave" } }),
  ])
  const paidLeave = leaveTypes[0]
  const sickLeave = leaveTypes[1]
  const casualLeave = leaveTypes[3]

  // ---------------------------------------------------------------------------
  // 6. Leave Balances
  // ---------------------------------------------------------------------------
  console.log("Creating leave balances...")
  const year = thisYear()
  const allEmployees = [empAdmin, empHr, empLead, empEng1, empEng2]

  for (const emp of allEmployees) {
    for (const lt of leaveTypes) {
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: emp.id, leaveTypeId: lt.id, year } },
        update: {},
        create: { employeeId: emp.id, leaveTypeId: lt.id, year, totalDays: lt.daysAllowed, usedDays: 0 },
      })
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Attendance (last 14 days)
  // ---------------------------------------------------------------------------
  console.log("Creating attendance records...")

  for (let i = 0; i < 14; i++) {
    const date = daysAgo(i)
    date.setHours(0, 0, 0, 0)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue // skip weekends

    for (const emp of allEmployees) {
      const status = i === 3 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT
      try {
        await prisma.attendance.upsert({
          where: { employeeId_date: { employeeId: emp.id, date } },
          update: {},
          create: {
            employeeId: emp.id,
            date,
            status,
            checkIn: status === AttendanceStatus.PRESENT ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0) : undefined,
            checkOut: status === AttendanceStatus.PRESENT ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0) : undefined,
          },
        })
      } catch { /* skip duplicate */ }
    }
  }

  // ---------------------------------------------------------------------------
  // 8. Leave Requests
  // ---------------------------------------------------------------------------
  console.log("Creating leave requests...")

  await prisma.leaveRequest.createMany({
    skipDuplicates: true,
    data: [
      {
        requesterId: eng1User.id,
        leaveTypeId: paidLeave.id,
        startDate: daysAgo(-3),
        endDate: daysAgo(-5),
        days: 3,
        reason: "Family event",
        status: LeaveStatus.PENDING,
      },
      {
        requesterId: eng2User.id,
        leaveTypeId: sickLeave.id,
        startDate: daysAgo(7),
        endDate: daysAgo(8),
        days: 2,
        reason: "Fever and cold",
        status: LeaveStatus.APPROVED,
        approverId: hrUser.id,
        approvedAt: daysAgo(6),
        approverNote: "Approved. Get well soon.",
      },
      {
        requesterId: leadUser.id,
        leaveTypeId: casualLeave.id,
        startDate: daysAgo(-7),
        endDate: daysAgo(-7),
        days: 1,
        reason: "Personal work",
        status: LeaveStatus.PENDING,
      },
    ],
  })

  // ---------------------------------------------------------------------------
  // 9. Payroll
  // ---------------------------------------------------------------------------
  console.log("Creating payroll records...")

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  for (const [emp, salary] of [
    [empAdmin, 120000], [empHr, 80000], [empLead, 100000], [empEng1, 70000], [empEng2, 85000]
  ] as [typeof empAdmin, number][]) {
    const allowances = salary * 0.1
    const deductions = salary * 0.05
    const net = salary + allowances - deductions

    // Previous month — PAID
    await prisma.payroll.upsert({
      where: { employeeId_month_year: { employeeId: emp.id, month: prevMonth, year: prevYear } },
      update: {},
      create: {
        employeeId: emp.id,
        month: prevMonth,
        year: prevYear,
        basicSalary: salary,
        allowances,
        deductions,
        netSalary: net,
        status: PayrollStatus.PAID,
        paidAt: daysAgo(5),
      },
    })

    // Current month — DRAFT
    await prisma.payroll.upsert({
      where: { employeeId_month_year: { employeeId: emp.id, month: currentMonth, year: currentYear } },
      update: {},
      create: {
        employeeId: emp.id,
        month: currentMonth,
        year: currentYear,
        basicSalary: salary,
        allowances,
        deductions,
        netSalary: net,
        status: PayrollStatus.DRAFT,
      },
    })
  }

  // ---------------------------------------------------------------------------
  // 10. Leads
  // ---------------------------------------------------------------------------
  console.log("Creating leads...")

  const lead1 = await prisma.lead.create({
    data: {
      title: "Enterprise Software License — TechCorp",
      contactName: "James Wilson",
      contactEmail: "james@techcorp.com",
      contactPhone: "+1-555-0101",
      company: "TechCorp Inc.",
      source: LeadSource.WEBSITE,
      status: LeadStatus.QUALIFIED,
      value: 250000,
      assignedToId: leadUser.id,
      createdById: leadUser.id,
      expectedClose: daysAgo(-30),
    },
  }).catch(() => null)

  const lead2 = await prisma.lead.create({
    data: {
      title: "CRM Implementation — StartupXYZ",
      contactName: "Emily Parker",
      contactEmail: "emily@startupxyz.com",
      company: "StartupXYZ",
      source: LeadSource.REFERRAL,
      status: LeadStatus.PROPOSAL,
      value: 85000,
      assignedToId: leadUser.id,
      createdById: leadUser.id,
      expectedClose: daysAgo(-15),
    },
  }).catch(() => null)

  await prisma.lead.create({
    data: {
      title: "Annual Support Contract — MegaCorp",
      contactName: "Robert Chen",
      contactEmail: "robert@megacorp.com",
      company: "MegaCorp",
      source: LeadSource.COLD_CALL,
      status: LeadStatus.NEW,
      value: 45000,
      assignedToId: leadUser.id,
      createdById: adminUser.id,
      expectedClose: daysAgo(-60),
    },
  }).catch(() => null)

  // ---------------------------------------------------------------------------
  // 11. Lead Follow-ups
  // ---------------------------------------------------------------------------
  console.log("Creating lead follow-ups...")

  if (lead1) {
    await prisma.leadFollowUp.createMany({
      data: [
        { leadId: lead1.id, notes: "Initial call made. Decision maker interested.", followUpDate: daysAgo(10), isDone: true },
        { leadId: lead1.id, notes: "Sent proposal document. Awaiting review.", followUpDate: daysAgo(3), isDone: true },
        { leadId: lead1.id, notes: "Follow up on proposal response", followUpDate: daysAgo(-5), isDone: false },
      ],
    })
  }

  if (lead2) {
    await prisma.leadFollowUp.createMany({
      data: [
        { leadId: lead2.id, notes: "Discovery call — good fit identified.", followUpDate: daysAgo(7), isDone: true },
        { leadId: lead2.id, notes: "Demo scheduled", followUpDate: daysAgo(-2), isDone: false },
      ],
    })
  }

  // ---------------------------------------------------------------------------
  // Done
  // ---------------------------------------------------------------------------
  console.log("\n✅ Seed complete!")
  console.log("\n📋 Login credentials:")
  console.log(`   Super Admin: ${adminEmail} / [SEED_ADMIN_PASSWORD]`)
  console.log("   Admin:       admin@buildorbit.dev / Password@123")
  console.log("   HR:          hr@buildorbit.dev / Password@123")
  console.log("   Lead:        lead@buildorbit.dev / Password@123")
  console.log("   Engineer:    engineer@buildorbit.dev / Password@123")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
