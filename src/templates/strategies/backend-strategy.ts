/**
 * BackendStrategy — Abstract interface for backend-specific templates.
 * Implementations: NestJS, Express.
 */

import type { ProjectConfig } from '../../project-config.js';

export interface BackendStrategy {
  /** apps/api/package.json */
  packageJson(config: ProjectConfig): string;

  /** apps/api/tsconfig.json */
  tsConfig(config: ProjectConfig): string;

  /** apps/api/src/main.ts — server entry point */
  mainEntry(config: ProjectConfig): string;

  /** apps/api/src/app.module.ts (NestJS) or apps/api/src/app.ts (Express) */
  appSetup(config: ProjectConfig): string;

  /** apps/api/src/app.controller.ts or apps/api/src/routes/health.ts */
  appController(config: ProjectConfig): string;

  /** apps/api/src/app.service.ts or apps/api/src/services/app.service.ts */
  appService(config: ProjectConfig): string;

  /** apps/api/src/common/filters/http-exception.filter.ts */
  exceptionFilter(config: ProjectConfig): string;

  /** apps/api/src/common/interceptors/logging.interceptor.ts */
  loggingInterceptor(config: ProjectConfig): string;

  /** apps/api/src/common/guards/auth.guard.ts */
  authGuard(config: ProjectConfig): string;

  /** apps/api/src/common/pipes/validation.pipe.ts */
  validationPipe(config: ProjectConfig): string;
}
