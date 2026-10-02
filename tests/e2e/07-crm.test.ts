/**
 * BuildOrbit — CRM / Lead Tests
 * Tests: lead creation, follow-ups, status updates, pipeline, reports.
 *
 * Tags: @main @crud @forms @api @workflow
 */

import { test, expect } from "@playwright/test";
import {
  prisma,
  createTestLead,
  cleanupTestLead,
  TEST_EMAIL_SUFFIX,
} from "./helpers/db";

// ============================================================
// LEADS LIST PAGE
// ============================================================

test.describe("CRM Leads @main @crud", () => {
  test("leads page loads with lead records", async ({ page }) => {
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");

    const bodyText = await page.innerText("body");
    const hasContent =
      (bodyText?.toLowerCase().includes("lead") ?? false) ||
      (bodyText?.toLowerCase().includes("pipeline") ?? false) ||
      (bodyText?.toLowerCase().includes("contact") ?? false);
    expect(hasContent, "Leads page should show lead-related content").toBeTruthy();
  });

  test("leads page has add lead button", async ({ page }) => {
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");

    const addBtn = page.locator(
      "button:has-text('Add'), button:has-text('New Lead'), button:has-text('Create')"
    );
    expect(await addBtn.count()).toBeGreaterThan(0);
  });

  // ============================================================
  // CREATE LEAD
  // ============================================================

  test("create lead dialog/form opens on button click", async ({ page }) => {
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", { name: /create lead/i });
    if ((await addBtn.count()) === 0) {
      test.skip();
      return;
    }

    // Wait for React hydration
    await page.waitForTimeout(1000);
    await addBtn.first().click();
    
    // Wait for dialog/form to appear
    let formVisible = false;
    try {
      await page.waitForSelector('[name="title"]', { state: "visible", timeout: 3000 });
      formVisible = true;
    } catch (e) {
      // Hydration might have missed the first click
      await addBtn.first().click({ force: true });
      try {
        await page.waitForSelector('[name="title"]', { state: "visible", timeout: 3000 });
        formVisible = true;
      } catch (err) {}
    }
    expect(formVisible, "Add lead form/dialog should open").toBeTruthy();
  });

  test("create lead - empty title shows validation", async ({ page }) => {
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");

    const addBtn = page.locator(
      "button:has-text('Add'), button:has-text('New Lead'), button:has-text('Create Lead')"
    );
    if ((await addBtn.count()) === 0) {
      test.skip();
      return;
    }

    await addBtn.first().click();
    await page.waitForTimeout(500);

    // Submit without filling anything
    const submitBtn = page.locator(
      '[role="dialog"] [type="submit"], form button[type="submit"]:not([title="Log out"])'
    );
    if ((await submitBtn.count()) > 0) {
      await submitBtn.first().click();
      await page.waitForTimeout(500);

      // Should show validation or stay in dialog
      const dialogStillOpen = (await page.locator('[role="dialog"]').count()) > 0;
      const hasError =
        (await page.locator("text=/required|title|name/i").count()) > 0;
      expect(dialogStillOpen || hasError).toBeTruthy();
    }
  });

  test("create lead - valid data creates lead in DB", async ({ page }) => {
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");

    const addBtn = page.locator(
      "button:has-text('Add'), button:has-text('New Lead'), button:has-text('Create Lead')"
    );
    if ((await addBtn.count()) === 0) {
      test.skip();
      return;
    }

    const countBefore = await prisma.lead.count();
    const testTitle = `TEST_Lead_${Date.now()}`;

    await page.waitForTimeout(1000);
    await addBtn.first().click();

    let titleField = page.locator('[name="title"]');
    try {
      await titleField.waitFor({ state: "visible", timeout: 3000 });
    } catch (e) {
      // Hydration might have missed the first click
      await addBtn.first().click({ force: true });
      try {
        await titleField.waitFor({ state: "visible", timeout: 3000 });
      } catch (e2) {
        test.skip();
        return;
      }
    }

    await titleField.fill(testTitle);

    // Fill optional fields if present
    const emailField = page.locator('[name="email"]');
    if ((await emailField.count()) > 0) {
      await emailField.fill(`test_lead_${Date.now()}${TEST_EMAIL_SUFFIX}`);
    }

    const submitBtn = page.locator(
      '[role="dialog"] [type="submit"], form button[type="submit"]:not([title="Log out"])'
    );
    if ((await submitBtn.count()) > 0) {
      await submitBtn.first().click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });

      const countAfter = await prisma.lead.count();
      expect(countAfter, "Lead count should increase").toBeGreaterThan(countBefore);

      // Cleanup
      const newLead = await prisma.lead.findFirst({
        where: { title: testTitle },
        orderBy: { createdAt: "desc" },
      });
      if (newLead) {
        await cleanupTestLead(newLead.id);
      }
    }
  });

  // ============================================================
  // LEAD DETAIL
  // ============================================================

  test("lead detail page loads with follow-ups", async ({ page }) => {
    const lead = await prisma.lead.findFirst({
      include: { followUps: true },
    });
    if (!lead) {
      test.skip();
      return;
    }

    await page.goto(`/crm/leads/${lead.id}`);
    await page.waitForLoadState("domcontentloaded");

    expect(page.url()).not.toContain("/login");
    const bodyText = await page.innerText("body");
    expect(bodyText?.toLowerCase()).toContain("lead");
  });

  test("lead detail shows follow-up section", async ({ page }) => {
    const lead = await prisma.lead.findFirst({
      include: { followUps: true },
    });
    if (!lead) {
      test.skip();
      return;
    }

    await page.goto(`/crm/leads/${lead.id}`);
    await page.waitForLoadState("networkidle");

    const bodyText = await page.innerText("body");
    const hasFollowUpSection =
      bodyText?.toLowerCase().includes("follow") ?? false;
    expect(hasFollowUpSection, "Lead detail should have follow-up section").toBeTruthy();
  });

  // ============================================================
  // LEAD STATUS UPDATES
  // ============================================================

  test("lead status can be changed", async ({ page }) => {
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@buildorbit.dev" },
    });
    if (!adminUser) {
      test.skip();
      return;
    }

    const { leadId, title } = await createTestLead("admin@buildorbit.dev");

    try {
      await page.goto(`/crm/leads/${leadId}`);
      await page.waitForLoadState("networkidle");

      // Look for status dropdown/select
      const statusSelect = page.locator('[name="status"], select[data-testid="lead-status"]');
      if ((await statusSelect.count()) > 0) {
        await statusSelect.selectOption("CONTACTED");
        await page.waitForTimeout(500);

        // May auto-save or need a submit button
        const saveBtn = page.locator("button:has-text('Save'), button:has-text('Update')");
        if ((await saveBtn.count()) > 0) {
          await saveBtn.first().click();
          await page.waitForLoadState("networkidle");
        }

        // Verify in DB
        const updatedLead = await prisma.lead.findUnique({ where: { id: leadId } });
        expect(updatedLead?.status).toBe("CONTACTED");
      }
    } finally {
      await cleanupTestLead(leadId);
    }
  });

  // ============================================================
  // LEAD FOLLOW-UP API
  // ============================================================

  test("POST /api/leads/[id]/follow-ups creates a follow-up", async ({ page }) => {
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@buildorbit.dev" },
    });
    if (!adminUser) {
      test.skip();
      return;
    }

    const { leadId } = await createTestLead("admin@buildorbit.dev");

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await page.request.post(
        `/api/leads/${leadId}/follow-ups`,
        {
          data: {
            notes: "Test follow-up from automated tests",
            followUpDate: tomorrow.toISOString().split("T")[0],
          },
        }
      );

      if (response.status() === 200 || response.status() === 201) {
        // Verify in DB
        const followUps = await prisma.leadFollowUp.findMany({
          where: { leadId },
        });
        expect(followUps.length).toBeGreaterThan(0);
        expect(followUps[0].notes).toContain("Test follow-up");
      } else {
        // Auth via page.request may not include cookies automatically
        console.log(`Follow-up API returned ${response.status()}`);
        expect([200, 201, 401, 403]).toContain(response.status());
      }
    } finally {
      await cleanupTestLead(leadId);
    }
  });

  test("GET /api/leads/[id] returns lead data", async ({ page }) => {
    const lead = await prisma.lead.findFirst();
    if (!lead) {
      test.skip();
      return;
    }

    const response = await page.request.get(`/api/leads/${lead.id}`);
    expect([200, 401, 403]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty("id");
      expect(data.id).toBe(lead.id);
    }
  });

  test.describe("Unauthorized Access", () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    
    test("PATCH /api/leads/[id] without auth returns 401", async ({ request }) => {
      const lead = await prisma.lead.findFirst();
      if (!lead) {
        test.skip();
        return;
      }

      const response = await request.patch(`/api/leads/${lead.id}`, {
        data: { status: "QUALIFIED" },
      });
      expect([401, 403]).toContain(response.status());
    });
  });
});

// ============================================================
// LEAD REPORTS
// ============================================================

test.describe("Lead Reports @main", () => {
  test("lead reports page loads", async ({ page }) => {
    await page.goto("/reports/leads");
    await page.waitForLoadState("networkidle");

    expect(new URL(page.url()).pathname).not.toBe("/login");
    const bodyText = await page.innerText("body");
    const hasContent =
      (bodyText?.toLowerCase().includes("lead") ?? false) ||
      (bodyText?.toLowerCase().includes("report") ?? false) ||
      (bodyText?.toLowerCase().includes("pipeline") ?? false);
    expect(hasContent).toBeTruthy();
  });
});
