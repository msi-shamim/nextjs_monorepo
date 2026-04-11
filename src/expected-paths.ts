/**
 * Expected directories and files for a generated monorepo.
 * Shared by Generator (creation) and Doctor (validation).
 */

import type { ProjectConfig } from './project-config.js';

/** All directories that should exist in a generated monorepo */
export function getExpectedDirectories(config: ProjectConfig): string[] {
  const dirs = [
    // Apps
    'apps/web/app',
    'apps/web/app/api',
    'apps/web/components',
    'apps/web/hooks',
    'apps/web/lib',
    'apps/web/public',
    'apps/web/types',
    'apps/api/src',
    'apps/api/test',

    // Packages
    'packages/config/eslint',
    'packages/config/typescript',
    'packages/ui/src/components',
    'packages/ui/src/hooks',
    'packages/lib/src/types',
    'packages/lib/src/utils',
    'packages/lib/src/constants',
    'packages/lib/src/validators',

    // AI Skills (always present)
    '.claude/skills/component-design',
    '.claude/skills/page-design',
    '.claude/skills/api-feature',
    '.claude/skills/monorepo-doctor',
  ];

  // Tailwind config dir
  if (config.usesTailwind) {
    dirs.push('packages/config/tailwind');
  }

  // Backend-specific dirs
  if (config.backend === 'nestjs') {
    dirs.push(
      'apps/api/src/common/filters',
      'apps/api/src/common/guards',
      'apps/api/src/common/interceptors',
      'apps/api/src/common/pipes',
    );
  } else {
    dirs.push(
      'apps/api/src/routes',
      'apps/api/src/services',
      'apps/api/src/common/filters',
      'apps/api/src/common/guards',
      'apps/api/src/common/interceptors',
      'apps/api/src/common/pipes',
    );
  }

  // Database dirs
  if (config.hasDatabase) {
    dirs.push('packages/database/src');
    if (config.orm === 'prisma') {
      dirs.push('packages/database/prisma');
    } else {
      dirs.push('packages/database/src/schema');
    }
  }

  // Auth dirs
  if (config.hasAuth) {
    if (config.auth === 'next-auth') {
      dirs.push('apps/web/app/api/auth/[...nextauth]');
    } else {
      dirs.push('apps/web/app/api/auth/login');
    }
  }

  // State dirs
  if (config.hasState) {
    const stateDir =
      config.state === 'tanstack-query' ? 'apps/web/lib/query' : 'apps/web/lib/store';
    dirs.push(stateDir);
  }

  // GitHub dirs (conditional)
  if (config.githubFiles) {
    dirs.push('.github/ISSUE_TEMPLATE', '.github/workflows');
  }

  // ── v2.0 option dirs ──

  if (config.docker === 'full') dirs.push('nginx');
  if (config.hasI18n) dirs.push('apps/web/i18n', 'apps/web/messages', 'apps/web/app/[locale]');
  if (config.hasPayments) {
    dirs.push('packages/payments/src');
    dirs.push('apps/web/app/pricing');
    if (config.backend === 'nestjs') dirs.push('apps/api/src/payments');
  }
  if (config.hasEmail) dirs.push('packages/email/src', 'packages/email/src/templates');
  if (config.hasApiDocs) dirs.push('apps/api/src/docs');
  if (config.hasStorage) {
    dirs.push('packages/storage/src');
    if (config.storage === 'uploadthing') dirs.push('apps/web/app/api/uploadthing');
  }
  if (config.hasE2e) {
    dirs.push(config.e2e === 'playwright' ? 'apps/web/e2e' : 'apps/web/cypress/e2e');
  }
  if (config.storybook) dirs.push('packages/ui/.storybook');
  if (config.hasCache) dirs.push('packages/cache/src');
  if (config.hasLogging) dirs.push('packages/lib/src/logger');

  return dirs;
}

/** All files that should exist in a generated monorepo */
export function getExpectedFiles(config: ProjectConfig): string[] {
  const files = [
    // Root
    'package.json',
    'turbo.json',
    '.gitignore',
    '.env.example',
    '.prettierrc',
    'README.md',
    'LICENSE',
    'CONTRIBUTING.md',

    // AI Skills (always present)
    '.claude/settings.json',
    '.claude/skills/component-design/SKILL.md',
    '.claude/skills/page-design/SKILL.md',
    '.claude/skills/api-feature/SKILL.md',
    '.claude/skills/monorepo-doctor/SKILL.md',
  ];

  // Workspace config
  if (config.packageManager === 'pnpm') {
    files.push('pnpm-workspace.yaml');
  }

  // Docker compose (only for non-sqlite DBs)
  if (config.hasDatabase && config.db !== 'sqlite') {
    files.push('docker-compose.yml');
  }

  // ── packages/config ──
  files.push(
    'packages/config/package.json',
    'packages/config/eslint/base.js',
    'packages/config/typescript/base.json',
    'packages/config/typescript/nextjs.json',
    'packages/config/typescript/node.json',
  );
  if (config.usesTailwind) {
    files.push('packages/config/tailwind/base.js');
  }

  // ── packages/lib ──
  files.push(
    'packages/lib/package.json',
    'packages/lib/tsconfig.json',
    'packages/lib/src/index.ts',
    'packages/lib/src/types/index.ts',
    'packages/lib/src/utils/index.ts',
    'packages/lib/src/constants/index.ts',
    'packages/lib/src/validators/index.ts',
  );

  // ── packages/ui ──
  files.push(
    'packages/ui/package.json',
    'packages/ui/tsconfig.json',
    'packages/ui/src/index.ts',
    'packages/ui/src/components/index.ts',
    'packages/ui/src/components/button.tsx',
    'packages/ui/src/components/card.tsx',
    'packages/ui/src/components/input.tsx',
    'packages/ui/src/hooks/index.ts',
    'packages/ui/src/hooks/use-media-query.ts',
    'packages/ui/src/hooks/use-debounce.ts',
  );
  if (config.styling === 'css-modules') {
    files.push(
      'packages/ui/src/components/button.module.css',
      'packages/ui/src/components/card.module.css',
      'packages/ui/src/components/input.module.css',
    );
  }

  // ── packages/database ──
  if (config.hasDatabase) {
    files.push(
      'packages/database/package.json',
      'packages/database/tsconfig.json',
      'packages/database/src/index.ts',
      'packages/database/src/client.ts',
      'packages/database/src/seed.ts',
    );
    if (config.orm === 'prisma') {
      files.push('packages/database/prisma/schema.prisma');
    } else {
      files.push('packages/database/src/schema/index.ts');
    }
  }

  // ── apps/web ──
  files.push(
    'apps/web/package.json',
    'apps/web/tsconfig.json',
    'apps/web/next.config.ts',
    'apps/web/app/globals.css',
    'apps/web/app/layout.tsx',
    'apps/web/app/page.tsx',
    'apps/web/app/not-found.tsx',
    'apps/web/app/error.tsx',
    'apps/web/app/loading.tsx',
  );
  if (config.usesTailwind) {
    files.push('apps/web/postcss.config.mjs');
  }

  // State management files
  if (config.hasState) {
    const stateDir =
      config.state === 'tanstack-query' ? 'apps/web/lib/query' : 'apps/web/lib/store';
    files.push(`${stateDir}/index.ts`);

    switch (config.state) {
      case 'zustand':
        files.push(`${stateDir}/theme-store.ts`);
        break;
      case 'jotai':
        files.push(`${stateDir}/theme-atom.ts`);
        break;
      case 'redux':
        files.push(`${stateDir}/store.ts`, `${stateDir}/theme-slice.ts`, `${stateDir}/provider.tsx`);
        break;
      case 'tanstack-query':
        files.push(`${stateDir}/query-client.ts`, `${stateDir}/provider.tsx`);
        break;
    }
  }

  // Auth files
  if (config.hasAuth) {
    files.push('apps/web/lib/auth.ts', 'apps/web/middleware.ts');
    if (config.auth === 'next-auth') {
      files.push(
        'apps/web/app/api/auth/[...nextauth]/route.ts',
        'apps/web/types/next-auth.d.ts',
      );
    } else {
      files.push(
        'apps/web/app/api/auth/login/route.ts',
        'apps/web/types/auth.ts',
      );
    }
  }

  // ── apps/api ──
  files.push(
    'apps/api/package.json',
    'apps/api/tsconfig.json',
    'apps/api/src/main.ts',
  );

  if (config.backend === 'nestjs') {
    files.push(
      'apps/api/src/app.module.ts',
      'apps/api/src/app.controller.ts',
      'apps/api/src/app.service.ts',
      'apps/api/src/common/filters/http-exception.filter.ts',
      'apps/api/src/common/interceptors/logging.interceptor.ts',
      'apps/api/src/common/guards/auth.guard.ts',
      'apps/api/src/common/pipes/zod-validation.pipe.ts',
    );
  } else {
    files.push(
      'apps/api/src/app.ts',
      'apps/api/src/routes/health.ts',
      'apps/api/src/services/app.service.ts',
      'apps/api/src/common/filters/error-handler.ts',
      'apps/api/src/common/interceptors/request-logger.ts',
      'apps/api/src/common/guards/auth.guard.ts',
      'apps/api/src/common/pipes/validate.ts',
    );
  }

  // GitHub files (conditional)
  if (config.githubFiles) {
    files.push(
      'CODE_OF_CONDUCT.md',
      '.github/FUNDING.yml',
      '.github/ISSUE_TEMPLATE/bug_report.md',
      '.github/ISSUE_TEMPLATE/feature_request.md',
      '.github/pull_request_template.md',
      '.github/workflows/ci.yml',
    );
  }

  // ── v2.0 option files ──

  // Docker
  if (config.hasDocker) {
    files.push('apps/web/Dockerfile', 'apps/api/Dockerfile', 'docker-compose.prod.yml', '.dockerignore');
    if (config.docker === 'full') files.push('nginx/nginx.conf', 'nginx/Dockerfile');
  }

  // i18n
  if (config.hasI18n) {
    files.push(
      'apps/web/i18n/request.ts', 'apps/web/i18n/routing.ts', 'apps/web/i18n/navigation.ts',
      'apps/web/messages/en.json', 'apps/web/messages/ar.json',
      'apps/web/app/[locale]/layout.tsx', 'apps/web/app/[locale]/page.tsx',
      'apps/web/components/language-switcher.tsx',
    );
  }

  // Payments
  if (config.hasPayments) {
    files.push(
      'packages/payments/package.json', 'packages/payments/tsconfig.json',
      'packages/payments/src/index.ts', 'packages/payments/src/client.ts',
      'packages/payments/src/webhook.ts', 'packages/payments/src/checkout.ts',
      'packages/payments/src/subscription.ts',
      'apps/web/app/pricing/page.tsx',
    );
    if (config.backend === 'nestjs') {
      files.push('apps/api/src/payments/payments.controller.ts');
    } else {
      files.push('apps/api/src/routes/payments.ts');
    }
  }

  // Email
  if (config.hasEmail) {
    files.push(
      'packages/email/package.json', 'packages/email/tsconfig.json',
      'packages/email/src/index.ts', 'packages/email/src/client.ts', 'packages/email/src/send.ts',
      'packages/email/src/templates/welcome.tsx', 'packages/email/src/templates/reset-password.tsx',
    );
  }

  // API Docs
  if (config.hasApiDocs) {
    files.push('apps/api/src/docs/swagger-config.ts', 'apps/api/src/docs/setup.ts');
  }

  // Storage
  if (config.hasStorage) {
    files.push(
      'packages/storage/package.json', 'packages/storage/tsconfig.json',
      'packages/storage/src/index.ts', 'packages/storage/src/client.ts',
      'packages/storage/src/upload.ts', 'packages/storage/src/download.ts',
    );
    if (config.storage === 'uploadthing') {
      files.push('apps/web/app/api/uploadthing/core.ts', 'apps/web/app/api/uploadthing/route.ts');
    }
  }

  // E2E
  if (config.hasE2e) {
    if (config.e2e === 'playwright') {
      files.push('apps/web/playwright.config.ts', 'apps/web/e2e/example.spec.ts');
    } else {
      files.push('apps/web/cypress.config.ts', 'apps/web/cypress/e2e/example.cy.ts');
    }
  }

  // Storybook
  if (config.storybook) {
    files.push(
      'packages/ui/.storybook/main.ts', 'packages/ui/.storybook/preview.ts',
      'packages/ui/src/components/button.stories.tsx',
      'packages/ui/src/components/card.stories.tsx',
      'packages/ui/src/components/input.stories.tsx',
    );
  }

  // Cache
  if (config.hasCache) {
    files.push(
      'packages/cache/package.json', 'packages/cache/tsconfig.json',
      'packages/cache/src/index.ts', 'packages/cache/src/client.ts', 'packages/cache/src/service.ts',
    );
  }

  // Logging
  if (config.hasLogging) {
    files.push('packages/lib/src/logger/index.ts', 'packages/lib/src/logger/logger.ts');
  }

  return files;
}
