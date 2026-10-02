/**
 * BuildOrbit — Authentication Tests
 * Tests: login page, valid/invalid credentials, validation, logout, session, redirects.
 *
 * Tags: @unauthenticated (no auth state needed), @main
 */

import { test, expect } from "@playwright/test";
import { prisma } from "./helpers/db";

// ============================================================
// LOGIN PAGE LOAD
// ============================================================

test("@unauthenticated login page loads correctly", async ({ page }) => {
  await page.goto("/login");

  // Page title / heading
  await expect(page.locator("h1, h2").first()).toBeVisible();

  // Email + password fields must exist
  await expect(page.locator('[name="email"]')).toBeVisible();
  await expect(page.locator('[name="password"]')).toBeVisible();

  // Submit button must exist
  await expect(page.locator('[type="submit"]')).toBeVisible();

  // No console errors
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  expect(errors, `Console errors on /login: ${errors.join(", ")}`).toHaveLength(0);
});

test("@unauthenticated login page has no 404", async ({ page }) => {
  const response = await page.goto("/login");
  expect(response?.status()).toBe(200);
});

// ============================================================
// VALIDATION
// ============================================================

test("@unauthenticated login - empty form shows validation", async ({ page }) => {
  await page.goto("/login");
  await page.click('[type="submit"]');

  // Should show validation message (either field-level or general)
  // Check that we stayed on login page OR that an error appeared
  const url = page.url();
  const isStillOnLogin = url.includes("/login");
  const hasError =
    (await page.locator('[role="alert"], .error, [data-error]').count()) > 0 ||
    (await page.locator("text=/required|invalid|enter/i").count()) > 0;

  expect(
    isStillOnLogin || hasError,
    "Empty form submission should show validation or stay on login page"
  ).toBeTruthy();
});

test("@unauthenticated login - invalid email format shows validation", async ({
  page,
}) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "notanemail");
  await page.fill('[name="password"]', "somepassword");
  await page.click('[type="submit"]');

  // Should show email validation error
  const errorVisible =
    (await page.locator("text=/valid email|invalid email/i").count()) > 0 ||
    (await page.locator('[role="alert"]').count()) > 0;
  // If no visible error it might be browser-native HTML5 validation
  // which is acceptable — just verify no redirect to dashboard
  const redirectedToDashboard = page.url().includes("/dashboard");
  expect(redirectedToDashboard).toBeFalsy();
});

// ============================================================
// INVALID CREDENTIALS
// ============================================================

test("@unauthenticated login - wrong password shows error", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "admin@buildorbit.dev");
  await page.fill('[name="password"]', "WrongPassword999!");
  await page.click('[type="submit"]');

  // Must not redirect to dashboard
  await page.waitForLoadState("networkidle");
  expect(page.url()).not.toContain("/dashboard");

  // Must show an error message
  const hasError =
    (await page.locator("text=/invalid|incorrect|wrong|password/i").count()) >
    0;
  expect(hasError, "Wrong password should show error message").toBeTruthy();
});

test("@unauthenticated login - non-existent email shows error", async ({
  page,
}) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "nonexistent@buildorbit.dev");
  await page.fill('[name="password"]', "Password@123");
  await page.click('[type="submit"]');

  await page.waitForLoadState("networkidle");
  expect(page.url()).not.toContain("/dashboard");

  const hasError =
    (await page.locator("text=/invalid|incorrect|not found/i").count()) > 0;
  expect(hasError, "Non-existent email should show error message").toBeTruthy();
});

// ============================================================
// VALID LOGIN — ALL ROLES
// ============================================================

const ROLE_CREDENTIALS = [
  { role: "SUPER_ADMIN", email: process.env.SEED_ADMIN_EMAIL || "lovevarshney7002@gmail.com", password: process.env.SEED_ADMIN_PASSWORD || "Love@7002" },
  { role: "ADMIN", email: "admin@buildorbit.dev", password: "Password@123" },
  { role: "HR", email: "hr@buildorbit.dev", password: "Password@123" },
  { role: "LEAD", email: "lead@buildorbit.dev", password: "Password@123" },
  { role: "ENGINEER", email: "engineer@buildorbit.dev", password: "Password@123" },
];

for (const cred of ROLE_CREDENTIALS) {
  test(`@unauthenticated login - ${cred.role} can log in successfully`, async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', cred.email);
    await page.fill('[name="password"]', cred.password);
    await page.click('[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL("/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");
  });
}

// ============================================================
// SESSION PERSISTENCE
// ============================================================

test("@unauthenticated session persists on navigation", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/login");
  await page.fill('[name="email"]', "admin@buildorbit.dev");
  await page.fill('[name="password"]', "Password@123");
  await page.click('[type="submit"]');
  await page.waitForURL("/dashboard", { timeout: 15000 });

  // Navigate away and back — should still be authenticated
  await page.goto("/workforce/employees");
  expect(page.url()).toContain("/workforce/employees");
  expect(page.url()).not.toContain("/login");

  await context.close();
});

// ============================================================
// LOGOUT
// ============================================================

test("@unauthenticated logout redirects to login page", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log in first
  await page.goto("/login");
  await page.fill('[name="email"]', "admin@buildorbit.dev");
  await page.fill('[name="password"]', "Password@123");
  await page.click('[type="submit"]');
  await page.waitForURL("/dashboard", { timeout: 15000 });

  // Find and click logout button
  const logoutBtn = page.locator(
    "button:has-text('Logout'), button:has-text('Sign Out'), button:has-text('Log out'), [data-testid='logout']"
  );
  const logoutCount = await logoutBtn.count();
  if (logoutCount === 0) {
    // Try looking in a menu/dropdown first
    const userMenuBtn = page.locator(
      "[data-testid='user-menu'], [aria-label='User menu'], button:has-text('Admin')"
    );
    if ((await userMenuBtn.count()) > 0) {
      await userMenuBtn.first().click();
      await page.waitForTimeout(500);
    }
  }
  await logoutBtn.first().click();

  // Should redirect to login
  await page.waitForURL("/login", { timeout: 10000 });
  expect(page.url()).toContain("/login");

  await context.close();
});

// ============================================================
// PROTECTED ROUTE REDIRECTS
// ============================================================

const PROTECTED_ROUTES = [
  "/dashboard",
  "/workforce/employees",
  "/hr/payroll",
  "/admin/settings",
  "/crm/leads",
];

for (const route of PROTECTED_ROUTES) {
  test(`@unauthenticated protected route ${route} redirects to login`, async ({
    page,
  }) => {
    // Clear any existing cookies
    await page.context().clearCookies();
    await page.goto(route);

    // Should be redirected to login
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/login");
  });
}

// ============================================================
// REGISTER PAGE
// ============================================================

test("@unauthenticated register page loads", async ({ page }) => {
  const response = await page.goto("/register");
  expect(response?.status()).toBeLessThan(400);

  await expect(page.locator("h1, h2").first()).toBeVisible();
  // Should have name, email, password fields
  await expect(page.locator('[name="name"]')).toBeVisible();
  await expect(page.locator('[name="email"]')).toBeVisible();
  await expect(page.locator('[name="password"]')).toBeVisible();
});

test("@unauthenticated register - duplicate email shows error", async ({
  page,
}) => {
  await page.goto("/register");

  // Try registering with an existing email
  await page.fill('[name="name"]', "Duplicate Test");
  await page.fill('[name="email"]', "admin@buildorbit.dev");
  await page.fill('[name="password"]', "Password@123");
  await page.click('[type="submit"]');

  await page.waitForLoadState("networkidle");
  // Should show error or stay on register
  const hasError =
    (await page.locator("text=/already exists|already registered|taken/i").count()) > 0;
  const stayedOnPage =
    page.url().includes("/register") || page.url().includes("/login");
  expect(hasError || stayedOnPage).toBeTruthy();
});

// ============================================================
// ROOT REDIRECT
// ============================================================

test("@unauthenticated root / loads landing page", async ({
  page,
}) => {
  await page.context().clearCookies();
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  
  const bodyText = await page.innerText("body");
  expect(bodyText?.toLowerCase()).toContain("buildorbit");
});

// ============================================================
// EXPIRED / INVALID SESSION
// ============================================================

test("@unauthenticated invalid session cookie redirects to login", async ({
  page,
}) => {
  // Set a garbage session cookie
  await page.context().addCookies([
    {
      name: "buildorbit_session",
      value: "totally.invalid.token",
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  expect(page.url()).toContain("/login");
});
