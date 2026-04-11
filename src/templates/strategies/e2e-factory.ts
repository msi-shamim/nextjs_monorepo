import type { E2e } from '../../project-config.js';
import type { E2eStrategy } from './e2e-strategy.js';
import { PlaywrightTemplateStrategy } from './playwright-templates.js';
import { CypressTemplateStrategy } from './cypress-templates.js';

export function createE2eStrategy(e2e: E2e): E2eStrategy | null {
  switch (e2e) {
    case 'playwright':
      return new PlaywrightTemplateStrategy();
    case 'cypress':
      return new CypressTemplateStrategy();
    case 'none':
      return null;
  }
}
