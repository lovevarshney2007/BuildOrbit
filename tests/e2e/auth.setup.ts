/**
 * BuildOrbit — Auth Setup
 * Creates authenticated session storage states for all 5 roles.
 * These are reused by all subsequent tests via storageState.
 *
 * This runs ONCE before the test projects execute.
 */

import { test as setup, expect } from "@playwright/test";
import { TEST_USERS } from "./helpers/auth";
import { prisma } from "./helpers/db";
import * as fs from "fs";
import * as path from "path";

const AUTH_DIR = path.join(__dirname, ".auth");

// Ensure the .auth directory exists
setup.beforeAll(async () => {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
});

/**
 * Login via the UI form and save the storage state to disk.
 * The storageState file captures the httpOnly session cookie.
 */
async function saveAuthState(
  context: import("@playwright/test").BrowserContext,
  page: import("@playwright/test").Page,
  role: keyof typeof TEST_USERS
) {
  const user = TEST_USERS[role];

  // Verify the user exists in DB before trying to log in
  const dbUser = await prisma.user
    .findUnique({ where: { email: user.email } })
    .catch(() => null);

  if (!dbUser) {
    throw new Error(
      `Seed user ${user.email} not found in database. Run: npx prisma db seed`
    );
  }

  await page.goto("/login");
  await expect(
    page.locator("h1, [data-testid='login-title']").first()
  ).toBeVisible({ timeout: 10000 });

  await page.fill('[name="email"]', user.email);
  await page.fill('[name="password"]', user.password);
  await page.click('[type="submit"]');

  // Wait for successful redirect to dashboard
  await page.waitForURL("/dashboard", { timeout: 20000 });

  const statePath = path.join(AUTH_DIR, `${role.toLowerCase().replace("_", "-")}.json`);
  await context.storageState({ path: statePath });
  console.log(`✅ Auth state saved for ${role} → ${statePath}`);
}

setup("Create SUPER_ADMIN auth state", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await saveAuthState(context, page, "SUPER_ADMIN");
  await context.close();
});

setup("Create ADMIN auth state", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await saveAuthState(context, page, "ADMIN");
  await context.close();
});

setup("Create HR auth state", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await saveAuthState(context, page, "HR");
  await context.close();
});

setup("Create LEAD auth state", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await saveAuthState(context, page, "LEAD");
  await context.close();
});

setup("Create ENGINEER auth state", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await saveAuthState(context, page, "ENGINEER");
  await context.close();
});
