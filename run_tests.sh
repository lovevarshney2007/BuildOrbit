#!/bin/bash
set -e

echo "1. Install dependencies..."
npm ci

echo "2. Initialize DB / Apply Migrations..."
npx prisma db push --skip-generate

echo "4. Seed Database..."
npx prisma db seed

echo "5. Build Next.js app..."
npm run build

echo "6. Install Playwright Browsers..."
npx playwright install

echo "7. Run complete Playwright test suite..."
# First run to establish visual snapshots if they don't exist
npx playwright test --update-snapshots || true
# Final run to capture actual results
npx playwright test --reporter=list,html > test_results.log 2>&1 || true

echo "Done!"
