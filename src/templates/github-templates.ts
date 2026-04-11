/**
 * GitHub community templates — CI workflow, issue/PR templates,
 * code of conduct, and funding configuration.
 */

import type { ProjectConfig } from '../project-config.js';

/** CODE_OF_CONDUCT.md — Contributor Covenant v2.1 */
export function codeOfConduct(): string {
  return `# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior:

* The use of sexualized language or imagery, and sexual attention or advances
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information without explicit permission
* Other conduct which could reasonably be considered inappropriate

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the community leaders responsible for enforcement. All complaints
will be reviewed and investigated promptly and fairly.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org),
version 2.1, available at
[https://www.contributor-covenant.org/version/2/1/code_of_conduct.html](https://www.contributor-covenant.org/version/2/1/code_of_conduct.html).
`;
}

/** .github/FUNDING.yml — sponsorship placeholder */
export function fundingYml(): string {
  return `# These are supported funding model platforms
# Uncomment and fill in the ones that apply to your project

# github: [your-username]
# patreon: # Replace with a single Patreon username
# open_collective: # Replace with a single Open Collective username
# ko_fi: # Replace with a single Ko-fi username
# custom: ["https://example.com/donate"]
`;
}

/** .github/ISSUE_TEMPLATE/bug_report.md */
export function bugReport(): string {
  return `---
name: Bug Report
about: Create a report to help us improve
title: "[Bug]: "
labels: bug
assignees: ""
---

## Describe the Bug
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
A clear and concise description of what actually happened.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- **OS:** [e.g. macOS 15, Windows 11, Ubuntu 24.04]
- **Node.js:** [e.g. 20.x, 22.x]
- **Browser:** [e.g. Chrome 130, Safari 18]
- **Package Manager:** [e.g. pnpm 10.x]

## Additional Context
Add any other context about the problem here.
`;
}

/** .github/ISSUE_TEMPLATE/feature_request.md */
export function featureRequest(): string {
  return `---
name: Feature Request
about: Suggest an idea for this project
title: "[Feature]: "
labels: enhancement
assignees: ""
---

## Problem Statement
A clear and concise description of what the problem is.
Ex. I'm always frustrated when...

## Proposed Solution
A clear and concise description of what you want to happen.

## Alternatives Considered
A clear and concise description of any alternative solutions or features you've considered.

## Additional Context
Add any other context, mockups, or screenshots about the feature request here.
`;
}

/** .github/pull_request_template.md */
export function pullRequestTemplate(): string {
  return `## Summary

<!-- Briefly describe what this PR does -->

## Changes

- [ ] Change 1
- [ ] Change 2

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactor (code change that neither fixes a bug nor adds a feature)
- [ ] Documentation (changes to documentation only)

## Testing

- [ ] Tests added for new functionality
- [ ] All existing tests pass
- [ ] Linting passes
- [ ] Manual testing performed

## Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Documentation updated (if applicable)
- [ ] No new warnings introduced
- [ ] Changes respect package boundaries (shared code in packages/, app code in apps/)
`;
}

/** .github/workflows/ci.yml — Turborepo-aware GitHub Actions CI */
export function ciWorkflow(config: ProjectConfig): string {
  let setupPm = '';
  let installCmd = '';

  switch (config.packageManager) {
    case 'pnpm':
      setupPm = `
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10`;
      installCmd = 'pnpm install --frozen-lockfile';
      break;
    case 'yarn':
      setupPm = '';
      installCmd = 'yarn install --frozen-lockfile';
      break;
    case 'bun':
      setupPm = `
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2`;
      installCmd = 'bun install --frozen-lockfile';
      break;
    default:
      setupPm = '';
      installCmd = 'npm ci';
      break;
  }

  return `name: CI

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  ci:
    name: Lint, Type-check & Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
${setupPm}
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          ${config.packageManager === 'pnpm' ? "cache: 'pnpm'" : config.packageManager === 'yarn' ? "cache: 'yarn'" : config.packageManager === 'npm' ? "cache: 'npm'" : ''}

      - name: Install dependencies
        run: ${installCmd}

      - name: Lint
        run: ${config.runCommand} lint

      - name: Build
        run: ${config.runCommand} build
`;
}
