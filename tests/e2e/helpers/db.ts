/**
 * BuildOrbit — Database Test Utilities
 * Provides Prisma-based helpers for creating and cleaning up test data.
 * All test records are clearly prefixed with "TEST_" to distinguish them from seed data.
 */

import { PrismaClient, Role, LeaveStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use the same DATABASE_URL as the app (from .env)
const prisma = new PrismaClient();

export { prisma };

// ---------------------------------------------------------------------------
// Test data prefixes / identifiers
// ---------------------------------------------------------------------------

export const TEST_PREFIX = "TEST_";
export const TEST_EMAIL_SUFFIX = "@test.buildorbit.local";

export interface TestEmployee {
  userId: string;
  employeeId: string;
  email: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Create test users & employees
// ---------------------------------------------------------------------------

/**
 * Create a test user with an employee profile.
 * Returns the userId and employeeId for use in tests.
 * Call cleanupTestUser to remove when done.
 */
export async function createTestEmployee(options?: {
  role?: Role;
  name?: string;
  email?: string;
  basicSalary?: number;
}): Promise<TestEmployee> {
  const timestamp = Date.now();
  const name = options?.name || `${TEST_PREFIX}Employee_${timestamp}`;
  const email = options?.email || `test_${timestamp}${TEST_EMAIL_SUFFIX}`;
  const role = options?.role || Role.ENGINEER;
  const basicSalary = options?.basicSalary ?? 60000;

  const passwordHash = await bcrypt.hash("TestPassword@123", 10);

  // Find or create a department
  let dept = await prisma.department.findFirst({
    where: { name: "Engineering" },
  });
  if (!dept) {
    dept = await prisma.department.create({
      data: { name: "Engineering", description: "Test department" },
    });
  }

  // Find or create a designation
  let desig = await prisma.designation.findFirst({
    where: { title: "Software Engineer" },
  });
  if (!desig) {
    desig = await prisma.designation.create({
      data: { title: "Software Engineer" },
    });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      isActive: true,
    },
  });

  const employeeCode = `TEST-${timestamp}`;
  const employee = await prisma.employee.create({
    data: {
      userId: user.id,
      employeeCode,
      departmentId: dept.id,
      designationId: desig.id,
      basicSalary,
      joiningDate: new Date(),
      status: "ACTIVE",
    },
  });

  return {
    userId: user.id,
    employeeId: employee.id,
    email,
    name,
  };
}

/**
 * Delete a test user (cascades to employee, leave, attendance, payroll).
 */
export async function cleanupTestUser(email: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.loginActivity.deleteMany({ where: { userId: user.id } });
      await prisma.leaveRequest.deleteMany({ where: { requesterId: user.id } });
      const emp = await prisma.employee.findUnique({ where: { userId: user.id } });
      if (emp) {
        await prisma.attendance.deleteMany({ where: { employeeId: emp.id } });
        await prisma.leaveBalance.deleteMany({ where: { employeeId: emp.id } });
        await prisma.payroll.deleteMany({ where: { employeeId: emp.id } });
        await prisma.employee.delete({ where: { id: emp.id } });
      }
      await prisma.user.delete({ where: { id: user.id } });
    }
  } catch (err) {
    console.warn(`Cleanup warning for ${email}:`, err);
  }
}

/**
 * Clean up ALL test records (those with TEST_ prefix or @test.buildorbit.local email).
 * Call at the start of a test run to ensure a clean slate.
 */
export async function cleanupAllTestData(): Promise<void> {
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: TEST_EMAIL_SUFFIX } },
        { name: { startsWith: TEST_PREFIX } },
      ],
    },
  });

  for (const user of testUsers) {
    await cleanupTestUser(user.email);
  }

  // Also cleanup any test leads
  await prisma.lead.deleteMany({
    where: {
      OR: [
        { title: { startsWith: TEST_PREFIX } },
        { contactEmail: { contains: TEST_EMAIL_SUFFIX } },
      ],
    },
  });

  // Cleanup test leave requests that reference test users (already handled above)
  // Cleanup test payroll (already handled above)
  // Cleanup test OTP verifications
  await prisma.otpVerification.deleteMany({
    where: { email: { contains: TEST_EMAIL_SUFFIX } },
  });
}

// ---------------------------------------------------------------------------
// Fetch seeded user IDs
// ---------------------------------------------------------------------------

/**
 * Get the userId of a seeded user by email.
 * These users exist because the seed was run.
 */
export async function getSeededUserId(email: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  return user.id;
}

export async function getSeededEmployeeId(email: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
    include: { employee: true },
  });
  if (!user.employee)
    throw new Error(`No employee profile for user ${email}`);
  return user.employee.id;
}

// ---------------------------------------------------------------------------
// Create test leads
// ---------------------------------------------------------------------------

export interface TestLead {
  leadId: string;
  title: string;
}

export async function createTestLead(createdByEmail: string): Promise<TestLead> {
  const createdBy = await prisma.user.findUniqueOrThrow({
    where: { email: createdByEmail },
  });
  const title = `${TEST_PREFIX}Lead_${Date.now()}`;
  const lead = await prisma.lead.create({
    data: {
      title,
      contactName: "Test Contact",
      contactEmail: `contact_${Date.now()}${TEST_EMAIL_SUFFIX}`,
      company: "Test Company Ltd",
      source: "OTHER",
      status: "NEW",
      value: 10000,
      createdById: createdBy.id,
    },
  });
  return { leadId: lead.id, title };
}

export async function cleanupTestLead(leadId: string): Promise<void> {
  try {
    await prisma.leadFollowUp.deleteMany({ where: { leadId } });
    await prisma.lead.delete({ where: { id: leadId } });
  } catch (err) {
    console.warn(`Lead cleanup warning:`, err);
  }
}

// ---------------------------------------------------------------------------
// Create test leave requests
// ---------------------------------------------------------------------------

export interface TestLeaveRequest {
  leaveRequestId: string;
}

export async function createTestLeaveRequest(
  requesterEmail: string,
  options?: {
    status?: LeaveStatus;
    startDaysFromNow?: number;
    days?: number;
  }
): Promise<TestLeaveRequest> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: requesterEmail },
  });

  // Find an active leave type
  const leaveType = await prisma.leaveType.findFirst({
    where: { isActive: true },
  });
  if (!leaveType) throw new Error("No active leave type found. Run seed first.");

  const startDaysFromNow = options?.startDaysFromNow ?? 5;
  const days = options?.days ?? 1;
  const start = new Date();
  start.setDate(start.getDate() + startDaysFromNow);
  while (start.getDay() === 0 || start.getDay() === 6) {
    start.setDate(start.getDate() + 1);
  }
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  end.setHours(0, 0, 0, 0);

  const req = await prisma.leaveRequest.create({
    data: {
      requesterId: user.id,
      leaveTypeId: leaveType.id,
      startDate: start,
      endDate: end,
      days,
      reason: "Test leave request — automated test",
      status: options?.status ?? LeaveStatus.PENDING,
    },
  });

  return { leaveRequestId: req.id };
}

export async function cleanupTestLeaveRequest(id: string): Promise<void> {
  try {
    await prisma.leaveRequest.delete({ where: { id } });
  } catch (err) {
    console.warn(`Leave request cleanup warning:`, err);
  }
}

// ---------------------------------------------------------------------------
// Create test payroll
// ---------------------------------------------------------------------------

export interface TestPayroll {
  payrollId: string;
}

export async function createTestPayroll(
  employeeId: string,
  month?: number,
  year?: number
): Promise<TestPayroll> {
  const now = new Date();
  const m = month ?? (now.getMonth() === 0 ? 12 : now.getMonth()); // previous month
  const y = year ?? (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());

  // Check if one already exists, if so delete and recreate for test isolation
  const existing = await prisma.payroll.findUnique({
    where: { employeeId_month_year: { employeeId, month: m, year: y } },
  });
  if (existing) {
    await prisma.payroll.delete({ where: { id: existing.id } });
  }

  const payroll = await prisma.payroll.create({
    data: {
      employeeId,
      month: m,
      year: y,
      basicSalary: 50000,
      allowances: 10000,
      deductions: 5000,
      netSalary: 55000,
      status: "DRAFT",
      notes: "TEST_PAYROLL",
    },
  });

  return { payrollId: payroll.id };
}

export async function cleanupTestPayroll(payrollId: string): Promise<void> {
  try {
    await prisma.payroll.delete({ where: { id: payrollId } });
  } catch (err) {
    console.warn(`Payroll cleanup warning:`, err);
  }
}

// ---------------------------------------------------------------------------
// Disconnect
// ---------------------------------------------------------------------------

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
