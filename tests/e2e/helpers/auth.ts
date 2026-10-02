/**
 * BuildOrbit Test Helpers — Authentication Utilities
 * Provides cookie-based session creation for tests without going through the UI login form.
 */

import { BrowserContext, Page } from "@playwright/test";
import { SignJWT } from "jose";

export type TestRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "HR"
  | "LEAD"
  | "ENGINEER";

export interface TestUser {
  userId: string;
  email: string;
  name: string;
  role: TestRole;
  password: string;
}

// Seed users matching prisma/seed.ts
export const TEST_USERS: Record<TestRole, TestUser> = {
  SUPER_ADMIN: {
    userId: "", // populated at runtime
    email: process.env.SEED_ADMIN_EMAIL || "lovevarshney7002@gmail.com",
    name: "Super Admin",
    role: "SUPER_ADMIN",
    password: process.env.SEED_ADMIN_PASSWORD || "Love@7002",
  },
  ADMIN: {
    userId: "",
    email: "admin@buildorbit.dev",
    name: "Alex Johnson",
    role: "ADMIN",
    password: "Password@123",
  },
  HR: {
    userId: "",
    email: "hr@buildorbit.dev",
    name: "Sarah Williams",
    role: "HR",
    password: "Password@123",
  },
  LEAD: {
    userId: "",
    email: "lead@buildorbit.dev",
    name: "Michael Chen",
    role: "LEAD",
    password: "Password@123",
  },
  ENGINEER: {
    userId: "",
    email: "engineer@buildorbit.dev",
    name: "Love Varshney",
    role: "ENGINEER",
    password: "Password@123",
  },
};

const SESSION_COOKIE = "buildorbit_session";

/**
 * Create a signed JWT session token for the given user payload.
 * Uses the same SESSION_SECRET as the app.
 */
export async function createTestToken(payload: {
  userId: string;
  email: string;
  name: string;
  role: string;
}): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set in test environment");

  const key = new TextEncoder().encode(secret);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Set the session cookie on a browser context, bypassing the login form.
 * Call this after getting the userId from the database.
 */
export async function setSessionCookie(
  context: BrowserContext,
  user: TestUser & { userId: string }
): Promise<void> {
  const token = await createTestToken({
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
  const url = new URL(baseURL);

  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

/**
 * Login via the UI form. Use this for testing the login flow itself.
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('[type="submit"]');
  await page.waitForURL("/dashboard", { timeout: 15000 });
}

/**
 * Returns all protected routes that should be inaccessible to unauthenticated users.
 */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/workforce/employees",
  "/workforce/attendance",
  "/workforce/leave",
  "/workforce/payslip",
  "/hr/leave-types",
  "/hr/leave-approval",
  "/hr/payroll",
  "/crm/leads",
  "/reports/leads",
  "/reports/attendance",
  "/reports/payroll",
  "/admin/settings",
  "/admin/roles",
  "/admin/login-activity",
];

/**
 * Routes accessible to all authenticated roles (empty role array in navConfig = all).
 */
export const ALL_ROLE_ROUTES = [
  "/dashboard",
  "/workforce/attendance",
  "/workforce/leave",
  "/profile",
];

/**
 * Routes restricted to SUPER_ADMIN, ADMIN, HR (management routes).
 */
export const MANAGEMENT_ROUTES = [
  "/workforce/employees",
  "/hr/leave-types",
  "/hr/leave-approval",
  "/hr/payroll",
  "/reports/attendance",
  "/reports/payroll",
];

/**
 * Routes restricted to SUPER_ADMIN, ADMIN.
 */
export const ADMIN_ONLY_ROUTES = [
  "/admin/settings",
  "/admin/login-activity",
];

/**
 * Routes restricted to SUPER_ADMIN only.
 */
export const SUPER_ADMIN_ONLY_ROUTES = ["/admin/roles"];

/**
 * Routes accessible to SUPER_ADMIN, ADMIN, LEAD (CRM).
 */
export const CRM_ROUTES = ["/crm/leads", "/reports/leads"];

/**
 * Check that a page loaded successfully (no blank screen, no crash).
 */
export async function assertPageLoaded(page: Page, url: string): Promise<void> {
  const errors: string[] = [];

  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Check we are not on 404
  const title = await page.title();
  if (title.toLowerCase().includes("404")) {
    throw new Error(`Page ${url} returned 404 — title: ${title}`);
  }

  // Check for "coming soon" / placeholder text
  const bodyText = await page.textContent("body");
  const placeholders = ["coming soon", "under development", "not implemented", "placeholder"];
  for (const p of placeholders) {
    if (bodyText?.toLowerCase().includes(p)) {
      throw new Error(
        `Page ${url} contains placeholder text: "${p}" — feature is incomplete`
      );
    }
  }

  // Check there are no uncaught React errors
  if (errors.length > 0) {
    throw new Error(
      `Page ${url} has uncaught errors:\n${errors.join("\n")}`
    );
  }
}
