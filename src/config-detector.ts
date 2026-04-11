/**
 * ConfigDetector — Reverse-engineers a ProjectConfig from an existing
 * generated monorepo by reading files on disk.
 * Mirrors flutter_monorepo's config_detector.dart.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { ProjectConfig } from './project-config.js';
import type { Backend, Styling, ORM, Database, Auth, StateManagement, PackageManager, LicenseType, Docker, I18n, Payments, Email, ApiDocs, Storage, E2e, Cache, Logging } from './project-config.js';

/** Attempt to detect project configuration from existing files */
export function detectProjectConfig(rootPath: string): ProjectConfig | null {
  const rootPkgPath = path.join(rootPath, 'package.json');
  if (!fs.existsSync(rootPkgPath)) return null;

  const rootPkg = readJson(rootPkgPath);
  if (!rootPkg?.name) return null;

  // Verify this is a monorepo (has turbo.json or apps/ dir)
  if (!fs.existsSync(path.join(rootPath, 'turbo.json'))) return null;

  const name = rootPkg.name as string;
  const backend = detectBackend(rootPath, name);
  const styling = detectStyling(rootPath, name);
  const orm = detectOrm(rootPath, name);
  const db = detectDatabase(rootPath, name, orm);
  const auth = detectAuth(rootPath, name);
  const state = detectState(rootPath, name);
  const packageManager = detectPackageManager(rootPkg);
  const githubFiles = fs.existsSync(path.join(rootPath, '.github'));
  const license = detectLicense(rootPath);

  return new ProjectConfig({
    name,
    backend,
    styling,
    orm,
    db,
    auth,
    state,
    packageManager,
    gitInit: false,
    githubFiles,
    license,
    docker: detectDocker(rootPath),
    i18n: detectI18n(rootPath),
    payments: detectPayments(rootPath),
    email: detectEmail(rootPath),
    apiDocs: detectApiDocsOption(rootPath),
    storage: detectStorage(rootPath),
    e2e: detectE2e(rootPath),
    storybook: fs.existsSync(path.join(rootPath, 'packages/ui/.storybook')),
    cache: detectCache(rootPath),
    logging: detectLogging(rootPath),
  });
}

/** Detect backend framework from apps/api/package.json dependencies */
function detectBackend(rootPath: string, _name: string): Backend {
  const apiPkg = readJson(path.join(rootPath, 'apps/api/package.json'));
  if (!apiPkg) return 'nestjs';

  const deps = {
    ...(apiPkg.dependencies as Record<string, string> | undefined),
    ...(apiPkg.devDependencies as Record<string, string> | undefined),
  };

  if (deps['@nestjs/core'] || deps['@nestjs/common']) return 'nestjs';
  if (deps['express']) return 'express';

  return 'nestjs';
}

/** Detect styling approach from apps/web/package.json */
function detectStyling(rootPath: string, _name: string): Styling {
  const webPkg = readJson(path.join(rootPath, 'apps/web/package.json'));
  if (!webPkg) return 'tailwind';

  const allDeps = {
    ...(webPkg.dependencies as Record<string, string> | undefined),
    ...(webPkg.devDependencies as Record<string, string> | undefined),
  };

  if (allDeps['tailwindcss']) return 'tailwind';
  if (allDeps['styled-components']) return 'styled-components';

  // Check for CSS module files
  const componentsDir = path.join(rootPath, 'packages/ui/src/components');
  if (fs.existsSync(componentsDir)) {
    try {
      const files = fs.readdirSync(componentsDir);
      if (files.some((f) => f.endsWith('.module.css'))) return 'css-modules';
    } catch {
      // ignore
    }
  }

  return 'tailwind';
}

/** Detect ORM from packages/database/package.json */
function detectOrm(rootPath: string, _name: string): ORM {
  const dbPkg = readJson(path.join(rootPath, 'packages/database/package.json'));
  if (!dbPkg) return 'none';

  const allDeps = {
    ...(dbPkg.dependencies as Record<string, string> | undefined),
    ...(dbPkg.devDependencies as Record<string, string> | undefined),
  };

  if (allDeps['@prisma/client'] || allDeps['prisma']) return 'prisma';
  if (allDeps['drizzle-orm'] || allDeps['drizzle-kit']) return 'drizzle';

  return 'none';
}

/** Detect database type from schema or .env.example */
function detectDatabase(rootPath: string, _name: string, orm: ORM): Database {
  if (orm === 'none') return 'postgres';

  if (orm === 'prisma') {
    const schemaPath = path.join(rootPath, 'packages/database/prisma/schema.prisma');
    const content = readFile(schemaPath);
    if (content) {
      if (content.includes('provider = "postgresql"')) return 'postgres';
      if (content.includes('provider = "mysql"')) return 'mysql';
      if (content.includes('provider = "sqlite"')) return 'sqlite';
      if (content.includes('provider = "mongodb"')) return 'mongodb';
    }
  }

  if (orm === 'drizzle') {
    const schemaPath = path.join(rootPath, 'packages/database/src/schema/index.ts');
    const content = readFile(schemaPath);
    if (content) {
      if (content.includes('drizzle-orm/pg-core')) return 'postgres';
      if (content.includes('drizzle-orm/mysql-core')) return 'mysql';
      if (content.includes('drizzle-orm/sqlite-core')) return 'sqlite';
    }
  }

  // Fall back to .env.example
  const envContent = readFile(path.join(rootPath, '.env.example'));
  if (envContent) {
    if (envContent.includes('postgresql://')) return 'postgres';
    if (envContent.includes('mysql://')) return 'mysql';
    if (envContent.includes('file:./')) return 'sqlite';
    if (envContent.includes('mongodb://')) return 'mongodb';
  }

  return 'postgres';
}

/** Detect auth from apps/web/package.json and file existence */
function detectAuth(rootPath: string, _name: string): Auth {
  const webPkg = readJson(path.join(rootPath, 'apps/web/package.json'));
  if (webPkg) {
    const deps = webPkg.dependencies as Record<string, string> | undefined;
    if (deps?.['next-auth']) return 'next-auth';
  }

  // Check for custom auth files
  if (fs.existsSync(path.join(rootPath, 'apps/web/lib/auth.ts'))) {
    return 'custom';
  }

  return 'none';
}

/** Detect state management from apps/web/package.json */
function detectState(rootPath: string, _name: string): StateManagement {
  const webPkg = readJson(path.join(rootPath, 'apps/web/package.json'));
  if (!webPkg) return 'none';

  const deps = webPkg.dependencies as Record<string, string> | undefined;
  if (!deps) return 'none';

  if (deps['zustand']) return 'zustand';
  if (deps['jotai']) return 'jotai';
  if (deps['@reduxjs/toolkit']) return 'redux';
  if (deps['@tanstack/react-query']) return 'tanstack-query';

  return 'none';
}

/** Detect package manager from root package.json packageManager field */
function detectPackageManager(rootPkg: Record<string, unknown>): PackageManager {
  const pm = rootPkg.packageManager as string | undefined;
  if (!pm) return 'pnpm';

  if (pm.startsWith('pnpm')) return 'pnpm';
  if (pm.startsWith('yarn')) return 'yarn';
  if (pm.startsWith('bun')) return 'bun';
  if (pm.startsWith('npm')) return 'npm';

  return 'pnpm';
}

/** Detect license type from LICENSE file content */
function detectLicense(rootPath: string): LicenseType {
  const content = readFile(path.join(rootPath, 'LICENSE'));
  if (!content) return 'MIT';

  if (content.includes('MIT License')) return 'MIT';
  if (content.includes('Apache License')) return 'Apache-2.0';
  if (content.includes('BSD 2-Clause')) return 'BSD-2-Clause';
  if (content.includes('BSD 3-Clause')) return 'BSD-3-Clause';
  if (content.includes('GNU General Public License') && content.includes('version 3')) return 'GPL-3.0';
  if (content.includes('GNU General Public License') && content.includes('version 2')) return 'GPL-2.0';
  if (content.includes('GNU Lesser General Public')) return 'LGPL-2.1';
  if (content.includes('Mozilla Public License')) return 'MPL-2.0';
  if (content.includes('ISC License')) return 'ISC';
  if (content.includes('public domain') || content.includes('Unlicense')) return 'Unlicense';
  if (content.includes('proprietary') || content.includes('All rights reserved')) return 'proprietary';

  return 'MIT';
}

// ── v2.0 option detectors ────────────────────────────────────────

function detectDocker(rootPath: string): Docker {
  if (fs.existsSync(path.join(rootPath, 'nginx/nginx.conf'))) return 'full';
  if (fs.existsSync(path.join(rootPath, 'apps/web/Dockerfile'))) return 'minimal';
  return 'none';
}

function detectI18n(rootPath: string): I18n {
  const webPkg = readJson(path.join(rootPath, 'apps/web/package.json'));
  const deps = { ...(webPkg?.dependencies as Record<string, string> | undefined), ...(webPkg?.devDependencies as Record<string, string> | undefined) };
  if (deps['next-intl']) return 'next-intl';
  return 'none';
}

function detectPayments(rootPath: string): Payments {
  const pkg = readJson(path.join(rootPath, 'packages/payments/package.json'));
  if (!pkg) return 'none';
  const deps = pkg.dependencies as Record<string, string> | undefined;
  if (deps?.['stripe']) return 'stripe';
  if (deps?.['@lemonsqueezy/lemonsqueezy.js']) return 'lemonsqueezy';
  if (deps?.['@paddle/paddle-node-sdk']) return 'paddle';
  return 'none';
}

function detectEmail(rootPath: string): Email {
  const pkg = readJson(path.join(rootPath, 'packages/email/package.json'));
  if (!pkg) return 'none';
  const deps = pkg.dependencies as Record<string, string> | undefined;
  if (deps?.['resend']) return 'resend';
  if (deps?.['nodemailer']) return 'nodemailer';
  if (deps?.['@sendgrid/mail']) return 'sendgrid';
  return 'none';
}

function detectApiDocsOption(rootPath: string): ApiDocs {
  if (fs.existsSync(path.join(rootPath, 'apps/api/src/docs/setup.ts'))) {
    const content = readFile(path.join(rootPath, 'apps/api/src/docs/setup.ts'));
    if (content?.includes('redoc')) return 'redoc';
    return 'swagger';
  }
  return 'none';
}

function detectStorage(rootPath: string): Storage {
  const pkg = readJson(path.join(rootPath, 'packages/storage/package.json'));
  if (!pkg) return 'none';
  const deps = pkg.dependencies as Record<string, string> | undefined;
  if (deps?.['@aws-sdk/client-s3']) return 's3';
  if (deps?.['uploadthing']) return 'uploadthing';
  if (deps?.['cloudinary']) return 'cloudinary';
  return 'none';
}

function detectE2e(rootPath: string): E2e {
  if (fs.existsSync(path.join(rootPath, 'apps/web/playwright.config.ts'))) return 'playwright';
  if (fs.existsSync(path.join(rootPath, 'apps/web/cypress.config.ts'))) return 'cypress';
  return 'none';
}

function detectCache(rootPath: string): Cache {
  const pkg = readJson(path.join(rootPath, 'packages/cache/package.json'));
  if (!pkg) return 'none';
  const deps = pkg.dependencies as Record<string, string> | undefined;
  if (deps?.['ioredis']) return 'redis';
  return 'none';
}

function detectLogging(rootPath: string): Logging {
  if (fs.existsSync(path.join(rootPath, 'packages/lib/src/logger/logger.ts'))) {
    const content = readFile(path.join(rootPath, 'packages/lib/src/logger/logger.ts'));
    if (content?.includes('pino')) return 'pino';
    if (content?.includes('winston')) return 'winston';
  }
  return 'default';
}

// ── Helpers ───────────────────────────────────────────────────────

function readJson(filePath: string): Record<string, unknown> | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}
