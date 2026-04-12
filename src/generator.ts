/**
 * Generator — 26-step pipeline that creates a complete monorepo.
 * Mirrors flutter_monorepo's Generator class architecture.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import type { ProjectConfig } from './project-config.js';
import { VersionResolver } from './version-resolver.js';
import { logger } from './logger.js';
import { getExpectedDirectories } from './expected-paths.js';

// Template imports
import * as root from './templates/root-templates.js';
import * as config from './templates/config-templates.js';
import * as lib from './templates/lib-templates.js';
import * as ui from './templates/ui-templates.js';
import * as nextjs from './templates/nextjs-templates.js';
import * as license from './templates/license-templates.js';
import * as skills from './templates/skills-templates.js';
import * as github from './templates/github-templates.js';
import * as cacheTmpl from './templates/cache-templates.js';
import * as i18nTmpl from './templates/i18n-templates.js';
import * as storybookTmpl from './templates/storybook-templates.js';

// Strategy imports
import { createBackendStrategy } from './templates/strategies/backend-factory.js';
import { createOrmStrategy } from './templates/strategies/orm-factory.js';
import { createAuthStrategy } from './templates/strategies/auth-factory.js';
import { createStateStrategy } from './templates/strategies/state-factory.js';
import { createDockerStrategy } from './templates/strategies/docker-factory.js';
import { createE2eStrategy } from './templates/strategies/e2e-factory.js';
import { createLoggingStrategy } from './templates/strategies/logging-factory.js';
import { createEmailStrategy } from './templates/strategies/email-factory.js';
import { createStorageStrategy } from './templates/strategies/storage-factory.js';
import { createPaymentStrategy } from './templates/strategies/payment-factory.js';
import { createApiDocsStrategy } from './templates/strategies/api-docs-factory.js';
import { createApiStyleStrategy } from './templates/strategies/api-style-factory.js';

const TOTAL_STEPS = 27;

export class Generator {
  private rootPath: string;
  private config: ProjectConfig;

  constructor(config: ProjectConfig, rootPath: string) {
    this.config = config;
    this.rootPath = rootPath;
  }

  /** Run the full 26-step generation pipeline */
  async run(): Promise<void> {
    logger.header(`Creating ${this.config.pascalCase} monorepo...`);
    logger.newline();

    await this.resolveVersions();          // Step 1
    this.createRootWorkspace();            // Step 2
    this.createDirectories();              // Step 3
    this.writeRootFiles();                 // Step 4
    this.writeGithubFiles();               // Step 5
    this.writeConfigPackage();             // Step 6
    this.writeLibPackage();                // Step 7
    this.writeUiPackage();                 // Step 8
    this.writeDatabasePackage();           // Step 9
    this.writeCachePackage();              // Step 10
    this.writeEmailPackage();              // Step 11
    this.writeStoragePackage();            // Step 12
    this.writePaymentsPackage();           // Step 13
    this.writeNextjsApp();                 // Step 14
    this.writeI18nLayer();                 // Step 15
    this.writeBackendApp();                // Step 16
    this.writeApiStyleLayer();             // Step 17
    this.writeApiDocs();                   // Step 18
    this.writeLoggingLayer();              // Step 19
    this.writeAuthLayer();                 // Step 20
    this.writeDockerFiles();               // Step 21
    this.writeStorybookConfig();           // Step 22
    this.writeE2eTests();                  // Step 23
    this.writeSkills();                    // Step 24
    await this.installDependencies();      // Step 25
    await this.initializeGit();            // Step 26
    this.printSummary();                   // Step 27
  }

  // ── Step 1: Resolve versions ─────────────────────────────────────

  private async resolveVersions(): Promise<void> {
    logger.step(1, TOTAL_STEPS, 'Resolving latest package versions...');
    const resolver = new VersionResolver();
    this.config.versions = await resolver.resolve(this.config.requiredPackages);
    logger.success(`Resolved ${Object.keys(this.config.versions).length} package versions`);
  }

  // ── Step 2: Create root workspace ────────────────────────────────

  private createRootWorkspace(): void {
    logger.step(2, TOTAL_STEPS, 'Creating root workspace...');
    fs.mkdirSync(this.rootPath, { recursive: true });
    this.write('package.json', root.rootPackageJson(this.config));
    this.write('turbo.json', root.turboJson(this.config));
    if (this.config.packageManager === 'pnpm') {
      this.write('pnpm-workspace.yaml', root.pnpmWorkspaceYaml());
    }
    logger.success('Root workspace created');
  }

  // ── Step 3: Create directories ───────────────────────────────────

  private createDirectories(): void {
    logger.step(3, TOTAL_STEPS, 'Creating directory structure...');
    const dirs = getExpectedDirectories(this.config);
    for (const dir of dirs) {
      fs.mkdirSync(path.join(this.rootPath, dir), { recursive: true });
    }
    logger.success(`Created ${dirs.length} directories`);
  }

  // ── Step 4: Write root files ─────────────────────────────────────

  private writeRootFiles(): void {
    logger.step(4, TOTAL_STEPS, 'Writing root configuration files...');
    this.write('.gitignore', root.gitignore());
    this.write('.env.example', root.envExample(this.config));
    this.write('.prettierrc', root.prettierrc());
    this.write('README.md', root.readmeMd(this.config));
    this.write('CONTRIBUTING.md', root.contributingMd(this.config));
    this.write('LICENSE', license.licenseText(this.config));
    const dockerContent = root.dockerCompose(this.config);
    if (dockerContent) this.write('docker-compose.yml', dockerContent);
    logger.success('Root files written');
  }

  // ── Step 5: Write GitHub files ───────────────────────────────────

  private writeGithubFiles(): void {
    if (!this.config.githubFiles) {
      logger.step(5, TOTAL_STEPS, 'Skipping GitHub files (--no-github)');
      return;
    }
    logger.step(5, TOTAL_STEPS, 'Writing GitHub community files...');
    this.write('CODE_OF_CONDUCT.md', github.codeOfConduct());
    this.write('.github/FUNDING.yml', github.fundingYml());
    this.write('.github/ISSUE_TEMPLATE/bug_report.md', github.bugReport());
    this.write('.github/ISSUE_TEMPLATE/feature_request.md', github.featureRequest());
    this.write('.github/pull_request_template.md', github.pullRequestTemplate());
    this.write('.github/workflows/ci.yml', github.ciWorkflow(this.config));

    // Append E2E CI job if configured
    if (this.config.hasE2e) {
      const e2eStrategy = createE2eStrategy(this.config.e2e);
      if (e2eStrategy) {
        const ciContent = fs.readFileSync(path.join(this.rootPath, '.github/workflows/ci.yml'), 'utf-8');
        fs.writeFileSync(
          path.join(this.rootPath, '.github/workflows/ci.yml'),
          ciContent + e2eStrategy.ciWorkflow(this.config),
          'utf-8',
        );
      }
    }
    logger.success('GitHub files written');
  }

  // ── Step 6: Write config package ─────────────────────────────────

  private writeConfigPackage(): void {
    logger.step(6, TOTAL_STEPS, 'Writing shared config package...');
    this.write('packages/config/package.json', config.configPackageJson(this.config));
    this.write('packages/config/eslint/base.js', config.eslintBase(this.config));
    this.write('packages/config/typescript/base.json', config.tsConfigBase());
    this.write('packages/config/typescript/nextjs.json', config.tsConfigNextjs());
    this.write('packages/config/typescript/node.json', config.tsConfigNode());
    if (this.config.usesTailwind) {
      this.write('packages/config/tailwind/base.js', config.tailwindBase(this.config));
    }
    logger.success('Config package written');
  }

  // ── Step 7: Write lib package ────────────────────────────────────

  private writeLibPackage(): void {
    logger.step(7, TOTAL_STEPS, 'Writing shared lib package...');
    this.write('packages/lib/package.json', lib.libPackageJson(this.config));
    this.write('packages/lib/tsconfig.json', lib.libTsConfig().replace('{name}', this.config.name));
    this.write('packages/lib/src/index.ts', lib.libIndex());
    this.write('packages/lib/src/types/index.ts', lib.libTypes());
    this.write('packages/lib/src/utils/index.ts', lib.libUtils());
    this.write('packages/lib/src/constants/index.ts', lib.libConstants());
    this.write('packages/lib/src/validators/index.ts', lib.libValidators());
    logger.success('Lib package written');
  }

  // ── Step 8: Write UI package ─────────────────────────────────────

  private writeUiPackage(): void {
    logger.step(8, TOTAL_STEPS, 'Writing shared UI package...');
    this.write('packages/ui/package.json', ui.uiPackageJson(this.config));
    this.write('packages/ui/tsconfig.json', ui.uiTsConfig(this.config));
    this.write('packages/ui/src/index.ts', ui.uiIndex());
    this.write('packages/ui/src/components/index.ts', ui.uiComponentsIndex());
    this.write('packages/ui/src/components/button.tsx', ui.uiButton(this.config));
    this.write('packages/ui/src/components/card.tsx', ui.uiCard(this.config));
    this.write('packages/ui/src/components/input.tsx', ui.uiInput(this.config));
    this.write('packages/ui/src/hooks/index.ts', ui.uiHooksIndex());
    this.write('packages/ui/src/hooks/use-media-query.ts', ui.uiUseMediaQuery());
    this.write('packages/ui/src/hooks/use-debounce.ts', ui.uiUseDebounce());
    if (this.config.styling === 'css-modules') {
      this.write('packages/ui/src/components/button.module.css', ui.uiButtonCss());
      this.write('packages/ui/src/components/card.module.css', ui.uiCardCss());
      this.write('packages/ui/src/components/input.module.css', ui.uiInputCss());
    }
    logger.success('UI package written');
  }

  // ── Step 9: Write database package ───────────────────────────────

  private writeDatabasePackage(): void {
    if (!this.config.hasDatabase) {
      logger.step(9, TOTAL_STEPS, 'Skipping database package (--orm none)');
      return;
    }
    logger.step(9, TOTAL_STEPS, `Writing database package (${this.config.orm})...`);
    const ormStrategy = createOrmStrategy(this.config.orm);
    if (!ormStrategy) return;
    this.write('packages/database/package.json', ormStrategy.packageJson(this.config));
    this.write('packages/database/tsconfig.json', ormStrategy.tsConfig(this.config));
    this.write('packages/database/src/index.ts', ormStrategy.index(this.config));
    this.write('packages/database/src/client.ts', ormStrategy.clientFile(this.config));
    this.write('packages/database/src/seed.ts', ormStrategy.seedFile(this.config));
    if (this.config.orm === 'prisma') {
      this.write('packages/database/prisma/schema.prisma', ormStrategy.schemaFile(this.config));
    } else {
      this.write('packages/database/src/schema/index.ts', ormStrategy.schemaFile(this.config));
    }
    logger.success('Database package written');
  }

  // ── Step 10: Write cache package ─────────────────────────────────

  private writeCachePackage(): void {
    if (!this.config.hasCache) {
      logger.step(10, TOTAL_STEPS, 'Skipping cache package (--cache none)');
      return;
    }
    logger.step(10, TOTAL_STEPS, 'Writing cache package (Redis)...');
    this.write('packages/cache/package.json', cacheTmpl.cachePackageJson(this.config));
    this.write('packages/cache/tsconfig.json', cacheTmpl.cacheTsConfig(this.config));
    this.write('packages/cache/src/index.ts', cacheTmpl.cacheIndex());
    this.write('packages/cache/src/client.ts', cacheTmpl.cacheClient());
    this.write('packages/cache/src/service.ts', cacheTmpl.cacheService());
    logger.success('Cache package written');
  }

  // ── Step 11: Write email package ─────────────────────────────────

  private writeEmailPackage(): void {
    if (!this.config.hasEmail) {
      logger.step(11, TOTAL_STEPS, 'Skipping email package (--email none)');
      return;
    }
    logger.step(11, TOTAL_STEPS, `Writing email package (${this.config.email})...`);
    const strategy = createEmailStrategy(this.config.email);
    if (!strategy) return;
    this.write('packages/email/package.json', strategy.packageJson(this.config));
    this.write('packages/email/tsconfig.json', `{\n  "extends": "@${this.config.name}/config/typescript/base",\n  "compilerOptions": {\n    "jsx": "react-jsx",\n    "outDir": "./dist",\n    "rootDir": "./src",\n    "verbatimModuleSyntax": false\n  },\n  "include": ["src/**/*"]\n}\n`);
    this.write('packages/email/src/index.ts', strategy.index(this.config));
    this.write('packages/email/src/client.ts', strategy.client(this.config));
    this.write('packages/email/src/send.ts', strategy.sendFunction(this.config));
    this.write('packages/email/src/templates/welcome.tsx', strategy.welcomeTemplate(this.config));
    this.write('packages/email/src/templates/reset-password.tsx', strategy.resetPasswordTemplate(this.config));
    logger.success('Email package written');
  }

  // ── Step 12: Write storage package ───────────────────────────────

  private writeStoragePackage(): void {
    if (!this.config.hasStorage) {
      logger.step(12, TOTAL_STEPS, 'Skipping storage package (--storage none)');
      return;
    }
    logger.step(12, TOTAL_STEPS, `Writing storage package (${this.config.storage})...`);
    const strategy = createStorageStrategy(this.config.storage);
    if (!strategy) return;
    this.write('packages/storage/package.json', strategy.packageJson(this.config));
    this.write('packages/storage/tsconfig.json', `{\n  "extends": "@${this.config.name}/config/typescript/base",\n  "compilerOptions": {\n    "outDir": "./dist",\n    "rootDir": "./src",\n    "verbatimModuleSyntax": false\n  },\n  "include": ["src/**/*"]\n}\n`);
    this.write('packages/storage/src/index.ts', strategy.index(this.config));
    this.write('packages/storage/src/client.ts', strategy.client(this.config));
    this.write('packages/storage/src/upload.ts', strategy.uploadService(this.config));
    this.write('packages/storage/src/download.ts', strategy.downloadService(this.config));
    const apiRoutes = strategy.apiRoutes(this.config);
    for (const [routePath, content] of Object.entries(apiRoutes)) {
      this.write(routePath, content);
    }
    logger.success('Storage package written');
  }

  // ── Step 13: Write payments package ──────────────────────────────

  private writePaymentsPackage(): void {
    if (!this.config.hasPayments) {
      logger.step(13, TOTAL_STEPS, 'Skipping payments package (--payments none)');
      return;
    }
    logger.step(13, TOTAL_STEPS, `Writing payments package (${this.config.payments})...`);
    const strategy = createPaymentStrategy(this.config.payments);
    if (!strategy) return;
    this.write('packages/payments/package.json', strategy.packageJson(this.config));
    this.write('packages/payments/tsconfig.json', `{\n  "extends": "@${this.config.name}/config/typescript/base",\n  "compilerOptions": {\n    "outDir": "./dist",\n    "rootDir": "./src",\n    "verbatimModuleSyntax": false\n  },\n  "include": ["src/**/*"]\n}\n`);
    this.write('packages/payments/src/index.ts', strategy.index(this.config));
    this.write('packages/payments/src/client.ts', strategy.client(this.config));
    this.write('packages/payments/src/webhook.ts', strategy.webhookHandler(this.config));
    this.write('packages/payments/src/checkout.ts', strategy.checkout(this.config));
    this.write('packages/payments/src/subscription.ts', strategy.subscription(this.config));
    // Backend webhook route
    if (this.config.backend === 'nestjs') {
      this.write('apps/api/src/payments/payments.controller.ts', strategy.apiRoute(this.config));
    } else {
      this.write('apps/api/src/routes/payments.ts', strategy.apiRoute(this.config));
    }
    // Pricing page
    this.write('apps/web/app/pricing/page.tsx', strategy.pricingPage(this.config));
    logger.success('Payments package written');
  }

  // ── Step 14: Write Next.js app ───────────────────────────────────

  private writeNextjsApp(): void {
    logger.step(14, TOTAL_STEPS, 'Writing Next.js 15 app...');
    this.write('apps/web/package.json', nextjs.webPackageJson(this.config));
    this.write('apps/web/tsconfig.json', nextjs.webTsConfig(this.config));
    this.write('apps/web/next.config.ts', nextjs.nextConfig(this.config));
    this.write('apps/web/app/globals.css', nextjs.globalsCss(this.config));
    this.write('apps/web/app/layout.tsx', nextjs.rootLayout(this.config));
    this.write('apps/web/app/page.tsx', nextjs.homePage(this.config));
    this.write('apps/web/app/not-found.tsx', nextjs.notFoundPage(this.config));
    this.write('apps/web/app/error.tsx', nextjs.errorPage());
    this.write('apps/web/app/loading.tsx', nextjs.loadingPage());
    if (this.config.usesTailwind) {
      this.write('apps/web/postcss.config.mjs', nextjs.postcssConfig());
    }
    // State management files
    const stateStrategy = createStateStrategy(this.config.state);
    if (stateStrategy) {
      const stateDir = this.config.state === 'tanstack-query' ? 'lib/query' : 'lib/store';
      this.write(`apps/web/${stateDir}/index.ts`, stateStrategy.storeSetup(this.config));
      if (this.config.state === 'tanstack-query') {
        this.write(`apps/web/${stateDir}/query-client.ts`, stateStrategy.exampleStore(this.config));
      } else if (this.config.state === 'zustand') {
        this.write(`apps/web/${stateDir}/theme-store.ts`, stateStrategy.exampleStore(this.config));
      } else if (this.config.state === 'jotai') {
        this.write(`apps/web/${stateDir}/theme-atom.ts`, stateStrategy.exampleStore(this.config));
      } else if (this.config.state === 'redux') {
        this.write(`apps/web/${stateDir}/store.ts`, stateStrategy.storeSetup(this.config));
        this.write(`apps/web/${stateDir}/theme-slice.ts`, stateStrategy.exampleStore(this.config));
      }
      const provider = stateStrategy.providerWrapper(this.config);
      if (provider) this.write(`apps/web/${stateDir}/provider.tsx`, provider);
    }
    logger.success('Next.js app written');
  }

  // ── Step 15: Write i18n layer ────────────────────────────────────

  private writeI18nLayer(): void {
    if (!this.config.hasI18n) {
      logger.step(15, TOTAL_STEPS, 'Skipping i18n (--i18n none)');
      return;
    }
    logger.step(15, TOTAL_STEPS, 'Writing i18n layer (next-intl)...');
    this.write('apps/web/i18n/request.ts', i18nTmpl.i18nRequest());
    this.write('apps/web/i18n/routing.ts', i18nTmpl.i18nRouting());
    this.write('apps/web/i18n/navigation.ts', i18nTmpl.i18nNavigation());
    this.write('apps/web/messages/en.json', i18nTmpl.messagesEn(this.config));
    this.write('apps/web/messages/ar.json', i18nTmpl.messagesAr(this.config));
    this.write('apps/web/app/[locale]/layout.tsx', i18nTmpl.i18nLayout(this.config));
    this.write('apps/web/app/[locale]/page.tsx', i18nTmpl.i18nPage(this.config));
    this.write('apps/web/components/language-switcher.tsx', i18nTmpl.languageSwitcher());
    logger.success('i18n layer written');
  }

  // ── Step 16: Write backend app ───────────────────────────────────

  private writeBackendApp(): void {
    logger.step(16, TOTAL_STEPS, `Writing ${this.config.backend} backend...`);
    const backendStrategy = createBackendStrategy(this.config.backend);
    this.write('apps/api/package.json', backendStrategy.packageJson(this.config));
    this.write('apps/api/tsconfig.json', backendStrategy.tsConfig(this.config));
    if (this.config.backend === 'nestjs') {
      this.write('apps/api/src/main.ts', backendStrategy.mainEntry(this.config));
      this.write('apps/api/src/app.module.ts', backendStrategy.appSetup(this.config));
      this.write('apps/api/src/app.controller.ts', backendStrategy.appController(this.config));
      this.write('apps/api/src/app.service.ts', backendStrategy.appService(this.config));
      this.write('apps/api/src/common/filters/http-exception.filter.ts', backendStrategy.exceptionFilter(this.config));
      this.write('apps/api/src/common/interceptors/logging.interceptor.ts', backendStrategy.loggingInterceptor(this.config));
      this.write('apps/api/src/common/guards/auth.guard.ts', backendStrategy.authGuard(this.config));
      this.write('apps/api/src/common/pipes/zod-validation.pipe.ts', backendStrategy.validationPipe(this.config));
    } else {
      this.write('apps/api/src/main.ts', backendStrategy.mainEntry(this.config));
      this.write('apps/api/src/app.ts', backendStrategy.appSetup(this.config));
      this.write('apps/api/src/routes/health.ts', backendStrategy.appController(this.config));
      this.write('apps/api/src/services/app.service.ts', backendStrategy.appService(this.config));
      this.write('apps/api/src/common/filters/error-handler.ts', backendStrategy.exceptionFilter(this.config));
      this.write('apps/api/src/common/interceptors/request-logger.ts', backendStrategy.loggingInterceptor(this.config));
      this.write('apps/api/src/common/guards/auth.guard.ts', backendStrategy.authGuard(this.config));
      this.write('apps/api/src/common/pipes/validate.ts', backendStrategy.validationPipe(this.config));
    }
    logger.success(`${this.config.backend === 'nestjs' ? 'NestJS' : 'Express'} backend written`);
  }

  // ── Step 17: Write API style layer ────────────────────────────────

  private writeApiStyleLayer(): void {
    if (!this.config.hasApiStyle) {
      logger.step(17, TOTAL_STEPS, 'Skipping API style layer (--api-style rest)');
      return;
    }
    logger.step(17, TOTAL_STEPS, `Writing ${this.config.apiStyle} API layer...`);
    const strategy = createApiStyleStrategy(this.config.apiStyle, this.config.backend);
    if (!strategy) return;

    // Write server files
    const serverFiles = strategy.serverFiles(this.config);
    for (const [filePath, content] of Object.entries(serverFiles)) {
      this.write(filePath, content);
    }

    // Write client files (tRPC Next.js integration)
    const clientFiles = strategy.clientFiles(this.config);
    for (const [filePath, content] of Object.entries(clientFiles)) {
      this.write(filePath, content);
    }

    // Write setup instructions
    this.write(`apps/api/src/${this.config.apiStyle}/README.md`, strategy.setupInstructions(this.config));

    logger.success(`${this.config.apiStyle === 'graphql' ? 'GraphQL (Apollo)' : 'tRPC'} layer written`);
  }

  // ── Step 18: Write API docs ──────────────────────────────────────

  private writeApiDocs(): void {
    if (!this.config.hasApiDocs) {
      logger.step(18, TOTAL_STEPS, 'Skipping API docs (--api-docs none)');
      return;
    }
    logger.step(18, TOTAL_STEPS, `Writing API docs (${this.config.apiDocs})...`);
    const strategy = createApiDocsStrategy(this.config.apiDocs);
    if (!strategy) return;
    this.write('apps/api/src/docs/swagger-config.ts', strategy.docsConfig(this.config));
    this.write('apps/api/src/docs/setup.ts', strategy.docsSetup(this.config));
    logger.success('API docs written');
  }

  // ── Step 18: Write logging layer ─────────────────────────────────

  private writeLoggingLayer(): void {
    if (!this.config.hasLogging) {
      logger.step(19, TOTAL_STEPS, 'Skipping logging (--logging default)');
      return;
    }
    logger.step(19, TOTAL_STEPS, `Writing logging layer (${this.config.logging})...`);
    const strategy = createLoggingStrategy(this.config.logging);
    if (!strategy) return;
    this.write('packages/lib/src/logger/index.ts', strategy.index(this.config));
    this.write('packages/lib/src/logger/logger.ts', strategy.loggerSetup(this.config));
    logger.success('Logging layer written');
  }

  // ── Step 19: Write auth layer ────────────────────────────────────

  private writeAuthLayer(): void {
    if (!this.config.hasAuth) {
      logger.step(20, TOTAL_STEPS, 'Skipping auth layer (--auth none)');
      return;
    }
    logger.step(20, TOTAL_STEPS, `Writing ${this.config.auth} auth layer...`);
    const authStrategy = createAuthStrategy(this.config.auth);
    if (!authStrategy) return;
    if (this.config.auth === 'next-auth') {
      this.write('apps/web/app/api/auth/[...nextauth]/route.ts', authStrategy.apiRoute(this.config));
      this.write('apps/web/lib/auth.ts', authStrategy.authConfig(this.config));
      this.write('apps/web/middleware.ts', authStrategy.middleware(this.config));
      this.write('apps/web/types/next-auth.d.ts', authStrategy.types(this.config));
    } else {
      this.write('apps/web/app/api/auth/login/route.ts', authStrategy.apiRoute(this.config));
      this.write('apps/web/lib/auth.ts', authStrategy.authConfig(this.config));
      this.write('apps/web/middleware.ts', authStrategy.middleware(this.config));
      this.write('apps/web/types/auth.ts', authStrategy.types(this.config));
    }
    logger.success('Auth layer written');
  }

  // ── Step 20: Write Docker files ──────────────────────────────────

  private writeDockerFiles(): void {
    if (!this.config.hasDocker) {
      logger.step(21, TOTAL_STEPS, 'Skipping Docker files (--docker none)');
      return;
    }
    logger.step(21, TOTAL_STEPS, `Writing Docker files (${this.config.docker})...`);
    const strategy = createDockerStrategy(this.config.docker);
    if (!strategy) return;
    this.write('apps/web/Dockerfile', strategy.webDockerfile(this.config));
    this.write('apps/api/Dockerfile', strategy.apiDockerfile(this.config));
    this.write('docker-compose.prod.yml', strategy.dockerComposeProd(this.config));
    this.write('.dockerignore', strategy.dockerignore(this.config));
    const extraFiles = strategy.extraFiles(this.config);
    for (const [filePath, content] of Object.entries(extraFiles)) {
      this.write(filePath, content);
    }
    logger.success('Docker files written');
  }

  // ── Step 21: Write Storybook config ──────────────────────────────

  private writeStorybookConfig(): void {
    if (!this.config.storybook) {
      logger.step(22, TOTAL_STEPS, 'Skipping Storybook (--no-storybook)');
      return;
    }
    logger.step(22, TOTAL_STEPS, 'Writing Storybook config...');
    this.write('packages/ui/.storybook/main.ts', storybookTmpl.storybookMain(this.config));
    this.write('packages/ui/.storybook/preview.ts', storybookTmpl.storybookPreview(this.config));
    this.write('packages/ui/src/components/button.stories.tsx', storybookTmpl.buttonStories(this.config));
    this.write('packages/ui/src/components/card.stories.tsx', storybookTmpl.cardStories(this.config));
    this.write('packages/ui/src/components/input.stories.tsx', storybookTmpl.inputStories(this.config));
    logger.success('Storybook config written');
  }

  // ── Step 22: Write E2E tests ─────────────────────────────────────

  private writeE2eTests(): void {
    if (!this.config.hasE2e) {
      logger.step(23, TOTAL_STEPS, 'Skipping E2E tests (--e2e none)');
      return;
    }
    logger.step(23, TOTAL_STEPS, `Writing E2E tests (${this.config.e2e})...`);
    const strategy = createE2eStrategy(this.config.e2e);
    if (!strategy) return;
    if (this.config.e2e === 'playwright') {
      this.write('apps/web/playwright.config.ts', strategy.config(this.config));
      this.write('apps/web/e2e/example.spec.ts', strategy.exampleTest(this.config));
    } else {
      this.write('apps/web/cypress.config.ts', strategy.config(this.config));
      this.write('apps/web/cypress/e2e/example.cy.ts', strategy.exampleTest(this.config));
    }
    logger.success('E2E tests written');
  }

  // ── Step 23: Write AI skills ─────────────────────────────────────

  private writeSkills(): void {
    logger.step(24, TOTAL_STEPS, 'Writing AI agent skills...');
    this.write('.claude/settings.json', skills.claudeSettings(this.config));
    this.write('.claude/skills/component-design/SKILL.md', skills.componentDesignSkill(this.config));
    this.write('.claude/skills/page-design/SKILL.md', skills.pageDesignSkill(this.config));
    this.write('.claude/skills/api-feature/SKILL.md', skills.apiFeatureSkill(this.config));
    this.write('.claude/skills/monorepo-doctor/SKILL.md', skills.monrepoDoctorSkill());
    logger.success('AI skills written');
  }

  // ── Step 24: Install dependencies ────────────────────────────────

  private async installDependencies(): Promise<void> {
    logger.step(25, TOTAL_STEPS, `Installing dependencies (${this.config.packageManager})...`);
    try {
      execSync(this.config.installCommand, { cwd: this.rootPath, stdio: 'pipe', timeout: 120_000 });
      logger.success('Dependencies installed');
    } catch {
      logger.warn('Dependency installation failed — run manually after setup');
    }
  }

  // ── Step 25: Initialize git ──────────────────────────────────────

  private async initializeGit(): Promise<void> {
    if (!this.config.gitInit) {
      logger.step(26, TOTAL_STEPS, 'Skipping git init (--no-git)');
      return;
    }
    logger.step(26, TOTAL_STEPS, 'Initializing git repository...');
    try {
      execSync('git init', { cwd: this.rootPath, stdio: 'pipe' });
      execSync('git add .', { cwd: this.rootPath, stdio: 'pipe' });
      execSync(`git commit -m "Initial commit: ${this.config.pascalCase} monorepo"`, { cwd: this.rootPath, stdio: 'pipe' });
      logger.success('Git repository initialized with initial commit');
    } catch {
      logger.warn('Git initialization failed — run manually');
    }
  }

  // ── Step 26: Print summary ───────────────────────────────────────

  private printSummary(): void {
    logger.step(27, TOTAL_STEPS, 'Done!');
    logger.summary([
      `${this.config.pascalCase} monorepo created successfully!`,
      '',
      `  cd ${this.config.name}`,
      `  ${this.config.runCommand} dev`,
      '',
      `Frontend: http://localhost:3000`,
      `Backend:  http://localhost:3001/api`,
    ]);
  }

  // ── Helper: Write file to disk ───────────────────────────────────

  private write(relativePath: string, content: string): void {
    if (!content) return;
    const fullPath = path.join(this.rootPath, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
}
