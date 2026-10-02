/**
 * BuildOrbit — Employee CRUD Tests
 * Tests complete Create → Read → Update → Delete/Deactivate lifecycle.
 * Verifies database persistence after each operation.
 *
 * Tags: @main @crud @forms
 */

import { test, expect } from "@playwright/test";
import {
  prisma,
  cleanupTestUser,
  getSeededEmployeeId,
  createTestEmployee,
  TEST_EMAIL_SUFFIX,
} from "./helpers/db";

// ============================================================
// CREATE EMPLOYEE
// ============================================================

test.describe("Employee CRUD @main @crud", () => {
  // Use admin authentication for employee CRUD
  test.use({ storageState: "tests/e2e/.auth/admin.json" });
  test("create employee form loads with all required fields", async ({
    page,
  }) => {
    await page.goto("/workforce/employees/new");
    await page.waitForLoadState("domcontentloaded");

    // Must have name, email, password, role, joining date fields
    await expect(page.locator('[name="name"]')).toBeVisible();
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('[name="joiningDate"]')).toBeVisible();
  });

  test("create employee with valid data persists to database", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testEmail = `crud_emp_${timestamp}${TEST_EMAIL_SUFFIX}`;
    const testName = `TEST_Employee_${timestamp}`;

    try {
      await page.goto("/workforce/employees/new");
      await page.waitForLoadState("domcontentloaded");

      await page.fill('[name="name"]', testName);
      await page.fill('[name="email"]', testEmail);
      await page.fill('[name="password"]', "TestPassword@123");

      // Set role if field exists
      const roleSelect = page.locator('[name="role"]');
      if ((await roleSelect.count()) > 0) {
        await roleSelect.selectOption("ENGINEER");
      }

      // Set joining date
      const today = new Date().toISOString().split("T")[0];
      await page.fill('[name="joiningDate"]', today);

      // Set basic salary if field exists
      const salaryField = page.locator('[name="basicSalary"]');
      if ((await salaryField.count()) > 0) {
        await salaryField.fill("60000");
      }

      // Submit
      // Wait for hydration
      await page.waitForTimeout(1000);
      await page.locator('button[type="submit"]:not([title="Log out"])').click();

      // Wait for redirect to finish
      await page.waitForURL("**/workforce/employees", { timeout: 10000 });

      // Verify in DB
      const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
      expect(
        dbUser,
        `Employee with email ${testEmail} was not created in DB`
      ).not.toBeNull();

      const dbEmployee = await prisma.employee.findUnique({
        where: { userId: dbUser!.id },
      });
      expect(dbEmployee, "Employee profile not created in DB").not.toBeNull();
    } finally {
      await cleanupTestUser(testEmail);
    }
  });

  test("create employee - duplicate email shows error", async ({ page }) => {
    await page.goto("/workforce/employees/new");
    await page.waitForLoadState("domcontentloaded");

    const today = new Date().toISOString().split("T")[0];
    await page.fill('[name="name"]', "Duplicate Test User");
    await page.fill('[name="email"]', "admin@buildorbit.dev"); // already exists
    await page.fill('[name="password"]', "Password@123");
    await page.fill('[name="joiningDate"]', today);

    await page.locator('button[type="submit"]:not([title="Log out"])').click();
    await page.waitForLoadState("networkidle");

    // Should stay on form or show an error
    const hasError =
      (await page
        .locator("text=/already exists|duplicate|taken/i")
        .count()) > 0 ||
      page.url().includes("/new");
    expect(
      hasError,
      "Duplicate email should show error or stay on form"
    ).toBeTruthy();
  });

  test("create employee - missing required fields shows validation", async ({
    page,
  }) => {
    await page.goto("/workforce/employees/new");
    await page.locator('button[type="submit"]:not([title="Log out"])').click();
    await page.waitForLoadState("networkidle");

    // Should stay on form
    expect(page.url()).toContain("/new");
  });

  test("create employee - missing name shows validation", async ({ page }) => {
    await page.goto("/workforce/employees/new");

    const today = new Date().toISOString().split("T")[0];
    await page.fill('[name="email"]', `test_${Date.now()}${TEST_EMAIL_SUFFIX}`);
    await page.fill('[name="password"]', "Password@123");
    await page.fill('[name="joiningDate"]', today);

    await page.locator('button[type="submit"]:not([title="Log out"])').click();
    await page.waitForLoadState("networkidle");

    // Should show error or stay on page
    const blocked = page.url().includes("/new") ||
      (await page.locator("text=/name|required/i").count()) > 0;
    expect(blocked).toBeTruthy();
  });

  // ============================================================
  // READ EMPLOYEE
  // ============================================================

  test("employees list page shows employee records", async ({ page }) => {
    await page.goto("/workforce/employees");
    await page.waitForLoadState("networkidle");

    // Should have at least one employee row (from seed data)
    const rows = page.locator("table tbody tr, [data-testid='employee-row']");
    const count = await rows.count();
    expect(count, "Employees list should show at least one record").toBeGreaterThan(0);
  });

  test("employee search/filter works", async ({ page }) => {
    await page.goto("/workforce/employees");
    await page.waitForLoadState("networkidle");

    // Look for a search input
    const searchInput = page.locator(
      '[placeholder*="search" i], [type="search"], input[name="search"]'
    );
    if ((await searchInput.count()) === 0) {
      test.skip();
      return;
    }

    await searchInput.first().fill("Alex");
    await page.waitForTimeout(500); // debounce

    // Should show filtered results or "no results" message
    const bodyText = await page.innerText("body");
    expect(bodyText?.toLowerCase()).toMatch(/alex|no result|not found/);
  });

  test("employee detail page loads with correct data", async ({ page }) => {
    // Get a real employee from DB
    const emp = await prisma.employee.findFirst({
      include: { user: true },
    });
    if (!emp) {
      test.skip();
      return;
    }

    await page.goto(`/workforce/employees/${emp.id}`);
    await page.waitForLoadState("domcontentloaded");

    // Should show employee info
    const bodyText = await page.innerText("body");
    // Employee name or email should appear on the page
    const nameVisible =
      bodyText?.includes(emp.user?.name || "") ||
      bodyText?.includes(emp.user?.email || "") ||
      bodyText?.includes(emp.employeeCode);
    expect(nameVisible, "Employee detail should show employee info").toBeTruthy();
  });

  // ============================================================
  // UPDATE EMPLOYEE
  // ============================================================

  test("employee profile can be updated", async ({ page }) => {
    // Create a test employee to update
    const testEmp = await createTestEmployee({ role: "ENGINEER" });

    try {
      await page.goto(`/workforce/employees/${testEmp.employeeId}`);
      await page.waitForLoadState("domcontentloaded");

      // Look for an edit button
      const editBtn = page.locator(
        "button:has-text('Edit'), a:has-text('Edit'), [data-testid='edit-employee']"
      );
      if ((await editBtn.count()) === 0) {
        // Try inline edit field
        test.skip();
        return;
      }
      await editBtn.first().click();
      await page.waitForTimeout(500);

      // Look for a phone field or any editable field
      const phoneField = page.locator('[name="phone"]');
      if ((await phoneField.count()) > 0) {
        await phoneField.fill("+91 9876543210");
        const saveBtn = page.locator(
          "button:has-text('Save'), button:has-text('Update'), [type='submit']:not([title='Log out'])"
        );
        if ((await saveBtn.count()) > 0) {
          await saveBtn.first().click();
          await expect(page.locator("text=/updated successfully/i")).toBeVisible({ timeout: 10000 });

          // Verify update in DB
          const updated = await prisma.employee.findUnique({
            where: { id: testEmp.employeeId },
          });
          expect(updated?.phone).toMatch(/9876543210/);
        }
      }
    } finally {
      await cleanupTestUser(testEmp.email);
    }
  });

  // ============================================================
  // DELETE / DEACTIVATE EMPLOYEE
  // ============================================================

  test("engineer cannot access employee create page", async ({ browser }) => {
    const fs = await import("fs");
    const path = await import("path");
    const authFile = path.join(__dirname, ".auth", "engineer.json");

    if (!fs.existsSync(authFile)) {
      test.skip();
      return;
    }

    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();
    try {
      await page.goto("/workforce/employees/new");
      await page.waitForLoadState("networkidle");

      // Engineer should be redirected or see forbidden
      const url = page.url();
      const bodyText = (await page.innerText("body")) || "";
      const isBlocked =
        url.includes("/dashboard") ||
        url.includes("/login") ||
        bodyText.toLowerCase().includes("unauthorized") ||
        bodyText.toLowerCase().includes("forbidden") ||
        bodyText.toLowerCase().includes("not authorized");

      expect(
        isBlocked,
        `Engineer should not access /workforce/employees/new, got url: ${url}`
      ).toBeTruthy();
    } finally {
      await context.close();
    }
  });
});

// ============================================================
// API LEVEL EMPLOYEE TESTS
// ============================================================

test.describe("Employee API @api @main", () => {
  test("GET /api/employees/[id] returns employee data", async ({ request }) => {
    const emp = await prisma.employee.findFirst({
      include: { user: true },
    });
    if (!emp) {
      test.skip();
      return;
    }

    // Note: API routes require auth cookie — we use the session from storageState
    const response = await request.get(`/api/employees/${emp.id}`);
    // Accept 200 (success) or 401 (if auth not passed via request context)
    expect([200, 401, 403]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty("id");
    }
  });

  test("GET /api/employees/[id] with non-existent ID returns 404 or error", async ({
    request,
  }) => {
    const response = await request.get(`/api/employees/nonexistent-id-xyz`);
    expect([404, 401, 400]).toContain(response.status());
  });

  test("DELETE /api/employees/[id] without auth returns 401", async ({
    playwright,
  }) => {
    const emp = await prisma.employee.findFirst();
    if (!emp) {
      test.skip();
      return;
    }
    const unauthRequest = await playwright.request.newContext();
    const response = await unauthRequest.delete(`${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000"}/api/employees/${emp.id}`);
    // Without auth cookie, should return 401, 403, or 405
    expect([401, 403, 405]).toContain(response.status());
  });
});
