import type { ProjectConfig } from '../../project-config.js';

export interface PaymentStrategy {
  packageJson(config: ProjectConfig): string;
  index(config: ProjectConfig): string;
  client(config: ProjectConfig): string;
  webhookHandler(config: ProjectConfig): string;
  checkout(config: ProjectConfig): string;
  subscription(config: ProjectConfig): string;
  /** Pricing page component */
  pricingPage(config: ProjectConfig): string;
  /** Backend webhook API route */
  apiRoute(config: ProjectConfig): string;
}
