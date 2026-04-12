/**
 * ProjectConfig — Immutable configuration model holding all user choices.
 * Auto-derives package names, case variants, and computed properties.
 * Mirrors flutter_monorepo's ProjectConfig pattern.
 */

// ── Enums (as const objects + type aliases) ──────────────────────────

export const Backend = { nestjs: 'nestjs', express: 'express' } as const;
export type Backend = (typeof Backend)[keyof typeof Backend];

export const Styling = {
  tailwind: 'tailwind',
  cssModules: 'css-modules',
  styledComponents: 'styled-components',
} as const;
export type Styling = (typeof Styling)[keyof typeof Styling];

export const ORM = { prisma: 'prisma', drizzle: 'drizzle', none: 'none' } as const;
export type ORM = (typeof ORM)[keyof typeof ORM];

export const Database = {
  postgres: 'postgres',
  mysql: 'mysql',
  sqlite: 'sqlite',
  mongodb: 'mongodb',
} as const;
export type Database = (typeof Database)[keyof typeof Database];

export const Auth = {
  nextAuth: 'next-auth',
  custom: 'custom',
  none: 'none',
} as const;
export type Auth = (typeof Auth)[keyof typeof Auth];

export const StateManagement = {
  zustand: 'zustand',
  jotai: 'jotai',
  redux: 'redux',
  tanstackQuery: 'tanstack-query',
  none: 'none',
} as const;
export type StateManagement = (typeof StateManagement)[keyof typeof StateManagement];

export const TestFramework = { vitest: 'vitest', jest: 'jest' } as const;
export type TestFramework = (typeof TestFramework)[keyof typeof TestFramework];

export const PackageManager = {
  pnpm: 'pnpm',
  npm: 'npm',
  yarn: 'yarn',
  bun: 'bun',
} as const;
export type PackageManager = (typeof PackageManager)[keyof typeof PackageManager];

export const LicenseType = {
  MIT: 'MIT',
  Apache2: 'Apache-2.0',
  BSD2: 'BSD-2-Clause',
  BSD3: 'BSD-3-Clause',
  GPL2: 'GPL-2.0',
  GPL3: 'GPL-3.0',
  LGPL21: 'LGPL-2.1',
  MPL2: 'MPL-2.0',
  ISC: 'ISC',
  Unlicense: 'Unlicense',
  Proprietary: 'proprietary',
} as const;
export type LicenseType = (typeof LicenseType)[keyof typeof LicenseType];

// ── New v2.0 enums ──────────────────────────────────────────────────

export const Docker = { full: 'full', minimal: 'minimal', none: 'none' } as const;
export type Docker = (typeof Docker)[keyof typeof Docker];

export const I18n = { nextIntl: 'next-intl', none: 'none' } as const;
export type I18n = (typeof I18n)[keyof typeof I18n];

export const ApiStyle = { rest: 'rest', graphql: 'graphql', trpc: 'trpc' } as const;
export type ApiStyle = (typeof ApiStyle)[keyof typeof ApiStyle];

export const Payments = {
  stripe: 'stripe',
  lemonsqueezy: 'lemonsqueezy',
  paddle: 'paddle',
  none: 'none',
} as const;
export type Payments = (typeof Payments)[keyof typeof Payments];

export const Email = {
  resend: 'resend',
  nodemailer: 'nodemailer',
  sendgrid: 'sendgrid',
  none: 'none',
} as const;
export type Email = (typeof Email)[keyof typeof Email];

export const ApiDocs = { swagger: 'swagger', redoc: 'redoc', none: 'none' } as const;
export type ApiDocs = (typeof ApiDocs)[keyof typeof ApiDocs];

export const Storage = {
  s3: 's3',
  uploadthing: 'uploadthing',
  cloudinary: 'cloudinary',
  none: 'none',
} as const;
export type Storage = (typeof Storage)[keyof typeof Storage];

export const E2e = { playwright: 'playwright', cypress: 'cypress', none: 'none' } as const;
export type E2e = (typeof E2e)[keyof typeof E2e];

export const Cache = { redis: 'redis', none: 'none' } as const;
export type Cache = (typeof Cache)[keyof typeof Cache];

export const Logging = { pino: 'pino', winston: 'winston', default: 'default' } as const;
export type Logging = (typeof Logging)[keyof typeof Logging];

// ── Display name mappings ────────────────────────────────────────────

export const backendDisplayName: Record<Backend, string> = {
  nestjs: 'NestJS',
  express: 'Express',
};

export const stylingDisplayName: Record<Styling, string> = {
  tailwind: 'Tailwind CSS',
  'css-modules': 'CSS Modules',
  'styled-components': 'Styled Components',
};

export const ormDisplayName: Record<ORM, string> = {
  prisma: 'Prisma',
  drizzle: 'Drizzle',
  none: 'None',
};

export const stateDisplayName: Record<StateManagement, string> = {
  zustand: 'Zustand',
  jotai: 'Jotai',
  redux: 'Redux Toolkit',
  'tanstack-query': 'TanStack Query',
  none: 'None',
};

export const authDisplayName: Record<Auth, string> = {
  'next-auth': 'NextAuth.js',
  custom: 'Custom JWT',
  none: 'None',
};

export const apiStyleDisplayName: Record<ApiStyle, string> = {
  rest: 'REST',
  graphql: 'GraphQL (Apollo)',
  trpc: 'tRPC',
};

export const dockerDisplayName: Record<Docker, string> = {
  full: 'Docker (Full)',
  minimal: 'Docker (Minimal)',
  none: 'None',
};

export const paymentsDisplayName: Record<Payments, string> = {
  stripe: 'Stripe',
  lemonsqueezy: 'LemonSqueezy',
  paddle: 'Paddle',
  none: 'None',
};

export const emailDisplayName: Record<Email, string> = {
  resend: 'Resend',
  nodemailer: 'Nodemailer',
  sendgrid: 'SendGrid',
  none: 'None',
};

export const storageDisplayName: Record<Storage, string> = {
  s3: 'AWS S3',
  uploadthing: 'UploadThing',
  cloudinary: 'Cloudinary',
  none: 'None',
};

export const loggingDisplayName: Record<Logging, string> = {
  pino: 'Pino',
  winston: 'Winston',
  default: 'Default',
};

// ── ProjectConfig ────────────────────────────────────────────────────

export interface ProjectConfigOptions {
  name: string;
  backend?: Backend;
  styling?: Styling;
  orm?: ORM;
  db?: Database;
  auth?: Auth;
  state?: StateManagement;
  testing?: TestFramework;
  license?: LicenseType;
  packageManager?: PackageManager;
  gitInit?: boolean;
  githubFiles?: boolean;
  apiStyle?: ApiStyle;
  docker?: Docker;
  i18n?: I18n;
  payments?: Payments;
  email?: Email;
  apiDocs?: ApiDocs;
  storage?: Storage;
  e2e?: E2e;
  storybook?: boolean;
  cache?: Cache;
  logging?: Logging;
}

export class ProjectConfig {
  /** Project name in kebab-case (e.g. "my-app") */
  readonly name: string;
  readonly backend: Backend;
  readonly styling: Styling;
  readonly orm: ORM;
  readonly db: Database;
  readonly auth: Auth;
  readonly state: StateManagement;
  readonly testing: TestFramework;
  readonly license: LicenseType;
  readonly packageManager: PackageManager;
  readonly gitInit: boolean;
  readonly githubFiles: boolean;
  readonly apiStyle: ApiStyle;
  readonly docker: Docker;
  readonly i18n: I18n;
  readonly payments: Payments;
  readonly email: Email;
  readonly apiDocs: ApiDocs;
  readonly storage: Storage;
  readonly e2e: E2e;
  readonly storybook: boolean;
  readonly cache: Cache;
  readonly logging: Logging;

  /** Resolved npm package versions — set by Generator before template rendering */
  versions: Record<string, string> = {};

  constructor(options: ProjectConfigOptions) {
    this.name = options.name;
    this.backend = options.backend ?? 'nestjs';
    this.styling = options.styling ?? 'tailwind';
    this.orm = options.orm ?? 'prisma';
    this.db = options.db ?? 'postgres';
    this.auth = options.auth ?? 'next-auth';
    this.state = options.state ?? 'zustand';
    this.testing = options.testing ?? 'vitest';
    this.license = options.license ?? 'MIT';
    this.packageManager = options.packageManager ?? 'pnpm';
    this.gitInit = options.gitInit ?? true;
    this.githubFiles = options.githubFiles ?? false;
    this.apiStyle = options.apiStyle ?? 'rest';
    this.docker = options.docker ?? 'none';
    this.i18n = options.i18n ?? 'none';
    this.payments = options.payments ?? 'none';
    this.email = options.email ?? 'none';
    this.apiDocs = options.apiDocs ?? 'none';
    this.storage = options.storage ?? 'none';
    this.e2e = options.e2e ?? 'none';
    this.storybook = options.storybook ?? false;
    this.cache = options.cache ?? 'none';
    this.logging = options.logging ?? 'default';
  }

  // ── Derived name variants ──────────────────────────────────────

  /** PascalCase (e.g. "my-app" → "MyApp") */
  get pascalCase(): string {
    return this.name
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
  }

  /** camelCase (e.g. "my-app" → "myApp") */
  get camelCase(): string {
    const pascal = this.pascalCase;
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  /** SCREAMING_SNAKE_CASE (e.g. "my-app" → "MY_APP") */
  get screamingSnakeCase(): string {
    return this.name.replace(/-/g, '_').toUpperCase();
  }

  // ── Computed properties ────────────────────────────────────────

  get hasDatabase(): boolean {
    return this.orm !== 'none';
  }

  get hasAuth(): boolean {
    return this.auth !== 'none';
  }

  get hasState(): boolean {
    return this.state !== 'none';
  }

  get usesTailwind(): boolean {
    return this.styling === 'tailwind';
  }

  get hasApiStyle(): boolean {
    return this.apiStyle !== 'rest';
  }

  get hasDocker(): boolean {
    return this.docker !== 'none';
  }

  get hasI18n(): boolean {
    return this.i18n !== 'none';
  }

  get hasPayments(): boolean {
    return this.payments !== 'none';
  }

  get hasEmail(): boolean {
    return this.email !== 'none';
  }

  get hasApiDocs(): boolean {
    return this.apiDocs !== 'none';
  }

  get hasStorage(): boolean {
    return this.storage !== 'none';
  }

  get hasE2e(): boolean {
    return this.e2e !== 'none';
  }

  get hasCache(): boolean {
    return this.cache !== 'none';
  }

  get hasLogging(): boolean {
    return this.logging !== 'default';
  }

  /** Install command for the selected package manager */
  get installCommand(): string {
    switch (this.packageManager) {
      case 'pnpm':
        return 'pnpm install';
      case 'npm':
        return 'npm install';
      case 'yarn':
        return 'yarn install';
      case 'bun':
        return 'bun install';
    }
  }

  /** Run command prefix for the selected package manager */
  get runCommand(): string {
    switch (this.packageManager) {
      case 'pnpm':
        return 'pnpm';
      case 'npm':
        return 'npm run';
      case 'yarn':
        return 'yarn';
      case 'bun':
        return 'bun run';
    }
  }

  /** Workspace config file name */
  get workspaceConfigFile(): string {
    return this.packageManager === 'pnpm' ? 'pnpm-workspace.yaml' : 'package.json';
  }

  /** List of npm packages required based on current config */
  get requiredPackages(): string[] {
    const packages: string[] = [
      // Core — always needed
      'next',
      'react',
      'react-dom',
      'typescript',
      'turbo',
      '@types/react',
      '@types/react-dom',
      '@types/node',
      'eslint',
      'prettier',
    ];

    // Backend
    if (this.backend === 'nestjs') {
      packages.push(
        '@nestjs/core',
        '@nestjs/common',
        '@nestjs/platform-express',
        'reflect-metadata',
        'rxjs',
      );
    } else {
      packages.push('express', '@types/express', 'cors', '@types/cors');
    }

    // Styling
    if (this.styling === 'tailwind') {
      packages.push('tailwindcss', 'postcss', 'autoprefixer', '@tailwindcss/postcss');
    } else if (this.styling === 'styled-components') {
      packages.push('styled-components');
    }

    // ORM
    if (this.orm === 'prisma') {
      packages.push('prisma', '@prisma/client');
    } else if (this.orm === 'drizzle') {
      packages.push('drizzle-orm', 'drizzle-kit');
      if (this.db === 'postgres') packages.push('pg', '@types/pg');
      if (this.db === 'mysql') packages.push('mysql2');
      if (this.db === 'sqlite') packages.push('better-sqlite3');
    }

    // Auth
    if (this.auth === 'next-auth') {
      packages.push('next-auth', '@auth/core');
      if (this.orm === 'prisma') packages.push('@auth/prisma-adapter');
      if (this.orm === 'drizzle') packages.push('@auth/drizzle-adapter');
    } else if (this.auth === 'custom') {
      packages.push('jsonwebtoken', '@types/jsonwebtoken', 'bcryptjs', '@types/bcryptjs');
    }

    // State management
    if (this.state === 'zustand') packages.push('zustand');
    if (this.state === 'jotai') packages.push('jotai');
    if (this.state === 'redux') packages.push('@reduxjs/toolkit', 'react-redux');
    if (this.state === 'tanstack-query') packages.push('@tanstack/react-query');

    // Testing
    if (this.testing === 'vitest') {
      packages.push('vitest', '@vitejs/plugin-react');
    } else {
      packages.push('jest', '@types/jest', 'ts-jest');
    }

    // Validation — always include zod for shared validators
    packages.push('zod');

    // ── v2.0 options ──

    // API Style
    if (this.apiStyle === 'graphql') {
      packages.push('graphql', '@apollo/server');
      if (this.backend === 'nestjs') {
        packages.push('@nestjs/graphql', '@nestjs/apollo', 'class-validator', 'class-transformer');
      } else {
        packages.push('@as-integrations/express');
      }
    }
    if (this.apiStyle === 'trpc') {
      packages.push('@trpc/server', '@trpc/client', '@trpc/react-query', 'superjson');
    }

    // i18n
    if (this.i18n === 'next-intl') packages.push('next-intl');

    // Payments
    if (this.payments === 'stripe') packages.push('stripe');
    if (this.payments === 'lemonsqueezy') packages.push('@lemonsqueezy/lemonsqueezy.js');
    if (this.payments === 'paddle') packages.push('@paddle/paddle-node-sdk');

    // Email
    if (this.email === 'resend') packages.push('resend', '@react-email/components');
    if (this.email === 'nodemailer') packages.push('nodemailer', '@types/nodemailer');
    if (this.email === 'sendgrid') packages.push('@sendgrid/mail');

    // API Docs
    if (this.apiDocs === 'swagger' || this.apiDocs === 'redoc') {
      if (this.backend === 'nestjs') {
        packages.push('@nestjs/swagger');
      } else {
        packages.push('swagger-jsdoc', 'swagger-ui-express', '@types/swagger-jsdoc', '@types/swagger-ui-express');
      }
    }
    if (this.apiDocs === 'redoc') packages.push('redoc-express');

    // Storage
    if (this.storage === 's3') packages.push('@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner');
    if (this.storage === 'uploadthing') packages.push('uploadthing', '@uploadthing/react');
    if (this.storage === 'cloudinary') packages.push('cloudinary');

    // E2E
    if (this.e2e === 'playwright') packages.push('@playwright/test');
    if (this.e2e === 'cypress') packages.push('cypress');

    // Storybook
    if (this.storybook) {
      packages.push('storybook', '@storybook/react', '@storybook/react-vite', '@storybook/addon-essentials');
    }

    // Cache
    if (this.cache === 'redis') packages.push('ioredis');

    // Logging
    if (this.logging === 'pino') packages.push('pino', 'pino-pretty');
    if (this.logging === 'winston') packages.push('winston');

    return packages;
  }
}
