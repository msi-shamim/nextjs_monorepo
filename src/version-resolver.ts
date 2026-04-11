/**
 * VersionResolver — Fetches latest compatible versions from npm registry.
 * Falls back to hardcoded tested versions when offline.
 */

/** Hardcoded fallback versions (tested and known to work together) */
const FALLBACK_VERSIONS: Record<string, string> = {
  // Core
  next: '^15.3.1',
  react: '^19.1.0',
  'react-dom': '^19.1.0',
  typescript: '^5.8.3',
  turbo: '^2.5.0',
  '@types/react': '^19.1.2',
  '@types/react-dom': '^19.1.2',
  '@types/node': '^22.15.3',
  eslint: '^9.25.1',
  prettier: '^3.5.3',

  // NestJS
  '@nestjs/core': '^11.0.20',
  '@nestjs/common': '^11.0.20',
  '@nestjs/platform-express': '^11.0.20',
  'reflect-metadata': '^0.2.2',
  rxjs: '^7.8.2',
  '@nestjs/testing': '^11.0.20',
  '@nestjs/cli': '^11.0.5',

  // Express
  express: '^5.1.0',
  '@types/express': '^5.0.2',
  cors: '^2.8.5',
  '@types/cors': '^2.8.17',

  // Tailwind
  tailwindcss: '^4.1.4',
  postcss: '^8.5.3',
  autoprefixer: '^10.4.21',
  '@tailwindcss/postcss': '^4.1.4',

  // Styled Components
  'styled-components': '^6.1.18',

  // Prisma
  prisma: '^6.6.0',
  '@prisma/client': '^6.6.0',

  // Drizzle
  'drizzle-orm': '^0.43.1',
  'drizzle-kit': '^0.31.1',
  pg: '^8.14.1',
  '@types/pg': '^8.11.13',
  mysql2: '^3.14.0',
  'better-sqlite3': '^11.9.1',

  // Auth
  'next-auth': '^5.0.0-beta.25',
  '@auth/core': '^0.37.4',
  '@auth/prisma-adapter': '^2.7.4',
  '@auth/drizzle-adapter': '^1.7.4',
  jsonwebtoken: '^9.0.2',
  '@types/jsonwebtoken': '^9.0.9',
  bcryptjs: '^3.0.2',
  '@types/bcryptjs': '^2.4.6',

  // State management
  zustand: '^5.0.3',
  jotai: '^2.12.3',
  '@reduxjs/toolkit': '^2.7.0',
  'react-redux': '^9.2.0',
  '@tanstack/react-query': '^5.74.4',

  // Testing
  vitest: '^3.1.2',
  '@vitejs/plugin-react': '^4.4.1',
  jest: '^29.7.0',
  '@types/jest': '^29.5.14',
  'ts-jest': '^29.3.2',

  // Validation
  zod: '^3.24.3',

  // ── v2.0 options ──

  // i18n
  'next-intl': '^4.1.0',

  // Payments
  stripe: '^17.7.0',
  '@lemonsqueezy/lemonsqueezy.js': '^4.0.0',
  '@paddle/paddle-node-sdk': '^1.7.0',

  // Email
  resend: '^4.1.0',
  '@react-email/components': '^0.0.36',
  nodemailer: '^6.10.0',
  '@types/nodemailer': '^6.4.17',
  '@sendgrid/mail': '^8.1.0',

  // API Docs
  '@nestjs/swagger': '^8.1.0',
  'swagger-jsdoc': '^6.2.8',
  'swagger-ui-express': '^5.0.1',
  '@types/swagger-jsdoc': '^6.0.4',
  '@types/swagger-ui-express': '^4.1.8',
  'redoc-express': '^2.1.0',

  // Storage
  '@aws-sdk/client-s3': '^3.750.0',
  '@aws-sdk/s3-request-presigner': '^3.750.0',
  uploadthing: '^7.6.0',
  '@uploadthing/react': '^7.3.0',
  cloudinary: '^2.6.0',

  // E2E
  '@playwright/test': '^1.50.0',
  cypress: '^14.0.0',

  // Storybook
  storybook: '^8.5.0',
  '@storybook/react': '^8.5.0',
  '@storybook/react-vite': '^8.5.0',
  '@storybook/addon-essentials': '^8.5.0',

  // Cache
  ioredis: '^5.6.0',

  // Logging
  pino: '^9.6.0',
  'pino-pretty': '^13.0.0',
  winston: '^3.17.0',
};

export class VersionResolver {
  private resolved: Record<string, string> = {};

  /**
   * Resolve versions for the given package names.
   * Attempts to fetch latest from npm registry; falls back to hardcoded versions.
   */
  async resolve(packageNames: string[]): Promise<Record<string, string>> {
    const results = await Promise.allSettled(
      packageNames.map((name) => this.fetchLatestVersion(name)),
    );

    for (let i = 0; i < packageNames.length; i++) {
      const packageName = packageNames[i];
      const result = results[i];

      if (result.status === 'fulfilled' && result.value) {
        this.resolved[packageName] = `^${result.value}`;
      } else {
        this.resolved[packageName] = this.getFallback(packageName);
      }
    }

    return this.resolved;
  }

  /** Get the fallback version for a package */
  getFallback(packageName: string): string {
    return FALLBACK_VERSIONS[packageName] ?? 'latest';
  }

  /** Fetch the latest version of a package from the npm registry */
  private async fetchLatestVersion(packageName: string): Promise<string | null> {
    try {
      const encodedName = packageName.startsWith('@')
        ? `@${encodeURIComponent(packageName.slice(1))}`
        : encodeURIComponent(packageName);

      const response = await fetch(
        `https://registry.npmjs.org/${encodedName}/latest`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) return null;

      const data = (await response.json()) as { version?: string };
      return data.version ?? null;
    } catch {
      return null;
    }
  }

  /** Get all resolved versions */
  getVersions(): Record<string, string> {
    return { ...this.resolved };
  }

  /** Get all fallback versions (for testing/reference) */
  static getFallbacks(): Record<string, string> {
    return { ...FALLBACK_VERSIONS };
  }
}
