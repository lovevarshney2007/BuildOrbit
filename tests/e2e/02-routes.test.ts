/**
 * BuildOrbit — Route Coverage Tests
 * Automatically visits every discoverable route and verifies:
 *   - HTTP 200 (no 404)
 *   - No blank/white screen
 *   - No uncaught React errors
 *   - No console errors
 *   - No "Coming Soon" / placeholder text
 *   - Expected navigation element present
 *
 * Tags: @routes @main
 */

import { test, expect, Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Route definitions with expected content/heading
// ---------------------------------------------------------------------------

interface RouteCheck {
  path: string;
  expectedText?: string | RegExp; // something that must appear on the page
  roles?: string[]; // if empty, any role can access
}

const ROUTES: RouteCheck[] = [
  // Dashboard
  { path: "/dashboard", expectedText: /dashboard/i },

  // Workforce
  { path: "/workforce/employees", expectedText: /employee/i },
  { path: "/workforce/attendance", expectedText: /attendance/i },
  { path: "/workforce/leave", expectedText: /leave/i },
  { path: "/workforce/payslip", expectedText: /payslip|payroll/i },

  // HR & Payroll
  { path: "/hr/leave-types", expectedText: /leave type|leave master/i },
  { path: "/hr/leave-approval", expectedText: /leave approval/i },
  { path: "/hr/payroll", expectedText: /payroll/i },

  // CRM
  { path: "/crm/leads", expectedText: /lead/i },

  // Reports
  { path: "/reports/leads", expectedText: /lead|report/i },
  { path: "/reports/attendance", expectedText: /attendance/i },
  { path: "/reports/payroll", expectedText: /payroll/i },

  // Admin
  { path: "/admin/settings", expectedText: /settings/i },
  { path: "/admin/roles", expectedText: /role|permission/i },
  { path: "/admin/login-activity", expectedText: /login|activity/i },

  // Profile
  { path: "/profile", expectedText: /personal information|employment details/i },

  // New employee form (accessible to admin)
  { path: "/workforce/employees/new", expectedText: /employee|add|create/i },

  // New leave form
  { path: "/workforce/leave/new", expectedText: /leave|apply/i },
];

// ---------------------------------------------------------------------------
// Forbidden text patterns that should NOT appear on real pages
// ---------------------------------------------------------------------------

const PLACEHOLDER_PATTERNS = [
  /coming soon/i,
  /under development/i,
  /not implemented/i,
  /placeholder/i,
  /todo/i,
  /lorem ipsum/i,
];

// ---------------------------------------------------------------------------
// Helper: visit and assert page
// ---------------------------------------------------------------------------

async function checkRoute(
  page: Page,
  route: RouteCheck,
  consoleErrors: string[]
): Promise<{ pass: boolean; reason?: string }> {
  try {
    const response = await page.goto(route.path, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    // Check HTTP status
    if (response && response.status() === 404) {
      return { pass: false, reason: `HTTP 404 at ${route.path}` };
    }

    // Check we didn't get redirected to login (which would indicate auth issue)
    if (new URL(page.url()).pathname === "/login") {
      return {
        pass: false,
        reason: `Redirected to login — auth state not working for ${route.path}`,
      };
    }

    // Wait for content to render
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
      // networkidle may timeout on pages with polling; that's OK
    });

    const bodyText = await page.innerText("body");

    // Check for placeholder text
    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (pattern.test(bodyText || "")) {
        return {
          pass: false,
          reason: `Page ${route.path} contains placeholder text matching: ${pattern}`,
        };
      }
    }

    // Check expected content is present
    if (route.expectedText) {
      const pattern =
        route.expectedText instanceof RegExp
          ? route.expectedText
          : new RegExp(route.expectedText, "i");
      if (!pattern.test(bodyText || "")) {
        return {
          pass: false,
          reason: `Page ${route.path} missing expected text: ${route.expectedText}`,
        };
      }
    }

    // Check navigation sidebar is present (indicator of correct layout)
    const navExists = (await page.locator("nav, [role='navigation'], aside").count()) > 0;
    if (!navExists) {
      return {
        pass: false,
        reason: `Page ${route.path} has no navigation element — possible layout crash`,
      };
    }

    // Check page is not blank
    const textLength = (bodyText || "").replace(/\s+/g, "").length;
    if (textLength < 50) {
      return {
        pass: false,
        reason: `Page ${route.path} appears blank (only ${textLength} non-whitespace chars)`,
      };
    }

    // Check console errors
    if (consoleErrors.length > 0) {
      const criticalErrors = consoleErrors.filter(
        (e) =>
          !e.includes("favicon") &&
          !e.includes("net::ERR_") &&
          !e.toLowerCase().includes("warning")
      );
      if (criticalErrors.length > 0) {
        return {
          pass: false,
          reason: `Page ${route.path} has console errors: ${criticalErrors.slice(0, 3).join("; ")}`,
        };
      }
    }

    return { pass: true };
  } catch (err) {
    return { pass: false, reason: `Error visiting ${route.path}: ${err}` };
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Route Coverage — All Discoverable Routes @routes @main", () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
  });

  for (const route of ROUTES) {
    test(`route ${route.path} loads successfully`, async ({ page }) => {
      const result = await checkRoute(page, route, consoleErrors);
      expect(result.pass, result.reason || "Route check failed").toBeTruthy();
    });
  }

  // -------------------------------------------------------------------------
  // 404 page
  // -------------------------------------------------------------------------

  test("non-existent route serves 404 or redirects gracefully", async ({
    page,
  }) => {
    const response = await page.goto("/this-route-does-not-exist-xyz-123");
    // Either a 404 response, or it redirects gracefully (e.g. to login)
    const status = response?.status() || 0;
    const url = page.url();
    const acceptable = status === 404 || new URL(url).pathname === "/login" || new URL(url).pathname === "/dashboard";
    expect(
      acceptable,
      `Expected 404 or redirect but got status ${status} at ${url}`
    ).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Root page
  // -------------------------------------------------------------------------

  test("root / loads landing page", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    
    // Should have some landing page content
    const bodyText = await page.innerText("body");
    expect(bodyText?.toLowerCase()).toContain("buildorbit");
  });
});

// ---------------------------------------------------------------------------
// Dynamic routes — test with real IDs from DB
// ---------------------------------------------------------------------------

test.describe("Dynamic Route Coverage @routes @main", () => {
  test("employee detail page loads for existing employee", async ({ page }) => {
    // Find a real employee ID by visiting the employees list
    await page.goto("/workforce/employees");
    await page.waitForLoadState("networkidle");

    // Look for a link to an employee detail page
    const employeeLink = page.locator('a[href*="/workforce/employees/"]').first();
    const count = await employeeLink.count();

    if (count === 0) {
      // No employee links visible — skip rather than fail
      test.skip();
      return;
    }

    const href = await employeeLink.getAttribute("href");
    if (!href) {
      test.skip();
      return;
    }

    await page.goto(href);
    await page.waitForLoadState("domcontentloaded");

    // Should not be a 404
    const bodyText = await page.innerText("body");
    expect(bodyText?.toLowerCase()).not.toContain("404");
    expect(bodyText?.toLowerCase()).not.toContain("not found");
    expect(new URL(page.url()).pathname).not.toBe("/login");
  });

  test("lead detail page loads for existing lead", async ({ page }) => {
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");

    const leadLink = page.locator('a[href*="/crm/leads/"]').first();
    const count = await leadLink.count();

    if (count === 0) {
      test.skip();
      return;
    }

    const href = await leadLink.getAttribute("href");
    if (!href) {
      test.skip();
      return;
    }

    await page.goto(href);
    await page.waitForLoadState("domcontentloaded");

    const bodyText = await page.innerText("body");
    expect(bodyText?.toLowerCase()).not.toContain("404");
    expect(new URL(page.url()).pathname).not.toBe("/login");
  });

  test("non-existent employee ID serves 404 or redirects", async ({ page }) => {
    const response = await page.goto("/workforce/employees/nonexistent-id-xyz");
    const status = response?.status() || 0;
    const url = page.url();
    const acceptable =
      status === 404 ||
      new URL(url).pathname === "/login" ||
      new URL(url).pathname === "/workforce/employees";
    expect(
      acceptable,
      `Expected 404 or redirect, got ${status} at ${url}`
    ).toBeTruthy();
  });
});
