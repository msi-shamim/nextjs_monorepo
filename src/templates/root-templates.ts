/**
 * Root-level templates — package.json, turbo.json, pnpm-workspace.yaml,
 * .gitignore, .env.example, .prettierrc, docker-compose.yml, README, CONTRIBUTING.
 */

import type { ProjectConfig } from '../project-config.js';
import {
  backendDisplayName,
  stylingDisplayName,
  ormDisplayName,
  stateDisplayName,
  authDisplayName,
} from '../project-config.js';

/** Root package.json for the monorepo workspace */
export function rootPackageJson(config: ProjectConfig): string {
  const workspaces =
    config.packageManager !== 'pnpm'
      ? `\n  "workspaces": [\n    "apps/*",\n    "packages/*"\n  ],`
      : '';

  return `{
  "name": "${config.name}",
  "version": "1.0.0",
  "private": true,${workspaces}
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test",
    "format": "prettier --write \\"**/*.{ts,tsx,js,jsx,json,md}\\"",
    "format:check": "prettier --check \\"**/*.{ts,tsx,js,jsx,json,md}\\""
  },
  "devDependencies": {
    "prettier": "${config.versions['prettier'] ?? '^3.5.3'}",
    "turbo": "${config.versions['turbo'] ?? '^2.5.0'}",
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  },
  "packageManager": "${config.packageManager === 'pnpm' ? 'pnpm@10.8.0' : config.packageManager === 'yarn' ? 'yarn@4.9.1' : config.packageManager === 'bun' ? 'bun@1.2.12' : 'npm@10.9.2'}"
}
`;
}

/** Turborepo pipeline configuration */
export function turboJson(_config: ProjectConfig): string {
  return `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "format": {},
    "format:check": {}
  }
}
`;
}

/** pnpm workspace configuration */
export function pnpmWorkspaceYaml(): string {
  return `packages:
  - "apps/*"
  - "packages/*"
`;
}

/** Root .gitignore */
export function gitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
.next/
out/
build/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Turbo
.turbo/

# Testing
coverage/

# Misc
*.tsbuildinfo
`;
}

/** Environment variables example */
export function envExample(config: ProjectConfig): string {
  let content = `# ─── Application ───────────────────────────────────────────
NODE_ENV=development
PORT=3001

# ─── Frontend ─────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001
`;

  if (config.hasDatabase) {
    content += `
# ─── Database ─────────────────────────────────────────────
`;
    switch (config.db) {
      case 'postgres':
        content += `DATABASE_URL="postgresql://postgres:password@localhost:5432/${config.name}?schema=public"\n`;
        break;
      case 'mysql':
        content += `DATABASE_URL="mysql://root:password@localhost:3306/${config.name}"\n`;
        break;
      case 'sqlite':
        content += `DATABASE_URL="file:./dev.db"\n`;
        break;
      case 'mongodb':
        content += `DATABASE_URL="mongodb://localhost:27017/${config.name}"\n`;
        break;
    }
  }

  if (config.hasAuth) {
    content += `
# ─── Authentication ───────────────────────────────────────
`;
    if (config.auth === 'next-auth') {
      content += `AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"
# AUTH_GITHUB_ID=""
# AUTH_GITHUB_SECRET=""
# AUTH_GOOGLE_ID=""
# AUTH_GOOGLE_SECRET=""
`;
    } else {
      content += `JWT_SECRET="your-jwt-secret-here"
JWT_EXPIRES_IN="7d"
`;
    }
  }

  return content;
}

/** Prettier configuration */
export function prettierrc(): string {
  return `{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
`;
}

/** Docker Compose for database services */
export function dockerCompose(config: ProjectConfig): string {
  if (!config.hasDatabase) return '';

  let services = '';

  switch (config.db) {
    case 'postgres':
      services = `  postgres:
    image: postgres:17-alpine
    container_name: ${config.name}-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${config.name}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`;
      break;

    case 'mysql':
      services = `  mysql:
    image: mysql:8.4
    container_name: ${config.name}-mysql
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: ${config.name}
      MYSQL_ROOT_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:`;
      break;

    case 'mongodb':
      services = `  mongodb:
    image: mongo:8
    container_name: ${config.name}-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:`;
      break;

    case 'sqlite':
      return '';
  }

  return `services:
${services}
`;
}

/** README.md for the generated monorepo */
export function readmeMd(config: ProjectConfig): string {
  const year = new Date().getFullYear();

  let dbSection = '';
  if (config.hasDatabase && config.db !== 'sqlite') {
    dbSection = `
## Database

Start the database with Docker:

\`\`\`bash
docker compose up -d
\`\`\`
${config.orm === 'prisma' ? `
Run migrations:

\`\`\`bash
cd packages/database
npx prisma migrate dev
\`\`\`
` : `
Push schema changes:

\`\`\`bash
cd packages/database
npx drizzle-kit push
\`\`\`
`}`;
  }

  return `# ${config.pascalCase}

A production-ready monorepo built with **Next.js 15**, **${backendDisplayName[config.backend]}**, and **Turborepo**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) |
| Backend | ${backendDisplayName[config.backend]} |
| Styling | ${stylingDisplayName[config.styling]} |
| State | ${stateDisplayName[config.state]} |
| Auth | ${authDisplayName[config.auth]} |
| ORM | ${ormDisplayName[config.orm]} |
| Monorepo | Turborepo + ${config.packageManager} workspaces |

## Getting Started

\`\`\`bash
# Install dependencies
${config.installCommand}

# Start all apps in development
${config.runCommand} dev

# Build all apps
${config.runCommand} build

# Run tests
${config.runCommand} test

# Format code
${config.runCommand} format
\`\`\`
${dbSection}
## Project Structure

\`\`\`
${config.name}/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # ${backendDisplayName[config.backend]} backend
├── packages/
│   ├── ui/           # Shared React components
│   ├── lib/          # Shared utilities & types
│   ├── config/       # Shared ESLint/TS/Tailwind configs${config.hasDatabase ? '\n│   └── database/     # ' + ormDisplayName[config.orm] + ' ORM layer' : ''}
├── turbo.json        # Turborepo pipeline
└── package.json      # Workspace root
\`\`\`

## Apps

### Web (\`apps/web\`)
Next.js 15 application using the App Router, ${stylingDisplayName[config.styling]} for styling${config.hasState ? ', and ' + stateDisplayName[config.state] + ' for state management' : ''}.

### API (\`apps/api\`)
${backendDisplayName[config.backend]} REST API server${config.hasDatabase ? ' with ' + ormDisplayName[config.orm] + ' ORM' : ''}.

## Packages

### UI (\`packages/ui\`)
Shared React component library with reusable components and hooks.

### Lib (\`packages/lib\`)
Shared TypeScript types, utility functions, constants, and Zod validators.

### Config (\`packages/config\`)
Shared configuration for ESLint, TypeScript, and ${config.usesTailwind ? 'Tailwind CSS' : 'other tools'}.
${config.hasDatabase ? `
### Database (\`packages/database\`)
${ormDisplayName[config.orm]} ORM setup with schema definitions, migrations, and seed data.
` : ''}

## License

${config.license === 'proprietary' ? `Copyright ${year}. All rights reserved.` : `This project is licensed under the ${config.license} License — see the [LICENSE](LICENSE) file for details.`}
`;
}

/** CONTRIBUTING.md for the generated monorepo */
export function contributingMd(config: ProjectConfig): string {
  return `# Contributing to ${config.pascalCase}

Thank you for your interest in contributing!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: \`${config.installCommand}\`
3. Start development: \`${config.runCommand} dev\`

## Project Structure

This is a Turborepo monorepo. Changes to shared packages (\`packages/*\`) will be picked up by consuming apps (\`apps/*\`) automatically during development.

## Code Style

- Run \`${config.runCommand} format\` before committing
- Run \`${config.runCommand} lint\` to check for issues
- Run \`${config.runCommand} test\` to verify changes

## Pull Requests

1. Create a feature branch from \`main\`
2. Make your changes
3. Ensure all checks pass (lint, test, build)
4. Submit a pull request with a clear description

## Commit Messages

Use conventional commits: \`feat:\`, \`fix:\`, \`docs:\`, \`chore:\`, \`refactor:\`, \`test:\`
`;
}
