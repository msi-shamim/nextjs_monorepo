/**
 * CLI entry point — commander.js with subcommand routing.
 * Commands: create (default), doctor, workflow.
 * Mirrors flutter_monorepo's bin/flutter_monorepo.dart architecture.
 */

import { Command } from 'commander';
import * as path from 'node:path';
import { ProjectConfig } from './project-config.js';
import { Generator } from './generator.js';
import { Doctor } from './doctor.js';
import { Workflow } from './workflow.js';
import { logger } from './logger.js';

const VERSION = '2.0.0';

const program = new Command();

program
  .name('create-next-monorepo')
  .description('Generate production-ready Next.js + NestJS/Express monorepos with Turborepo')
  .version(VERSION);

// ── Create command (default — project name as argument) ───────────

program
  .argument('[name]', 'Project name (kebab-case, e.g. my-app)')
  .option('-b, --backend <framework>', 'Backend framework: nestjs, express', 'nestjs')
  .option('-s, --styling <approach>', 'Styling: tailwind, css-modules, styled-components', 'tailwind')
  .option('--orm <orm>', 'Database ORM: prisma, drizzle, none', 'prisma')
  .option('--db <database>', 'Database: postgres, mysql, sqlite, mongodb', 'postgres')
  .option('--auth <auth>', 'Auth: next-auth, custom, none', 'next-auth')
  .option('--state <state>', 'State: zustand, jotai, redux, tanstack-query, none', 'zustand')
  .option('--testing <framework>', 'Testing: vitest, jest', 'vitest')
  .option('--license <license>', 'License type', 'MIT')
  .option('--git', 'Initialize git repository (default: true)', true)
  .option('--no-git', 'Skip git initialization')
  .option('--github', 'Generate GitHub community files', false)
  .option('--package-manager <pm>', 'Package manager: pnpm, npm, yarn, bun', 'pnpm')
  .option('--docker <mode>', 'Docker: full, minimal, none', 'none')
  .option('--i18n <lib>', 'i18n: next-intl, none', 'none')
  .option('--payments <provider>', 'Payments: stripe, lemonsqueezy, paddle, none', 'none')
  .option('--email <provider>', 'Email: resend, nodemailer, sendgrid, none', 'none')
  .option('--api-docs <renderer>', 'API docs: swagger, redoc, none', 'none')
  .option('--storage <provider>', 'Storage: s3, uploadthing, cloudinary, none', 'none')
  .option('--e2e <framework>', 'E2E testing: playwright, cypress, none', 'none')
  .option('--storybook', 'Generate Storybook for UI package', false)
  .option('--cache <provider>', 'Cache: redis, none', 'none')
  .option('--logging <lib>', 'Logging: pino, winston, default', 'default')
  .action(async (name: string | undefined, options: Record<string, string | boolean>) => {
    // If no name and no subcommand matched, show help
    if (!name) {
      program.help();
      return;
    }

    // Validate project name
    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      logger.error('Project name must be kebab-case (e.g. my-app)');
      process.exit(1);
    }

    // Validate option values
    const validBackends = ['nestjs', 'express'];
    const validStyling = ['tailwind', 'css-modules', 'styled-components'];
    const validOrms = ['prisma', 'drizzle', 'none'];
    const validDbs = ['postgres', 'mysql', 'sqlite', 'mongodb'];
    const validAuths = ['next-auth', 'custom', 'none'];
    const validStates = ['zustand', 'jotai', 'redux', 'tanstack-query', 'none'];
    const validTesting = ['vitest', 'jest'];
    const validPms = ['pnpm', 'npm', 'yarn', 'bun'];

    const validations: Array<[string, string, string[]]> = [
      ['backend', options.backend as string, validBackends],
      ['styling', options.styling as string, validStyling],
      ['orm', options.orm as string, validOrms],
      ['db', options.db as string, validDbs],
      ['auth', options.auth as string, validAuths],
      ['state', options.state as string, validStates],
      ['testing', options.testing as string, validTesting],
      ['package-manager', options.packageManager as string, validPms],
      ['docker', options.docker as string, ['full', 'minimal', 'none']],
      ['i18n', options.i18n as string, ['next-intl', 'none']],
      ['payments', options.payments as string, ['stripe', 'lemonsqueezy', 'paddle', 'none']],
      ['email', options.email as string, ['resend', 'nodemailer', 'sendgrid', 'none']],
      ['api-docs', options.apiDocs as string, ['swagger', 'redoc', 'none']],
      ['storage', options.storage as string, ['s3', 'uploadthing', 'cloudinary', 'none']],
      ['e2e', options.e2e as string, ['playwright', 'cypress', 'none']],
      ['cache', options.cache as string, ['redis', 'none']],
      ['logging', options.logging as string, ['pino', 'winston', 'default']],
    ];

    for (const [flag, value, allowed] of validations) {
      if (!allowed.includes(value)) {
        logger.error(`Invalid --${flag} value "${value}". Allowed: ${allowed.join(', ')}`);
        process.exit(1);
      }
    }

    logger.banner(VERSION);

    const config = new ProjectConfig({
      name,
      backend: options.backend as ProjectConfig['backend'],
      styling: options.styling as ProjectConfig['styling'],
      orm: options.orm as ProjectConfig['orm'],
      db: options.db as ProjectConfig['db'],
      auth: options.auth as ProjectConfig['auth'],
      state: options.state as ProjectConfig['state'],
      testing: options.testing as ProjectConfig['testing'],
      license: options.license as ProjectConfig['license'],
      packageManager: options.packageManager as ProjectConfig['packageManager'],
      gitInit: options.git as boolean,
      githubFiles: options.github as boolean,
      docker: options.docker as ProjectConfig['docker'],
      i18n: options.i18n as ProjectConfig['i18n'],
      payments: options.payments as ProjectConfig['payments'],
      email: options.email as ProjectConfig['email'],
      apiDocs: options.apiDocs as ProjectConfig['apiDocs'],
      storage: options.storage as ProjectConfig['storage'],
      e2e: options.e2e as ProjectConfig['e2e'],
      storybook: options.storybook as boolean,
      cache: options.cache as ProjectConfig['cache'],
      logging: options.logging as ProjectConfig['logging'],
    });

    const rootPath = path.resolve(process.cwd(), name);
    const generator = new Generator(config, rootPath);

    try {
      await generator.run();
    } catch (error) {
      logger.error(`Generation failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// ── Doctor command ────────────────────────────────────────────────

program
  .command('doctor')
  .description('Validate monorepo structure integrity')
  .option('--fix', 'Auto-restore missing directories and files')
  .action(async (options: { fix?: boolean }) => {
    const rootPath = process.cwd();
    const doctor = new Doctor(rootPath);

    try {
      await doctor.run(options.fix ?? false);
    } catch (error) {
      logger.error(`Doctor failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// ── Workflow command ──────────────────────────────────────────────

program
  .command('workflow [flow]')
  .description('Development workflow guides (a: component, b: page, c: api feature)')
  .action((flow?: string) => {
    const rootPath = process.cwd();
    const workflow = new Workflow(rootPath);
    workflow.run(flow);
  });

program.parse();
