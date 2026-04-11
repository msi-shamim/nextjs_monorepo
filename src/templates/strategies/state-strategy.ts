/**
 * StateStrategy — Abstract interface for state management templates.
 * Implementations: Zustand, Jotai, Redux Toolkit, TanStack Query.
 */

import type { ProjectConfig } from '../../project-config.js';

export interface StateStrategy {
  /** Store/atom/slice setup file */
  storeSetup(config: ProjectConfig): string;

  /** Example store (counter/theme) */
  exampleStore(config: ProjectConfig): string;

  /** Provider wrapper component (for layout.tsx) — empty string if not needed */
  providerWrapper(config: ProjectConfig): string;
}
