/**
 * Public API exports for programmatic usage.
 */

export { ProjectConfig } from './project-config.js';
export type { ProjectConfigOptions } from './project-config.js';
export {
  Backend,
  Styling,
  ORM,
  Database,
  Auth,
  StateManagement,
  TestFramework,
  PackageManager,
  LicenseType,
  ApiStyle,
  Docker,
  I18n,
  Payments,
  Email,
  ApiDocs,
  Storage,
  E2e,
  Cache,
  Logging,
} from './project-config.js';
export { Generator } from './generator.js';
export { VersionResolver } from './version-resolver.js';
export { Doctor } from './doctor.js';
export { Workflow } from './workflow.js';
export { detectProjectConfig } from './config-detector.js';
export { getExpectedDirectories, getExpectedFiles } from './expected-paths.js';
