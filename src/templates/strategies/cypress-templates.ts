import type { ProjectConfig } from '../../project-config.js';
import type { E2eStrategy } from './e2e-strategy.js';

export class CypressTemplateStrategy implements E2eStrategy {
  config(_config: ProjectConfig): string {
    return `import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
});
`;
  }

  exampleTest(_config: ProjectConfig): string {
    return `describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the heading', () => {
    cy.get('h1').should('be.visible');
  });

  it('should load without errors', () => {
    cy.request('/').its('status').should('be.lessThan', 400);
  });

  it('should have navigation elements', () => {
    cy.get('button').should('exist');
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

      - name: Build
        run: pnpm build

      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          working-directory: apps/web
          start: pnpm start
          wait-on: 'http://localhost:3000'
`;
  }
}
