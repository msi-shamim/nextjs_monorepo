import type { ProjectConfig } from '../../project-config.js';

export interface StorageStrategy {
  packageJson(config: ProjectConfig): string;
  index(config: ProjectConfig): string;
  client(config: ProjectConfig): string;
  uploadService(config: ProjectConfig): string;
  downloadService(config: ProjectConfig): string;
  /** Extra API routes (e.g., UploadThing file router) — returns path→content map */
  apiRoutes(config: ProjectConfig): Record<string, string>;
}
