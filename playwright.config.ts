import { defineConfig, devices } from "@playwright/test";

/**
 * BuildOrbit — Playwright Configuration
 * Comprehensive E2E test configuration for the BuildOrbit application.
 *
 * Test environment:
 *   - App runs on http://localhost:3000 (started separately or via webServer)
 *   - Uses real development database (test data is prefixed TEST_ and cleaned up)
 *   - Session-based auth via JWT cookie
 */

export default defineConfig({
  testDir: "./tests/e2e",

  /* Run tests in files in parallel */
  fullyParallel: false, // Keep false to avoid data race conditions in DB

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Reporter to use */
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "playwright-report",
        open: "never",
      },
    ],
    ["json", { outputFile: "playwright-report/test-results.json" }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL of the application */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    /* Collect trace on first retry */
    trace: "on-first-retry",

    /* Capture screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Global timeout for each action */
    actionTimeout: 10000,

    /* Navigation timeout */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers and viewports */
  projects: [
    // -------------------------------------------------------------------------
    // Setup: Create authenticated sessions for all roles
    // -------------------------------------------------------------------------
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    // -------------------------------------------------------------------------
    // Desktop (Chrome) — Super Admin
    // -------------------------------------------------------------------------
    {
      name: "chromium-super-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/super-admin.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.(test|spec)\.(ts|js)/,
      grep: /@super-admin|@all-roles|@admin-roles/,
    },

    // -------------------------------------------------------------------------
    // Desktop (Chrome) — Admin
    // -------------------------------------------------------------------------
    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.(test|spec)\.(ts|js)/,
      grep: /@admin|@all-roles|@admin-roles/,
    },

    // -------------------------------------------------------------------------
    // Desktop (Chrome) — HR
    // -------------------------------------------------------------------------
    {
      name: "chromium-hr",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/hr.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.(test|spec)\.(ts|js)/,
      grep: /@hr|@all-roles/,
    },

    // -------------------------------------------------------------------------
    // Desktop (Chrome) — Engineer (standard employee)
    // -------------------------------------------------------------------------
    {
      name: "chromium-engineer",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/engineer.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.(test|spec)\.(ts|js)/,
      grep: /@engineer|@all-roles/,
    },

    // -------------------------------------------------------------------------
    // Desktop (Chrome) — Lead
    // -------------------------------------------------------------------------
    {
      name: "chromium-lead",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/lead.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.(test|spec)\.(ts|js)/,
      grep: /@lead|@all-roles/,
    },

    // -------------------------------------------------------------------------
    // Unauthenticated tests (login page, register, redirects)
    // -------------------------------------------------------------------------
    {
      name: "chromium-unauthenticated",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.(test|spec)\.(ts|js)/,
      grep: /@unauthenticated/,
    },

    // -------------------------------------------------------------------------
    // Main test suite — runs as super-admin by default for broad coverage
    // -------------------------------------------------------------------------
    {
      name: "chromium-main",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/super-admin.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.(test|spec)\.(ts|js)/,
      grep: /@main|@routes|@crud|@api|@forms|@workflow/,
    },

    // -------------------------------------------------------------------------
    // Tablet responsive tests
    // -------------------------------------------------------------------------
    {
      name: "tablet",
      use: {
        // Use Chromium with tablet-sized viewport (matches iPad Pro 11 dimensions)
        // Avoid WebKit which requires additional system dependencies
        browserName: "chromium",
        viewport: { width: 1024, height: 1366 },
        storageState: "tests/e2e/.auth/super-admin.json",
      },
      dependencies: ["setup"],
      testMatch: /.*responsive.*\.(test|spec)\.(ts|js)/,
    },

    // -------------------------------------------------------------------------
    // Mobile responsive tests
    // -------------------------------------------------------------------------
    {
      name: "mobile",
      use: {
        // Use Chromium with mobile-sized viewport (matches iPhone 15 dimensions)
        // Avoid WebKit which requires additional system dependencies
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        storageState: "tests/e2e/.auth/super-admin.json",
      },
      dependencies: ["setup"],
      testMatch: /.*responsive.*\.(test|spec)\.(ts|js)/,
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
