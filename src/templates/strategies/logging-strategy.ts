/**
 * LoggingStrategy — Abstract interface for logging templates.
 * Implementations: Pino, Winston.
 */

import type { ProjectConfig } from '../../project-config.js';

export interface LoggingStrategy {
  /** Logger setup and factory (packages/lib/src/logger/logger.ts) */
  loggerSetup(config: ProjectConfig): string;

  /** Barrel export (packages/lib/src/logger/index.ts) */
  index(config: ProjectConfig): string;
}
