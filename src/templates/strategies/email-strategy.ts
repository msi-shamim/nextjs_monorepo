import type { ProjectConfig } from '../../project-config.js';

export interface EmailStrategy {
  packageJson(config: ProjectConfig): string;
  index(config: ProjectConfig): string;
  client(config: ProjectConfig): string;
  sendFunction(config: ProjectConfig): string;
  welcomeTemplate(config: ProjectConfig): string;
  resetPasswordTemplate(config: ProjectConfig): string;
}
