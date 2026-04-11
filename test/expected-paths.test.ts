import { describe, it, expect } from 'vitest';
import { ProjectConfig } from '../src/project-config.js';
import { getExpectedDirectories, getExpectedFiles } from '../src/expected-paths.js';

describe('getExpectedDirectories', () => {
  it('includes core directories for all configs', () => {
    const config = new ProjectConfig({ name: 'test' });
    const dirs = getExpectedDirectories(config);

    expect(dirs).toContain('apps/web/app');
    expect(dirs).toContain('apps/api/src');
    expect(dirs).toContain('packages/ui/src/components');
    expect(dirs).toContain('packages/lib/src/types');
    expect(dirs).toContain('packages/config/eslint');
  });

  it('includes tailwind dir for tailwind styling', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'tailwind' });
    expect(getExpectedDirectories(config)).toContain('packages/config/tailwind');
  });

  it('excludes tailwind dir for css-modules', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'css-modules' });
    expect(getExpectedDirectories(config)).not.toContain('packages/config/tailwind');
  });

  it('includes NestJS-specific dirs for nestjs backend', () => {
    const config = new ProjectConfig({ name: 'test', backend: 'nestjs' });
    const dirs = getExpectedDirectories(config);
    expect(dirs).toContain('apps/api/src/common/filters');
    expect(dirs).toContain('apps/api/src/common/guards');
    expect(dirs).not.toContain('apps/api/src/routes');
  });

  it('includes Express-specific dirs for express backend', () => {
    const config = new ProjectConfig({ name: 'test', backend: 'express' });
    const dirs = getExpectedDirectories(config);
    expect(dirs).toContain('apps/api/src/routes');
    expect(dirs).toContain('apps/api/src/services');
  });

  it('includes database dirs for prisma', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'prisma' });
    const dirs = getExpectedDirectories(config);
    expect(dirs).toContain('packages/database/prisma');
    expect(dirs).not.toContain('packages/database/src/schema');
  });

  it('includes database dirs for drizzle', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'drizzle' });
    const dirs = getExpectedDirectories(config);
    expect(dirs).toContain('packages/database/src/schema');
    expect(dirs).not.toContain('packages/database/prisma');
  });

  it('excludes database dirs for no ORM', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'none' });
    const dirs = getExpectedDirectories(config);
    expect(dirs).not.toContain('packages/database/src');
  });

  it('includes auth dirs for next-auth', () => {
    const config = new ProjectConfig({ name: 'test', auth: 'next-auth' });
    expect(getExpectedDirectories(config)).toContain('apps/web/app/api/auth/[...nextauth]');
  });

  it('includes auth dirs for custom auth', () => {
    const config = new ProjectConfig({ name: 'test', auth: 'custom' });
    expect(getExpectedDirectories(config)).toContain('apps/web/app/api/auth/login');
  });

  it('includes store dir for zustand', () => {
    const config = new ProjectConfig({ name: 'test', state: 'zustand' });
    expect(getExpectedDirectories(config)).toContain('apps/web/lib/store');
  });

  it('includes query dir for tanstack-query', () => {
    const config = new ProjectConfig({ name: 'test', state: 'tanstack-query' });
    expect(getExpectedDirectories(config)).toContain('apps/web/lib/query');
  });

  it('excludes state dir for none', () => {
    const config = new ProjectConfig({ name: 'test', state: 'none' });
    const dirs = getExpectedDirectories(config);
    expect(dirs).not.toContain('apps/web/lib/store');
    expect(dirs).not.toContain('apps/web/lib/query');
  });
});

describe('getExpectedFiles', () => {
  it('includes root files for all configs', () => {
    const config = new ProjectConfig({ name: 'test' });
    const files = getExpectedFiles(config);

    expect(files).toContain('package.json');
    expect(files).toContain('turbo.json');
    expect(files).toContain('README.md');
    expect(files).toContain('LICENSE');
    expect(files).toContain('.gitignore');
    expect(files).toContain('.env.example');
    expect(files).toContain('.prettierrc');
  });

  it('includes pnpm-workspace.yaml for pnpm', () => {
    const config = new ProjectConfig({ name: 'test', packageManager: 'pnpm' });
    expect(getExpectedFiles(config)).toContain('pnpm-workspace.yaml');
  });

  it('excludes pnpm-workspace.yaml for npm', () => {
    const config = new ProjectConfig({ name: 'test', packageManager: 'npm' });
    expect(getExpectedFiles(config)).not.toContain('pnpm-workspace.yaml');
  });

  it('includes lib package files', () => {
    const config = new ProjectConfig({ name: 'test' });
    const files = getExpectedFiles(config);
    expect(files).toContain('packages/lib/src/index.ts');
    expect(files).toContain('packages/lib/src/types/index.ts');
    expect(files).toContain('packages/lib/src/validators/index.ts');
  });

  it('includes UI component files', () => {
    const config = new ProjectConfig({ name: 'test' });
    const files = getExpectedFiles(config);
    expect(files).toContain('packages/ui/src/components/button.tsx');
    expect(files).toContain('packages/ui/src/hooks/use-debounce.ts');
  });

  it('includes CSS module files for css-modules styling', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'css-modules' });
    const files = getExpectedFiles(config);
    expect(files).toContain('packages/ui/src/components/button.module.css');
    expect(files).toContain('packages/ui/src/components/card.module.css');
  });

  it('excludes CSS module files for tailwind', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'tailwind' });
    expect(getExpectedFiles(config)).not.toContain('packages/ui/src/components/button.module.css');
  });

  it('includes Next.js app files', () => {
    const config = new ProjectConfig({ name: 'test' });
    const files = getExpectedFiles(config);
    expect(files).toContain('apps/web/app/layout.tsx');
    expect(files).toContain('apps/web/app/page.tsx');
    expect(files).toContain('apps/web/app/error.tsx');
    expect(files).toContain('apps/web/next.config.ts');
  });

  it('includes postcss config for tailwind', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'tailwind' });
    expect(getExpectedFiles(config)).toContain('apps/web/postcss.config.mjs');
  });

  it('includes NestJS-specific API files', () => {
    const config = new ProjectConfig({ name: 'test', backend: 'nestjs' });
    const files = getExpectedFiles(config);
    expect(files).toContain('apps/api/src/app.module.ts');
    expect(files).toContain('apps/api/src/app.controller.ts');
    expect(files).toContain('apps/api/src/common/filters/http-exception.filter.ts');
  });

  it('includes Express-specific API files', () => {
    const config = new ProjectConfig({ name: 'test', backend: 'express' });
    const files = getExpectedFiles(config);
    expect(files).toContain('apps/api/src/app.ts');
    expect(files).toContain('apps/api/src/routes/health.ts');
    expect(files).toContain('apps/api/src/common/filters/error-handler.ts');
  });

  it('includes Prisma files for prisma ORM', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'prisma' });
    const files = getExpectedFiles(config);
    expect(files).toContain('packages/database/prisma/schema.prisma');
    expect(files).toContain('packages/database/src/client.ts');
    expect(files).toContain('packages/database/src/seed.ts');
  });

  it('includes Drizzle files for drizzle ORM', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'drizzle' });
    const files = getExpectedFiles(config);
    expect(files).toContain('packages/database/src/schema/index.ts');
    expect(files).not.toContain('packages/database/prisma/schema.prisma');
  });

  it('includes zustand store files', () => {
    const config = new ProjectConfig({ name: 'test', state: 'zustand' });
    const files = getExpectedFiles(config);
    expect(files).toContain('apps/web/lib/store/index.ts');
    expect(files).toContain('apps/web/lib/store/theme-store.ts');
  });

  it('includes redux store files', () => {
    const config = new ProjectConfig({ name: 'test', state: 'redux' });
    const files = getExpectedFiles(config);
    expect(files).toContain('apps/web/lib/store/store.ts');
    expect(files).toContain('apps/web/lib/store/theme-slice.ts');
    expect(files).toContain('apps/web/lib/store/provider.tsx');
  });

  it('includes next-auth files', () => {
    const config = new ProjectConfig({ name: 'test', auth: 'next-auth' });
    const files = getExpectedFiles(config);
    expect(files).toContain('apps/web/lib/auth.ts');
    expect(files).toContain('apps/web/middleware.ts');
    expect(files).toContain('apps/web/app/api/auth/[...nextauth]/route.ts');
  });

  it('includes docker-compose for postgres', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'prisma', db: 'postgres' });
    expect(getExpectedFiles(config)).toContain('docker-compose.yml');
  });

  it('excludes docker-compose for sqlite', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'prisma', db: 'sqlite' });
    expect(getExpectedFiles(config)).not.toContain('docker-compose.yml');
  });

  it('always includes AI skills files', () => {
    const config = new ProjectConfig({ name: 'test' });
    const files = getExpectedFiles(config);
    expect(files).toContain('.claude/settings.json');
    expect(files).toContain('.claude/skills/component-design/SKILL.md');
    expect(files).toContain('.claude/skills/page-design/SKILL.md');
    expect(files).toContain('.claude/skills/api-feature/SKILL.md');
    expect(files).toContain('.claude/skills/monorepo-doctor/SKILL.md');
  });

  it('includes GitHub files when githubFiles is true', () => {
    const config = new ProjectConfig({ name: 'test', githubFiles: true });
    const files = getExpectedFiles(config);
    expect(files).toContain('CODE_OF_CONDUCT.md');
    expect(files).toContain('.github/FUNDING.yml');
    expect(files).toContain('.github/ISSUE_TEMPLATE/bug_report.md');
    expect(files).toContain('.github/ISSUE_TEMPLATE/feature_request.md');
    expect(files).toContain('.github/pull_request_template.md');
    expect(files).toContain('.github/workflows/ci.yml');
  });

  it('excludes GitHub files when githubFiles is false', () => {
    const config = new ProjectConfig({ name: 'test', githubFiles: false });
    const files = getExpectedFiles(config);
    expect(files).not.toContain('CODE_OF_CONDUCT.md');
    expect(files).not.toContain('.github/workflows/ci.yml');
  });

  it('always includes skills directories', () => {
    const config = new ProjectConfig({ name: 'test' });
    const dirs = getExpectedDirectories(config);
    expect(dirs).toContain('.claude/skills/component-design');
    expect(dirs).toContain('.claude/skills/page-design');
    expect(dirs).toContain('.claude/skills/api-feature');
    expect(dirs).toContain('.claude/skills/monorepo-doctor');
  });

  it('includes GitHub directories when githubFiles is true', () => {
    const config = new ProjectConfig({ name: 'test', githubFiles: true });
    const dirs = getExpectedDirectories(config);
    expect(dirs).toContain('.github/ISSUE_TEMPLATE');
    expect(dirs).toContain('.github/workflows');
  });

  it('excludes GitHub directories when githubFiles is false', () => {
    const config = new ProjectConfig({ name: 'test', githubFiles: false });
    const dirs = getExpectedDirectories(config);
    expect(dirs).not.toContain('.github/ISSUE_TEMPLATE');
    expect(dirs).not.toContain('.github/workflows');
  });

  it('returns 70+ files for a full config with github', () => {
    const config = new ProjectConfig({
      name: 'test',
      backend: 'nestjs',
      styling: 'tailwind',
      orm: 'prisma',
      auth: 'next-auth',
      state: 'zustand',
      githubFiles: true,
    });
    expect(getExpectedFiles(config).length).toBeGreaterThanOrEqual(70);
  });
});
