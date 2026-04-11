import { describe, it, expect } from 'vitest';
import { ProjectConfig } from '../src/project-config.js';

describe('ProjectConfig', () => {
  it('uses correct defaults', () => {
    const config = new ProjectConfig({ name: 'my-app' });

    expect(config.name).toBe('my-app');
    expect(config.backend).toBe('nestjs');
    expect(config.styling).toBe('tailwind');
    expect(config.orm).toBe('prisma');
    expect(config.db).toBe('postgres');
    expect(config.auth).toBe('next-auth');
    expect(config.state).toBe('zustand');
    expect(config.testing).toBe('vitest');
    expect(config.license).toBe('MIT');
    expect(config.packageManager).toBe('pnpm');
    expect(config.gitInit).toBe(true);
    expect(config.githubFiles).toBe(false);
  });

  it('derives PascalCase from kebab-case', () => {
    const config = new ProjectConfig({ name: 'my-awesome-app' });
    expect(config.pascalCase).toBe('MyAwesomeApp');
  });

  it('derives camelCase from kebab-case', () => {
    const config = new ProjectConfig({ name: 'my-awesome-app' });
    expect(config.camelCase).toBe('myAwesomeApp');
  });

  it('derives SCREAMING_SNAKE_CASE', () => {
    const config = new ProjectConfig({ name: 'my-app' });
    expect(config.screamingSnakeCase).toBe('MY_APP');
  });

  it('handles single-word names', () => {
    const config = new ProjectConfig({ name: 'dashboard' });
    expect(config.pascalCase).toBe('Dashboard');
    expect(config.camelCase).toBe('dashboard');
  });

  it('hasDatabase is true for prisma', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'prisma' });
    expect(config.hasDatabase).toBe(true);
  });

  it('hasDatabase is true for drizzle', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'drizzle' });
    expect(config.hasDatabase).toBe(true);
  });

  it('hasDatabase is false for none', () => {
    const config = new ProjectConfig({ name: 'test', orm: 'none' });
    expect(config.hasDatabase).toBe(false);
  });

  it('hasAuth is true for next-auth', () => {
    const config = new ProjectConfig({ name: 'test', auth: 'next-auth' });
    expect(config.hasAuth).toBe(true);
  });

  it('hasAuth is false for none', () => {
    const config = new ProjectConfig({ name: 'test', auth: 'none' });
    expect(config.hasAuth).toBe(false);
  });

  it('hasState is true for zustand', () => {
    const config = new ProjectConfig({ name: 'test', state: 'zustand' });
    expect(config.hasState).toBe(true);
  });

  it('hasState is false for none', () => {
    const config = new ProjectConfig({ name: 'test', state: 'none' });
    expect(config.hasState).toBe(false);
  });

  it('usesTailwind is true for tailwind styling', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'tailwind' });
    expect(config.usesTailwind).toBe(true);
  });

  it('usesTailwind is false for css-modules', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'css-modules' });
    expect(config.usesTailwind).toBe(false);
  });

  it('returns correct install command for each package manager', () => {
    expect(new ProjectConfig({ name: 't', packageManager: 'pnpm' }).installCommand).toBe('pnpm install');
    expect(new ProjectConfig({ name: 't', packageManager: 'npm' }).installCommand).toBe('npm install');
    expect(new ProjectConfig({ name: 't', packageManager: 'yarn' }).installCommand).toBe('yarn install');
    expect(new ProjectConfig({ name: 't', packageManager: 'bun' }).installCommand).toBe('bun install');
  });

  it('returns correct run command for each package manager', () => {
    expect(new ProjectConfig({ name: 't', packageManager: 'pnpm' }).runCommand).toBe('pnpm');
    expect(new ProjectConfig({ name: 't', packageManager: 'npm' }).runCommand).toBe('npm run');
    expect(new ProjectConfig({ name: 't', packageManager: 'yarn' }).runCommand).toBe('yarn');
    expect(new ProjectConfig({ name: 't', packageManager: 'bun' }).runCommand).toBe('bun run');
  });

  describe('requiredPackages', () => {
    it('includes core packages for all configs', () => {
      const config = new ProjectConfig({ name: 'test' });
      const packages = config.requiredPackages;

      expect(packages).toContain('next');
      expect(packages).toContain('react');
      expect(packages).toContain('react-dom');
      expect(packages).toContain('typescript');
      expect(packages).toContain('turbo');
      expect(packages).toContain('zod');
    });

    it('includes NestJS deps for nestjs backend', () => {
      const config = new ProjectConfig({ name: 'test', backend: 'nestjs' });
      expect(config.requiredPackages).toContain('@nestjs/core');
      expect(config.requiredPackages).toContain('@nestjs/common');
    });

    it('includes Express deps for express backend', () => {
      const config = new ProjectConfig({ name: 'test', backend: 'express' });
      expect(config.requiredPackages).toContain('express');
      expect(config.requiredPackages).toContain('@types/express');
    });

    it('includes Tailwind deps for tailwind styling', () => {
      const config = new ProjectConfig({ name: 'test', styling: 'tailwind' });
      expect(config.requiredPackages).toContain('tailwindcss');
    });

    it('includes styled-components for styled-components styling', () => {
      const config = new ProjectConfig({ name: 'test', styling: 'styled-components' });
      expect(config.requiredPackages).toContain('styled-components');
    });

    it('includes Prisma deps for prisma orm', () => {
      const config = new ProjectConfig({ name: 'test', orm: 'prisma' });
      expect(config.requiredPackages).toContain('prisma');
      expect(config.requiredPackages).toContain('@prisma/client');
    });

    it('includes Drizzle deps for drizzle orm', () => {
      const config = new ProjectConfig({ name: 'test', orm: 'drizzle' });
      expect(config.requiredPackages).toContain('drizzle-orm');
      expect(config.requiredPackages).toContain('drizzle-kit');
    });

    it('includes auth deps for next-auth', () => {
      const config = new ProjectConfig({ name: 'test', auth: 'next-auth' });
      expect(config.requiredPackages).toContain('next-auth');
    });

    it('includes prisma adapter when auth is next-auth and orm is prisma', () => {
      const config = new ProjectConfig({ name: 'test', auth: 'next-auth', orm: 'prisma' });
      expect(config.requiredPackages).toContain('@auth/prisma-adapter');
    });

    it('includes JWT deps for custom auth', () => {
      const config = new ProjectConfig({ name: 'test', auth: 'custom' });
      expect(config.requiredPackages).toContain('jsonwebtoken');
      expect(config.requiredPackages).toContain('bcryptjs');
    });

    it('includes zustand for zustand state', () => {
      const config = new ProjectConfig({ name: 'test', state: 'zustand' });
      expect(config.requiredPackages).toContain('zustand');
    });

    it('includes redux deps for redux state', () => {
      const config = new ProjectConfig({ name: 'test', state: 'redux' });
      expect(config.requiredPackages).toContain('@reduxjs/toolkit');
      expect(config.requiredPackages).toContain('react-redux');
    });

    it('includes tanstack-query for tanstack-query state', () => {
      const config = new ProjectConfig({ name: 'test', state: 'tanstack-query' });
      expect(config.requiredPackages).toContain('@tanstack/react-query');
    });

    it('includes vitest for vitest testing', () => {
      const config = new ProjectConfig({ name: 'test', testing: 'vitest' });
      expect(config.requiredPackages).toContain('vitest');
    });

    it('includes jest for jest testing', () => {
      const config = new ProjectConfig({ name: 'test', testing: 'jest' });
      expect(config.requiredPackages).toContain('jest');
    });
  });
});
