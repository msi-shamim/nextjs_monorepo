# Contributing to @msishamim/create-next-monorepo

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
git clone https://github.com/msi-shamim/nextjs_monorepo.git
cd nextjs_monorepo
npm install
```

## Commands

```bash
npm run build        # Build with tsup
npm run dev          # Run CLI in dev mode (tsx)
npm test             # Run tests (vitest)
npm run test:watch   # Watch mode
```

## Code Style

- TypeScript strict mode — zero errors required
- Run `npx tsc --noEmit` before submitting
- Follow existing patterns (strategy pattern for multi-implementation options)

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/msi-shamim/nextjs_monorepo/issues) first
2. Create a new issue with the **Bug Report** template
3. Include: exact CLI command used, expected vs actual output, environment info

### Suggesting Features

1. Check [existing issues](https://github.com/msi-shamim/nextjs_monorepo/issues) for similar requests
2. Create a new issue with the **Feature Request** template
3. Describe the problem, proposed solution, and alternatives

### Submitting Code

1. Fork the repository
2. Create a feature branch from `main` (`git checkout -b feat/my-feature`)
3. Make your changes
4. Add or update tests as needed
5. Ensure all checks pass: `npx tsc --noEmit && npm test`
6. Commit with conventional messages (`feat:`, `fix:`, `docs:`, `chore:`)
7. Push and open a Pull Request

## Adding a New CLI Option

See the [Wiki Contributing page](https://github.com/msi-shamim/nextjs_monorepo/wiki/Contributing) for the step-by-step guide on adding new options, strategies, and templates.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add --monitoring option`
- `fix: resolve Docker compose env var issue`
- `docs: update wiki with new option`
- `test: add regression tests for bug #2`

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
