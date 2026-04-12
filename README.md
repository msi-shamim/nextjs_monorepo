# @msishamim/create-next-monorepo

Generate **production-ready Next.js + NestJS/Express monorepos** with Turborepo in one command.

[![npm version](https://img.shields.io/npm/v/@msishamim/create-next-monorepo)](https://www.npmjs.com/package/@msishamim/create-next-monorepo)
[![license](https://img.shields.io/npm/l/@msishamim/create-next-monorepo)](LICENSE)
[![node](https://img.shields.io/node/v/@msishamim/create-next-monorepo)](https://nodejs.org)

---

## Features

- **Next.js 15** with App Router — pages, layouts, loading/error states
- **Backend choice** — NestJS (modules, controllers, services) or Express (routes, services)
- **API style** — REST (default), GraphQL (Apollo Server), or tRPC (end-to-end type-safe)
- **Styling choice** — Tailwind CSS, CSS Modules, or Styled Components
- **Database ORM** — Prisma or Drizzle with schema, client, seed, and migrations
- **Authentication** — NextAuth.js v5 or custom JWT with middleware
- **State management** — Zustand, Jotai, Redux Toolkit, or TanStack Query
- **Turborepo + pnpm** — optimized build pipelines with workspace caching
- **Shared packages** — UI components, TypeScript types, Zod validators, utility functions
- **Auto version resolution** — fetches latest versions from npm registry at generation time
- **Doctor command** — validate structure integrity with 100+ checks and auto-fix
- **Workflow guides** — step-by-step dev guides for components, pages, and API features
- **AI agent skills** — Claude Code skills + pre-approved settings for every project
- **GitHub files** — CI workflow, issue/PR templates, code of conduct (optional)
- **Docker** — Fully adaptive Dockerfiles, docker-compose.prod.yml with correct DB/Redis/nginx, health checks
- **11 license types** — MIT, Apache-2.0, GPL, BSD, ISC, Unlicense, proprietary, and more
- **Production linting** — strict TypeScript, ESLint flat config, Prettier

## Quick Start

```bash
npx @msishamim/create-next-monorepo my-app
cd my-app
pnpm dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:3001/api`.

## Installation

```bash
# Run directly with npx (recommended)
npx @msishamim/create-next-monorepo my-app

# Or install globally
npm install -g @msishamim/create-next-monorepo
create-next-monorepo my-app
```

## Usage

### Basic (all defaults)

```bash
npx @msishamim/create-next-monorepo my-app
```

Creates a monorepo with NestJS, Tailwind, Prisma + Postgres, NextAuth, Zustand, and Vitest.

### Custom options

```bash
npx @msishamim/create-next-monorepo my-app \
  --backend express \
  --api-style graphql \
  --styling css-modules \
  --orm drizzle \
  --db mysql \
  --auth custom \
  --state redux \
  --testing jest \
  --license Apache-2.0 \
  --github
```

### Minimal (no database, no auth, no state)

```bash
npx @msishamim/create-next-monorepo my-app --orm none --auth none --state none
```

## Options

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--backend, -b` | `nestjs`, `express` | `nestjs` | Backend framework |
| `--api-style` | `rest`, `graphql`, `trpc` | `rest` | API style (layers on top of backend) |
| `--styling, -s` | `tailwind`, `css-modules`, `styled-components` | `tailwind` | Styling approach |
| `--orm` | `prisma`, `drizzle`, `none` | `prisma` | Database ORM |
| `--db` | `postgres`, `mysql`, `sqlite`, `mongodb` | `postgres` | Database type (when ORM is set) |
| `--auth` | `next-auth`, `custom`, `none` | `next-auth` | Authentication strategy |
| `--state` | `zustand`, `jotai`, `redux`, `tanstack-query`, `none` | `zustand` | State management |
| `--testing` | `vitest`, `jest` | `vitest` | Testing framework |
| `--license` | `MIT`, `Apache-2.0`, `GPL-3.0`, `BSD-3-Clause`, ... | `MIT` | License type (11 options) |
| `--git / --no-git` | boolean | `true` | Initialize git with first commit |
| `--github` | boolean | `false` | Generate GitHub community files |
| `--package-manager` | `pnpm`, `npm`, `yarn`, `bun` | `pnpm` | Package manager |

## Commands

### Create (default)

```bash
create-next-monorepo <name> [options]
```

### Doctor

Validate monorepo structure integrity (100+ checks):

```bash
create-next-monorepo doctor          # Report only
create-next-monorepo doctor --fix    # Auto-restore missing files
```

### Workflow

Step-by-step development guides:

```bash
create-next-monorepo workflow        # Overview
create-next-monorepo workflow a      # Component Design
create-next-monorepo workflow b      # Page/Route Design
create-next-monorepo workflow c      # API Feature Design
```

## Generated Structure

```
my-app/
├── apps/
│   ├── web/                          # Next.js 15 (App Router)
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── globals.css           # Global styles
│   │   │   ├── not-found.tsx         # 404 page
│   │   │   ├── error.tsx             # Error boundary
│   │   │   └── loading.tsx           # Loading state
│   │   ├── lib/                      # Auth config, state stores
│   │   ├── components/               # App-specific components
│   │   ├── hooks/                    # App-specific hooks
│   │   ├── public/                   # Static assets
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # NestJS or Express
│       ├── src/
│       │   ├── main.ts               # Server entry
│       │   ├── app.module.ts         # NestJS module (or app.ts for Express)
│       │   ├── app.controller.ts     # Health + info endpoints
│       │   ├── app.service.ts        # App service
│       │   └── common/
│       │       ├── filters/          # Exception/error handlers
│       │       ├── guards/           # Auth guards
│       │       ├── interceptors/     # Logging interceptors
│       │       └── pipes/            # Zod validation pipes
│       ├── test/
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── ui/                           # Shared React components
│   │   └── src/
│   │       ├── components/           # Button, Card, Input
│   │       └── hooks/                # useMediaQuery, useDebounce
│   │
│   ├── lib/                          # Shared utilities & types
│   │   └── src/
│   │       ├── types/                # TypeScript interfaces
│   │       ├── utils/                # Utility functions
│   │       ├── constants/            # HTTP status codes, patterns
│   │       └── validators/           # Zod schemas
│   │
│   ├── config/                       # Shared configurations
│   │   ├── eslint/                   # ESLint flat config
│   │   ├── typescript/               # Base, Next.js, Node tsconfigs
│   │   └── tailwind/                 # Tailwind base config
│   │
│   └── database/                     # Prisma or Drizzle (optional)
│       ├── src/
│       │   ├── schema/               # Database schema
│       │   ├── client.ts             # DB client singleton
│       │   └── seed.ts               # Seed script
│       └── prisma/                   # Prisma schema (if Prisma)
│
├── .claude/                          # AI agent configuration
│   ├── settings.json                 # Pre-approved Claude Code tools
│   └── skills/                       # 4 development skills
│
├── turbo.json                        # Turborepo pipeline
├── package.json                      # Workspace root
├── pnpm-workspace.yaml               # pnpm workspaces
├── .env.example                      # Environment variables template
├── docker-compose.yml                # Database service (optional)
├── README.md                         # Project documentation
├── LICENSE                           # License file
└── CONTRIBUTING.md                   # Contribution guidelines
```

## Tech Stack Options

### Backend

| Feature | NestJS | Express |
|---------|--------|---------|
| Architecture | Modules + Controllers + Services | Routes + Services |
| DI | Built-in (decorators) | Manual |
| Validation | Pipes (Zod integration) | Middleware (Zod integration) |
| Best for | Large apps, enterprise | Lightweight APIs, microservices |

### API Style

| Feature | REST | GraphQL (Apollo) | tRPC |
|---------|------|-----------------|------|
| Protocol | HTTP methods | Single endpoint | RPC over HTTP |
| Schema | OpenAPI (optional) | GraphQL SDL | TypeScript types |
| Client | fetch / axios | Apollo Client | Type-safe hooks |
| Best for | Standard APIs | Complex data graphs | Full-stack TypeScript |

### Styling

| Feature | Tailwind CSS | CSS Modules | Styled Components |
|---------|-------------|-------------|-------------------|
| Approach | Utility-first | Scoped CSS files | CSS-in-JS |
| Bundle | Purged at build | Scoped at build | Runtime |
| DX | Fast prototyping | Traditional CSS | Component-scoped |

### State Management

| Feature | Zustand | Jotai | Redux Toolkit | TanStack Query |
|---------|---------|-------|---------------|----------------|
| Pattern | Stores | Atoms | Slices | Query hooks |
| Provider | None needed | None needed | Required | Required |
| Best for | General state | Fine-grained | Complex state | Server state |

### ORM

| Feature | Prisma | Drizzle |
|---------|--------|---------|
| Schema | `.prisma` DSL | TypeScript |
| Migrations | Built-in CLI | drizzle-kit |
| Type safety | Generated types | Inferred types |
| Best for | Rapid development | SQL control |

## AI Agent Skills

Every generated project includes Claude Code skills in `.claude/skills/`:

| Skill | Trigger | Description |
|-------|---------|-------------|
| Component Design | "Build a component" | Create shared UI components in packages/ui/ |
| Page Design | "Build a page" | Create Next.js pages with state + API integration |
| API Feature | "Add an API endpoint" | Create backend endpoints with validation + DB |
| Monorepo Doctor | "Check structure" | Validate and fix monorepo integrity |

## Programmatic Usage

```typescript
import { ProjectConfig, Generator } from '@msishamim/create-next-monorepo';

const config = new ProjectConfig({
  name: 'my-app',
  backend: 'nestjs',
  styling: 'tailwind',
  orm: 'prisma',
  db: 'postgres',
  auth: 'next-auth',
  state: 'zustand',
  testing: 'vitest',
  license: 'MIT',
  packageManager: 'pnpm',
  gitInit: true,
  githubFiles: false,
});

const generator = new Generator(config, '/path/to/output/my-app');
await generator.run();
```

See [USAGE.md](USAGE.md) for advanced examples and option combinations.

## Requirements

- **Node.js** >= 18
- **pnpm** >= 9 (or npm/yarn/bun)
- **Git** (optional, for `--git` flag)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**MSI Shamim**

- GitHub: [@msi-shamim](https://github.com/msi-shamim)
- Email: im.msishamim@gmail.com
