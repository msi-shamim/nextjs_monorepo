/**
 * ApiStyleStrategy — Abstract interface for API style templates (GraphQL, tRPC).
 * Each implementation generates server-side files and optionally client-side files.
 */

import type { ProjectConfig } from '../../project-config.js';

export interface ApiStyleStrategy {
  /** Server-side setup files (relative path → content) */
  serverFiles(config: ProjectConfig): Record<string, string>;

  /** Client-side files for Next.js (tRPC client hooks, provider — empty for GraphQL) */
  clientFiles(config: ProjectConfig): Record<string, string>;

  /** Setup instructions comment for main.ts / app.ts */
  setupInstructions(config: ProjectConfig): string;
}
