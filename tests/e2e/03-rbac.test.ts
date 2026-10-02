/**
 * BuildOrbit — Role-Based Access Control Tests
 * Verifies that each role can access only the routes they are authorized for.
 *
 * Tests both:
 * 1. UI access (navigation visible/hidden)
 * 2. Direct URL access (server-side auth)
 *
 * Tags: @super-admin @admin @hr @lead @engineer @all-roles
 */

import { test, expect, Browser, BrowserContext, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Role access matrices from navConfig + layout auth
// ---------------------------------------------------------------------------

type Role = "SUPER_ADMIN" | "ADMIN" | "HR" | "LEAD" | "ENGINEER";

interface RouteAccess {
  path: string;
  allowedRoles: Role[];
}

const ROUTE_ACCESS: RouteAccess[] = [
  // All roles can access
  { path: "/dashboard", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"] },
  { path: "/workforce/attendance", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"] },
  { path: "/workforce/leave", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"] },
  { path: "/profile", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"] },
  { path: "/workforce/payslip", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"] },

  // SUPER_ADMIN, ADMIN, HR, LEAD can see employees list
  { path: "/workforce/employees", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR", "LEAD"] },

  // HR & PAYROLL — SUPER_ADMIN, ADMIN, HR
  { path: "/hr/leave-types", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR"] },
  { path: "/hr/leave-approval", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR"] },
  { path: "/hr/payroll", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR"] },

  // REPORTS
  { path: "/reports/attendance", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR"] },
  { path: "/reports/payroll", allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR"] },
  { path: "/reports/leads", allowedRoles: ["SUPER_ADMIN", "ADMIN", "LEAD"] },

  // CRM — SUPER_ADMIN, ADMIN, LEAD
  { path: "/crm/leads", allowedRoles: ["SUPER_ADMIN", "ADMIN", "LEAD"] },

  // ADMIN settings — SUPER_ADMIN, ADMIN
  { path: "/admin/settings", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/admin/login-activity", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },

  // SUPER_ADMIN only
  { path: "/admin/roles", allowedRoles: ["SUPER_ADMIN"] },
];

// ---------------------------------------------------------------------------
// Helper: load a role's storage state and create context
// ---------------------------------------------------------------------------

const AUTH_DIR = path.join(__dirname, ".auth");

type AuthRole = "super-admin" | "admin" | "hr" | "lead" | "engineer";

function authFile(role: AuthRole): string {
  return path.join(AUTH_DIR, `${role}.json`);
}

function roleToAuthRole(role: Role): AuthRole {
  return role.toLowerCase().replace("_", "-") as AuthRole;
}

async function createContextForRole(
  browser: Browser,
  role: Role
): Promise<{ context: BrowserContext; page: Page }> {
  const stateFile = authFile(roleToAuthRole(role));
  if (!fs.existsSync(stateFile)) {
    throw new Error(
      `Auth state for ${role} not found at ${stateFile}. Run the setup project first.`
    );
  }
  const context = await browser.newContext({
    storageState: stateFile,
  });
  const page = await context.newPage();
  return { context, page };
}

// ---------------------------------------------------------------------------
// ALLOWED ROUTES — each role should be able to access their routes
// ---------------------------------------------------------------------------

test.describe("Role Access — Allowed Routes @all-roles", () => {
  const ALL_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"];

  for (const role of ALL_ROLES) {
    const allowedRoutes = ROUTE_ACCESS.filter((r) =>
      r.allowedRoles.includes(role)
    );

    test.describe(`${role}`, () => {
      for (const route of allowedRoutes) {
        test(`${role} can access ${route.path}`, async ({ browser }) => {
          const { context, page } = await createContextForRole(browser, role);
          try {
            await page.goto(route.path, { waitUntil: "domcontentloaded", timeout: 20000 });

            // Must not redirect to login page
            expect(new URL(page.url()).pathname).not.toBe("/login");

            // Must not be a 404
            const bodyText = (await page.innerText("body")) || "";
            expect(
              bodyText.toLowerCase(),
              `${role} got 404 on ${route.path}`
            ).not.toContain("page not found");

            // Page must have content
            const textLength = bodyText.replace(/\s+/g, "").length;
            expect(
              textLength,
              `${role} sees blank page on ${route.path}`
            ).toBeGreaterThan(30);
          } finally {
            await context.close();
          }
        });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// FORBIDDEN ROUTES — roles must NOT access routes they don't own
// ---------------------------------------------------------------------------

test.describe("Role Access — Forbidden Routes @all-roles", () => {
  const FORBIDDEN_CHECKS: Array<{ role: Role; path: string; reason: string }> = [
    // ENGINEER cannot access management routes
    { role: "ENGINEER", path: "/hr/payroll", reason: "HR-only route" },
    { role: "ENGINEER", path: "/hr/leave-approval", reason: "HR-only route" },
    { role: "ENGINEER", path: "/admin/settings", reason: "Admin-only route" },
    { role: "ENGINEER", path: "/admin/roles", reason: "Super admin only" },

    // LEAD cannot access HR / admin routes
    { role: "LEAD", path: "/hr/payroll", reason: "HR-only route" },
    { role: "LEAD", path: "/hr/leave-approval", reason: "HR-only route" },
    { role: "LEAD", path: "/admin/roles", reason: "Super admin only" },
    { role: "LEAD", path: "/admin/settings", reason: "Admin+ only" },
    { role: "LEAD", path: "/reports/payroll", reason: "HR+ only report" },

    // HR cannot access CRM or super admin
    { role: "HR", path: "/crm/leads", reason: "CRM is for LEAD role" },
    { role: "HR", path: "/admin/roles", reason: "Super admin only" },

    // ADMIN cannot access super-admin-only roles page
    { role: "ADMIN", path: "/admin/roles", reason: "Super admin only" },
  ];

  for (const check of FORBIDDEN_CHECKS) {
    test(`${check.role} is blocked from ${check.path} (${check.reason})`, async ({
      browser,
    }) => {
      const { context, page } = await createContextForRole(browser, check.role);
      try {
        await page.goto(check.path, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});

        const url = page.url();
        const bodyText = (await page.innerText("body")) || "";

        // Acceptable outcomes: redirect to dashboard, show forbidden/unauthorized,
        // show 403/404, or redirect to login
        const isBlocked =
          new URL(url).pathname === "/dashboard" ||
          new URL(url).pathname === "/login" ||
          bodyText.toLowerCase().includes("unauthorized") ||
          bodyText.toLowerCase().includes("forbidden") ||
          bodyText.toLowerCase().includes("403") ||
          bodyText.toLowerCase().includes("access denied") ||
          bodyText.toLowerCase().includes("not authorized") ||
          bodyText.toLowerCase().includes("permission");

        expect(
          isBlocked,
          `${check.role} should be blocked from ${check.path} but was allowed. URL: ${url}`
        ).toBeTruthy();
      } finally {
        await context.close();
      }
    });
  }
});

// ---------------------------------------------------------------------------
// NAVIGATION VISIBILITY — nav links only shown to correct roles
// ---------------------------------------------------------------------------

test.describe("Navigation Visibility @all-roles", () => {
  test("ENGINEER does not see HR Payroll nav link", async ({ browser }) => {
    const { context, page } = await createContextForRole(browser, "ENGINEER");
    try {
      await page.goto("/dashboard");
      const payrollNavLink = page.locator('nav a[href="/hr/payroll"]');
      expect(await payrollNavLink.count()).toBe(0);
    } finally {
      await context.close();
    }
  });

  test("ENGINEER does not see Admin settings nav link", async ({ browser }) => {
    const { context, page } = await createContextForRole(browser, "ENGINEER");
    try {
      await page.goto("/dashboard");
      const settingsNavLink = page.locator('nav a[href="/admin/settings"]');
      expect(await settingsNavLink.count()).toBe(0);
    } finally {
      await context.close();
    }
  });

  test("HR does see Leave Approval nav link", async ({ browser }) => {
    const { context, page } = await createContextForRole(browser, "HR");
    try {
      await page.goto("/dashboard");
      const approvalNavLink = page.locator(
        'nav a[href="/hr/leave-approval"], nav a:has-text("Leave Approval")'
      );
      expect(await approvalNavLink.count()).toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  });

  test("SUPER_ADMIN sees Roles & Permissions nav link", async ({ browser }) => {
    const { context, page } = await createContextForRole(browser, "SUPER_ADMIN");
    try {
      await page.goto("/dashboard");
      const rolesNavLink = page.locator(
        'nav a[href="/admin/roles"], nav a:has-text("Roles")'
      );
      expect(await rolesNavLink.count()).toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  });

  test("LEAD sees Lead Follow-ups nav link", async ({ browser }) => {
    const { context, page } = await createContextForRole(browser, "LEAD");
    try {
      await page.goto("/dashboard");
      const crmLink = page.locator('nav a[href="/crm/leads"], nav a:has-text("Lead")');
      expect(await crmLink.count()).toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  });

  test("ENGINEER does not see Lead Follow-ups nav link", async ({ browser }) => {
    const { context, page } = await createContextForRole(browser, "ENGINEER");
    try {
      await page.goto("/dashboard");
      const crmLink = page.locator('nav a[href="/crm/leads"]');
      expect(await crmLink.count()).toBe(0);
    } finally {
      await context.close();
    }
  });
});
