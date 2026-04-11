/**
 * ORMStrategy — Abstract interface for ORM-specific templates.
 * Implementations: Prisma, Drizzle.
 */

import type { ProjectConfig } from '../../project-config.js';

export interface ORMStrategy {
  /** packages/database/package.json */
  packageJson(config: ProjectConfig): string;

  /** packages/database/tsconfig.json */
  tsConfig(config: ProjectConfig): string;

  /** packages/database/src/index.ts — barrel export */
  index(config: ProjectConfig): string;

  /** Schema file (prisma/schema.prisma or src/schema/*.ts) */
  schemaFile(config: ProjectConfig): string;

  /** Database client singleton */
  clientFile(config: ProjectConfig): string;

  /** Database seed script */
  seedFile(config: ProjectConfig): string;

  /** .env additions for database connection */
  envVars(config: ProjectConfig): string;
}
