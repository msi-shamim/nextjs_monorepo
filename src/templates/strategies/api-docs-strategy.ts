import type { ProjectConfig } from '../../project-config.js';

export interface ApiDocsStrategy {
  /** OpenAPI/Swagger configuration */
  docsConfig(config: ProjectConfig): string;
  /** Route/middleware setup for serving docs UI */
  docsSetup(config: ProjectConfig): string;
}
