/**
 * Regression tests for GitHub Issue #1:
 * 3 bugs in generated project output.
 */

import { describe, it, expect } from 'vitest';
import { ProjectConfig } from '../src/project-config.js';
import { configPackageJson } from '../src/templates/config-templates.js';
import { rootPackageJson } from '../src/templates/root-templates.js';
import { libIndex } from '../src/templates/lib-templates.js';
import { uiIndex, uiComponentsIndex, uiHooksIndex } from '../src/templates/ui-templates.js';
import { cacheIndex } from '../src/templates/cache-templates.js';

describe('Bug 1: config package.json must be valid JSON', () => {
  it('parses as valid JSON when tailwind is enabled', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'tailwind' });
    const output = configPackageJson(config);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('parses as valid JSON when tailwind is disabled', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'css-modules' });
    const output = configPackageJson(config);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes tailwind export when enabled', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'tailwind' });
    const parsed = JSON.parse(configPackageJson(config));
    expect(parsed.exports['./tailwind']).toBe('./tailwind/base.js');
  });

  it('excludes tailwind export when disabled', () => {
    const config = new ProjectConfig({ name: 'test', styling: 'css-modules' });
    const parsed = JSON.parse(configPackageJson(config));
    expect(parsed.exports['./tailwind']).toBeUndefined();
  });
});

describe('Bug 2: template output must NOT have .js extensions in imports', () => {
  it('libIndex has no .js in exports', () => {
    const output = libIndex();
    expect(output).not.toMatch(/from '\.\/[^']*\.js'/);
  });

  it('uiIndex has no .js in exports', () => {
    const output = uiIndex();
    expect(output).not.toMatch(/from '\.\/[^']*\.js'/);
  });

  it('uiComponentsIndex has no .js in exports', () => {
    const output = uiComponentsIndex();
    expect(output).not.toMatch(/from '\.\/[^']*\.js'/);
  });

  it('uiHooksIndex has no .js in exports', () => {
    const output = uiHooksIndex();
    expect(output).not.toMatch(/from '\.\/[^']*\.js'/);
  });

  it('cacheIndex has no .js in exports', () => {
    const output = cacheIndex();
    expect(output).not.toMatch(/from '\.\/[^']*\.js'/);
  });
});

describe('Bug 3: root package.json scripts must use turbo, not recursive pnpm', () => {
  it('uses turbo for build/dev/lint/test (pnpm)', () => {
    const config = new ProjectConfig({ name: 'test', packageManager: 'pnpm' });
    const output = rootPackageJson(config);
    const parsed = JSON.parse(output);
    expect(parsed.scripts.build).toBe('turbo build');
    expect(parsed.scripts.dev).toBe('turbo dev');
    expect(parsed.scripts.lint).toBe('turbo lint');
    expect(parsed.scripts.test).toBe('turbo test');
  });

  it('uses turbo for build/dev/lint/test (npm)', () => {
    const config = new ProjectConfig({ name: 'test', packageManager: 'npm' });
    const parsed = JSON.parse(rootPackageJson(config));
    expect(parsed.scripts.build).toBe('turbo build');
    expect(parsed.scripts.dev).toBe('turbo dev');
  });

  it('does NOT contain recursive pnpm/npm calls', () => {
    const config = new ProjectConfig({ name: 'test', packageManager: 'pnpm' });
    const output = rootPackageJson(config);
    expect(output).not.toContain('"pnpm build"');
    expect(output).not.toContain('"pnpm dev"');
    expect(output).not.toContain('"pnpm lint"');
    expect(output).not.toContain('"pnpm test"');
  });
});
