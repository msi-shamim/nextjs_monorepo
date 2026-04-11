/**
 * Doctor — Validates monorepo structure integrity and auto-fixes missing items.
 * Mirrors flutter_monorepo's Doctor class.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ProjectConfig } from './project-config.js';
import { detectProjectConfig } from './config-detector.js';
import { getExpectedDirectories, getExpectedFiles } from './expected-paths.js';
import { logger } from './logger.js';

// Template imports for restorable files
import * as root from './templates/root-templates.js';
import * as configTmpl from './templates/config-templates.js';
import * as lib from './templates/lib-templates.js';
import * as ui from './templates/ui-templates.js';
import * as licenseTmpl from './templates/license-templates.js';
import * as skillsTmpl from './templates/skills-templates.js';
import * as githubTmpl from './templates/github-templates.js';

export class Doctor {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  /** Run the doctor validation */
  async run(fix: boolean): Promise<void> {
    logger.header('Checking monorepo structure...');
    logger.newline();

    // 1. Detect config
    const config = detectProjectConfig(this.rootPath);
    if (!config) {
      logger.error('Not a create-next-monorepo project (missing package.json or turbo.json)');
      return;
    }

    logger.info(`Detected project: ${config.pascalCase}`);
    logger.info(`Backend: ${config.backend} | Styling: ${config.styling} | ORM: ${config.orm}`);
    logger.info(`Auth: ${config.auth} | State: ${config.state} | PM: ${config.packageManager}`);
    logger.newline();

    // 2. Build restorable files map
    const restorableFiles = this.buildRestorableFiles(config);

    // 3. Check directories
    const expectedDirs = getExpectedDirectories(config);
    let dirsPassed = 0;
    let dirsMissing = 0;

    logger.header('Directories');
    for (const dir of expectedDirs) {
      const fullPath = path.join(this.rootPath, dir);
      if (fs.existsSync(fullPath)) {
        logger.success(dir);
        dirsPassed++;
      } else {
        logger.error(dir);
        dirsMissing++;
        if (fix) {
          fs.mkdirSync(fullPath, { recursive: true });
          logger.dim('  Created directory');
        }
      }
    }

    // 4. Check files
    const expectedFiles = getExpectedFiles(config);
    let filesPassed = 0;
    let filesMissing = 0;

    logger.newline();
    logger.header('Files');
    for (const file of expectedFiles) {
      const fullPath = path.join(this.rootPath, file);
      if (fs.existsSync(fullPath)) {
        logger.success(file);
        filesPassed++;
      } else {
        logger.error(file);
        filesMissing++;
        if (fix) {
          const dir = path.dirname(fullPath);
          fs.mkdirSync(dir, { recursive: true });

          if (restorableFiles[file]) {
            fs.writeFileSync(fullPath, restorableFiles[file], 'utf-8');
            logger.dim('  Restored from template');
          } else {
            fs.writeFileSync(fullPath, `// TODO: Populate this file\n`, 'utf-8');
            logger.dim('  Created empty (populate manually)');
          }
        }
      }
    }

    // 5. Summary
    const totalPassed = dirsPassed + filesPassed;
    const totalMissing = dirsMissing + filesMissing;
    const totalChecks = totalPassed + totalMissing;

    logger.newline();
    if (totalMissing === 0) {
      logger.summary([
        `All ${totalChecks} checks passed!`,
        '',
        `${dirsPassed} directories | ${filesPassed} files`,
      ]);
    } else {
      logger.summary([
        `${totalPassed} passed, ${totalMissing} missing (${totalChecks} total)`,
        '',
        `${dirsPassed}/${expectedDirs.length} directories | ${filesPassed}/${expectedFiles.length} files`,
        '',
        fix
          ? 'Missing items have been restored.'
          : 'Run with --fix to auto-restore missing items.',
      ]);
    }
  }

  /** Build the restorable files map using templates */
  private buildRestorableFiles(config: ProjectConfig): Record<string, string> {
    const files: Record<string, string> = {
      // Root files
      'README.md': root.readmeMd(config),
      'LICENSE': licenseTmpl.licenseText(config),
      'CONTRIBUTING.md': root.contributingMd(config),
      '.gitignore': root.gitignore(),
      '.prettierrc': root.prettierrc(),
      '.env.example': root.envExample(config),
      'turbo.json': root.turboJson(config),

      // Config package
      'packages/config/package.json': configTmpl.configPackageJson(config),
      'packages/config/eslint/base.js': configTmpl.eslintBase(config),
      'packages/config/typescript/base.json': configTmpl.tsConfigBase(),
      'packages/config/typescript/nextjs.json': configTmpl.tsConfigNextjs(),
      'packages/config/typescript/node.json': configTmpl.tsConfigNode(),

      // Lib package (framework-agnostic)
      'packages/lib/src/types/index.ts': lib.libTypes(),
      'packages/lib/src/utils/index.ts': lib.libUtils(),
      'packages/lib/src/constants/index.ts': lib.libConstants(),
      'packages/lib/src/validators/index.ts': lib.libValidators(),
      'packages/lib/src/index.ts': lib.libIndex(),

      // UI hooks (framework-agnostic)
      'packages/ui/src/hooks/use-media-query.ts': ui.uiUseMediaQuery(),
      'packages/ui/src/hooks/use-debounce.ts': ui.uiUseDebounce(),
      'packages/ui/src/hooks/index.ts': ui.uiHooksIndex(),
      'packages/ui/src/index.ts': ui.uiIndex(),
      'packages/ui/src/components/index.ts': ui.uiComponentsIndex(),
    };

    // Tailwind config
    if (config.usesTailwind) {
      const tailwindContent = configTmpl.tailwindBase(config);
      if (tailwindContent) {
        files['packages/config/tailwind/base.js'] = tailwindContent;
      }
    }

    // CSS module stylesheets
    if (config.styling === 'css-modules') {
      files['packages/ui/src/components/button.module.css'] = ui.uiButtonCss();
      files['packages/ui/src/components/card.module.css'] = ui.uiCardCss();
      files['packages/ui/src/components/input.module.css'] = ui.uiInputCss();
    }

    // AI Skills (always restorable)
    files['.claude/settings.json'] = skillsTmpl.claudeSettings(config);
    files['.claude/skills/component-design/SKILL.md'] = skillsTmpl.componentDesignSkill(config);
    files['.claude/skills/page-design/SKILL.md'] = skillsTmpl.pageDesignSkill(config);
    files['.claude/skills/api-feature/SKILL.md'] = skillsTmpl.apiFeatureSkill(config);
    files['.claude/skills/monorepo-doctor/SKILL.md'] = skillsTmpl.monrepoDoctorSkill();

    // GitHub files (only if .github/ exists)
    if (config.githubFiles) {
      files['CODE_OF_CONDUCT.md'] = githubTmpl.codeOfConduct();
      files['.github/FUNDING.yml'] = githubTmpl.fundingYml();
      files['.github/ISSUE_TEMPLATE/bug_report.md'] = githubTmpl.bugReport();
      files['.github/ISSUE_TEMPLATE/feature_request.md'] = githubTmpl.featureRequest();
      files['.github/pull_request_template.md'] = githubTmpl.pullRequestTemplate();
      files['.github/workflows/ci.yml'] = githubTmpl.ciWorkflow(config);
    }

    return files;
  }
}
