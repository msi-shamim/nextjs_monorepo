import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { detectProjectConfig } from '../src/config-detector.js';

/** Create a minimal generated project structure for detection testing */
function createMockProject(
  rootPath: string,
  overrides: {
    apiDeps?: Record<string, string>;
    webDeps?: Record<string, string>;
    webDevDeps?: Record<string, string>;
    dbDeps?: Record<string, string>;
    dbDevDeps?: Record<string, string>;
    packageManager?: string;
    cssModules?: boolean;
    prismaProvider?: string;
    drizzleDialect?: string;
    licenseContent?: string;
    hasGithub?: boolean;
  } = {},
): void {
  // Root package.json
  fs.mkdirSync(rootPath, { recursive: true });
  fs.writeFileSync(
    path.join(rootPath, 'package.json'),
    JSON.stringify({
      name: 'test-project',
      packageManager: overrides.packageManager ?? 'pnpm@10.8.0',
    }),
  );

  // turbo.json (required for detection)
  fs.writeFileSync(path.join(rootPath, 'turbo.json'), '{}');

  // apps/api/package.json
  const apiDir = path.join(rootPath, 'apps/api');
  fs.mkdirSync(apiDir, { recursive: true });
  fs.writeFileSync(
    path.join(apiDir, 'package.json'),
    JSON.stringify({ dependencies: overrides.apiDeps ?? { '@nestjs/core': '^11.0.0' } }),
  );

  // apps/web/package.json
  const webDir = path.join(rootPath, 'apps/web');
  fs.mkdirSync(webDir, { recursive: true });
  fs.writeFileSync(
    path.join(webDir, 'package.json'),
    JSON.stringify({
      dependencies: overrides.webDeps ?? {},
      devDependencies: overrides.webDevDeps ?? {},
    }),
  );

  // packages/database (optional)
  if (overrides.dbDeps || overrides.dbDevDeps) {
    const dbDir = path.join(rootPath, 'packages/database');
    fs.mkdirSync(dbDir, { recursive: true });
    fs.writeFileSync(
      path.join(dbDir, 'package.json'),
      JSON.stringify({
        dependencies: overrides.dbDeps ?? {},
        devDependencies: overrides.dbDevDeps ?? {},
      }),
    );
  }

  // Prisma schema (optional)
  if (overrides.prismaProvider) {
    const prismaDir = path.join(rootPath, 'packages/database/prisma');
    fs.mkdirSync(prismaDir, { recursive: true });
    fs.writeFileSync(
      path.join(prismaDir, 'schema.prisma'),
      `datasource db {\n  provider = "${overrides.prismaProvider}"\n}`,
    );
  }

  // CSS module files (optional)
  if (overrides.cssModules) {
    const compDir = path.join(rootPath, 'packages/ui/src/components');
    fs.mkdirSync(compDir, { recursive: true });
    fs.writeFileSync(path.join(compDir, 'button.module.css'), '.button {}');
  }

  // LICENSE (optional)
  if (overrides.licenseContent) {
    fs.writeFileSync(path.join(rootPath, 'LICENSE'), overrides.licenseContent);
  }

  // .github (optional)
  if (overrides.hasGithub) {
    fs.mkdirSync(path.join(rootPath, '.github'), { recursive: true });
  }
}

describe('detectProjectConfig', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cnm-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null for empty directory', () => {
    expect(detectProjectConfig(tmpDir)).toBeNull();
  });

  it('returns null for directory without turbo.json', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{"name":"test"}');
    expect(detectProjectConfig(tmpDir)).toBeNull();
  });

  it('detects project name from root package.json', () => {
    createMockProject(tmpDir);
    const config = detectProjectConfig(tmpDir);
    expect(config).not.toBeNull();
    expect(config!.name).toBe('test-project');
  });

  it('detects NestJS backend', () => {
    createMockProject(tmpDir, { apiDeps: { '@nestjs/core': '^11.0.0', '@nestjs/common': '^11.0.0' } });
    expect(detectProjectConfig(tmpDir)!.backend).toBe('nestjs');
  });

  it('detects Express backend', () => {
    createMockProject(tmpDir, { apiDeps: { express: '^5.0.0' } });
    expect(detectProjectConfig(tmpDir)!.backend).toBe('express');
  });

  it('detects Tailwind styling', () => {
    createMockProject(tmpDir, { webDevDeps: { tailwindcss: '^4.0.0' } });
    expect(detectProjectConfig(tmpDir)!.styling).toBe('tailwind');
  });

  it('detects Styled Components styling', () => {
    createMockProject(tmpDir, { webDeps: { 'styled-components': '^6.0.0' } });
    expect(detectProjectConfig(tmpDir)!.styling).toBe('styled-components');
  });

  it('detects CSS Modules styling from .module.css files', () => {
    createMockProject(tmpDir, { cssModules: true });
    expect(detectProjectConfig(tmpDir)!.styling).toBe('css-modules');
  });

  it('detects Prisma ORM', () => {
    createMockProject(tmpDir, { dbDeps: { '@prisma/client': '^6.0.0' } });
    expect(detectProjectConfig(tmpDir)!.orm).toBe('prisma');
  });

  it('detects Drizzle ORM', () => {
    createMockProject(tmpDir, { dbDeps: { 'drizzle-orm': '^0.43.0' } });
    expect(detectProjectConfig(tmpDir)!.orm).toBe('drizzle');
  });

  it('detects no ORM when database package is missing', () => {
    createMockProject(tmpDir);
    expect(detectProjectConfig(tmpDir)!.orm).toBe('none');
  });

  it('detects Postgres from Prisma schema', () => {
    createMockProject(tmpDir, {
      dbDeps: { '@prisma/client': '^6.0.0' },
      prismaProvider: 'postgresql',
    });
    expect(detectProjectConfig(tmpDir)!.db).toBe('postgres');
  });

  it('detects MySQL from Prisma schema', () => {
    createMockProject(tmpDir, {
      dbDeps: { '@prisma/client': '^6.0.0' },
      prismaProvider: 'mysql',
    });
    expect(detectProjectConfig(tmpDir)!.db).toBe('mysql');
  });

  it('detects Zustand state management', () => {
    createMockProject(tmpDir, { webDeps: { zustand: '^5.0.0' } });
    expect(detectProjectConfig(tmpDir)!.state).toBe('zustand');
  });

  it('detects Redux state management', () => {
    createMockProject(tmpDir, { webDeps: { '@reduxjs/toolkit': '^2.0.0' } });
    expect(detectProjectConfig(tmpDir)!.state).toBe('redux');
  });

  it('detects TanStack Query state management', () => {
    createMockProject(tmpDir, { webDeps: { '@tanstack/react-query': '^5.0.0' } });
    expect(detectProjectConfig(tmpDir)!.state).toBe('tanstack-query');
  });

  it('detects NextAuth', () => {
    createMockProject(tmpDir, { webDeps: { 'next-auth': '^5.0.0' } });
    expect(detectProjectConfig(tmpDir)!.auth).toBe('next-auth');
  });

  it('detects custom auth from lib/auth.ts', () => {
    createMockProject(tmpDir);
    const authDir = path.join(tmpDir, 'apps/web/lib');
    fs.mkdirSync(authDir, { recursive: true });
    fs.writeFileSync(path.join(authDir, 'auth.ts'), 'export const authConfig = {};');
    expect(detectProjectConfig(tmpDir)!.auth).toBe('custom');
  });

  it('detects pnpm package manager', () => {
    createMockProject(tmpDir, { packageManager: 'pnpm@10.8.0' });
    expect(detectProjectConfig(tmpDir)!.packageManager).toBe('pnpm');
  });

  it('detects npm package manager', () => {
    createMockProject(tmpDir, { packageManager: 'npm@10.9.2' });
    expect(detectProjectConfig(tmpDir)!.packageManager).toBe('npm');
  });

  it('detects GitHub files', () => {
    createMockProject(tmpDir, { hasGithub: true });
    expect(detectProjectConfig(tmpDir)!.githubFiles).toBe(true);
  });

  it('detects MIT license', () => {
    createMockProject(tmpDir, { licenseContent: 'MIT License\n\nCopyright (c) 2026' });
    expect(detectProjectConfig(tmpDir)!.license).toBe('MIT');
  });

  it('detects Apache license', () => {
    createMockProject(tmpDir, { licenseContent: 'Apache License\nVersion 2.0' });
    expect(detectProjectConfig(tmpDir)!.license).toBe('Apache-2.0');
  });

  it('detects ISC license', () => {
    createMockProject(tmpDir, { licenseContent: 'ISC License\n\nCopyright' });
    expect(detectProjectConfig(tmpDir)!.license).toBe('ISC');
  });
});
