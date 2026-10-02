/**
 * BuildOrbit — Visual Regression & Responsive Tests
 * Screenshots of stable pages for regression detection.
 * Responsive layout checks on mobile and tablet.
 *
 * Tags: @main
 */

import { test, expect } from "@playwright/test";

// ============================================================
// VISUAL REGRESSION — Screenshots of key pages
// ============================================================

test.describe("Visual Regression — Key Pages @main", () => {
  const SCREENSHOT_PAGES = [
    { path: "/login", name: "login", auth: false },
    { path: "/dashboard", name: "dashboard", auth: true },
    { path: "/workforce/employees", name: "employees", auth: true },
    { path: "/workforce/attendance", name: "attendance", auth: true },
    { path: "/workforce/leave", name: "leave", auth: true },
    { path: "/hr/payroll", name: "payroll", auth: true },
    { path: "/crm/leads", name: "crm-leads", auth: true },
    { path: "/admin/settings", name: "admin-settings", auth: true },
  ];

  for (const pg of SCREENSHOT_PAGES) {
    test(`screenshot: ${pg.name}`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

      if (page.url().includes("/login") && pg.auth) {
        // Auth redirect — skip screenshot
        return;
      }

      // Mask dynamic content that changes on every load:
      // - timestamps, dates, "X minutes ago", user-specific data
      const dynamicSelectors = [
        "time",
        '[data-testid="timestamp"]',
        ".recharts-text",
        ".recharts-cartesian-axis-tick-value",
      ];

      // Take a full-page screenshot
      await expect(page).toHaveScreenshot(`${pg.name}.png`, {
        fullPage: true,
        mask: dynamicSelectors.map((sel) => page.locator(sel)),
        maxDiffPixels: 500, // Allow minor rendering differences
        timeout: 15000,
      });
    });
  }
});

// ============================================================
// RESPONSIVE — Mobile layout
// ============================================================

test.describe("Responsive — Mobile @main", () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 15

  test.describe("Mobile Login", () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test("login page is usable on mobile", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Form fields must be visible and accessible
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('[type="submit"]')).toBeVisible();

    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(
      scrollWidth,
      `Login page overflows on mobile: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`
    ).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });
  });

  test("dashboard is usable on mobile", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Page should not be blank
    const bodyText = await page.innerText("body");
    expect((bodyText || "").replace(/\s+/g, "").length).toBeGreaterThan(20);

    // Check horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    // Allow some tolerance for minor browser differences
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);
  });

  test("employees list is usable on mobile", async ({ page }) => {
    await page.goto("/workforce/employees");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const bodyText = await page.innerText("body");
    expect((bodyText || "").replace(/\s+/g, "").length).toBeGreaterThan(20);
  });
});

// ============================================================
// RESPONSIVE — Tablet layout
// ============================================================

test.describe("Responsive — Tablet @main", () => {
  test.use({ viewport: { width: 1024, height: 1366 } }); // iPad Pro

  test("dashboard layout works on tablet", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const bodyText = await page.innerText("body");
    expect((bodyText || "").replace(/\s+/g, "").length).toBeGreaterThan(20);

    // Navigation should be present
    const nav = page.locator("nav, aside, [role='navigation']");
    expect(await nav.count()).toBeGreaterThan(0);
  });

  test("employees table works on tablet", async ({ page }) => {
    await page.goto("/workforce/employees");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const bodyText = await page.innerText("body");
    expect(bodyText?.toLowerCase()).toMatch(/employee/i);
  });

  test("leave form works on tablet", async ({ page }) => {
    await page.goto("/workforce/leave/new");
    await page.waitForLoadState("domcontentloaded");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await expect(page.locator('[name="startDate"]')).toBeVisible();
    await expect(page.locator('[name="endDate"]')).toBeVisible();
  });
});

// ============================================================
// NETWORK ERROR HANDLING
// ============================================================

test.describe("Network Error Handling @main", () => {
  test("app does not crash on slow network", async ({ page, context }) => {
    // Simulate slow network
    await context.route("**/*", async (route) => {
      await new Promise((r) => setTimeout(r, 100)); // 100ms delay
      await route.continue();
    });

    await page.goto("/dashboard", { waitUntil: "domcontentloaded", timeout: 30000 });

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const bodyText = await page.innerText("body");
    expect((bodyText || "").replace(/\s+/g, "").length).toBeGreaterThan(10);
  });

  test("app handles failed API gracefully", async ({ page, context }) => {
    // Block some API calls to simulate failures
    await context.route("**/api/**", async (route) => {
      await route.abort("failed");
    });

    // Navigate to a page — it should degrade gracefully, not crash
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    // Wait for any pending requests
    await page.waitForTimeout(2000);

    // Should not have uncaught React errors (graceful degradation)
    const criticalErrors = errors.filter(
      (e) => e.toLowerCase().includes("uncaught") || e.toLowerCase().includes("cannot read")
    );
    expect(
      criticalErrors,
      `App has uncaught errors on API failure: ${criticalErrors.join(", ")}`
    ).toHaveLength(0);
  });
});
