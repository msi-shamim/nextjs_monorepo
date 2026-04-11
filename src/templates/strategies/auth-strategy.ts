/**
 * AuthStrategy — Abstract interface for authentication-specific templates.
 * Implementations: NextAuth.js, Custom JWT.
 */

import type { ProjectConfig } from '../../project-config.js';

export interface AuthStrategy {
  /** Auth API route (e.g., app/api/auth/[...nextauth]/route.ts) */
  apiRoute(config: ProjectConfig): string;

  /** Auth configuration file */
  authConfig(config: ProjectConfig): string;

  /** Next.js middleware for auth protection */
  middleware(config: ProjectConfig): string;

  /** Auth-related TypeScript type definitions */
  types(config: ProjectConfig): string;
}
