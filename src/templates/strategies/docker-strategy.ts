import type { ProjectConfig } from '../../project-config.js';

export interface DockerStrategy {
  webDockerfile(config: ProjectConfig): string;
  apiDockerfile(config: ProjectConfig): string;
  dockerComposeProd(config: ProjectConfig): string;
  dockerignore(config: ProjectConfig): string;
  /** Extra files like nginx config (path → content map) */
  extraFiles(config: ProjectConfig): Record<string, string>;
}
