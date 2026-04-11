/**
 * BackendFactory — Creates the appropriate BackendStrategy based on config.
 */

import type { Backend } from '../../project-config.js';
import type { BackendStrategy } from './backend-strategy.js';
import { NestjsTemplateStrategy } from './nestjs-templates.js';
import { ExpressTemplateStrategy } from './express-templates.js';

export function createBackendStrategy(backend: Backend): BackendStrategy {
  switch (backend) {
    case 'nestjs':
      return new NestjsTemplateStrategy();
    case 'express':
      return new ExpressTemplateStrategy();
  }
}
