/**
 * E2eStrategy — Abstract interface for E2E testing templates.
 * Implementations: Playwright, Cypress.
 */

import type { ProjectConfig } from '../../project-config.js';

export interface E2eStrategy {
  /** E2E config file (playwright.config.ts or cypress.config.ts) */
  config(config: ProjectConfig): string;

  /** Example test file */
  exampleTest(config: ProjectConfig): string;

  /** CI workflow job for E2E (appended to existing CI if --github) */
  ciWorkflow(config: ProjectConfig): string;
}
