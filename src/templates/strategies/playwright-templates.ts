import type { ProjectConfig } from '../../project-config.js';
import type { E2eStrategy } from './e2e-strategy.js';

export class PlaywrightTemplateStrategy implements E2eStrategy {
  config(_config: ProjectConfig): string {
    return `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
`;
  }

  exampleTest(_config: ProjectConfig): string {
    return `import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*$/);
  });

  test('should navigate without errors', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });
});
`;
  }

  ciWorkflow(_config: ProjectConfig): string {
    return `
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: ci
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build
        run: pnpm build

      - name: Run E2E tests
        run: cd apps/web && npx playwright test --project=chromium
`;
  }
}
