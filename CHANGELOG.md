# Changelog

All notable changes to this project will be documented in this file.

## 2.2.0 (2026-04-12)

### Fully Adaptive Docker Templates

Docker output now adapts to **every** selected option:

- **Dockerfiles** — Package manager install commands (pnpm/npm/yarn/bun), Prisma generate + schema copy, dynamic workspace COPY lines based on enabled packages, health checks
- **docker-compose.prod.yml** — Correct DB service (postgres/mysql/mongodb) with health checks and volumes, Redis with REDIS_URL, all env vars wired (auth, email, storage, payments), proper `depends_on` chains
- **nginx.conf** — GraphQL `/graphql` and tRPC `/api/trpc` routing with WebSocket upgrade, `/api/docs` proxy, gzip compression, security headers
- **.dockerignore** — Package-manager-aware (ignores unused lock files)

### New Option

- **`--api-style`** (`rest` | `graphql` | `trpc`) — API protocol/style that layers on top of `--backend`
  - **GraphQL**: Apollo Server with code-first resolvers (NestJS) or schema-first (Express)
  - **tRPC**: Full type-safe stack — server router, NestJS/Express adapter, Next.js client hooks, provider, server caller, API route handler
  - **REST**: Default, unchanged behavior
  - All 6 backend + style combinations supported and tested

### Improvements

- 27-step generation pipeline (up from 26)
- 22 CLI options total

---

## 2.0.0 (2026-04-11)

10 new CLI options for production-ready features.

### New Options

- **`--docker`** (`full` | `minimal` | `none`) — Multi-stage Dockerfiles, docker-compose.prod.yml, nginx reverse proxy
- **`--i18n`** (`next-intl` | `none`) — Locale routing, messages, middleware, language switcher, RTL support
- **`--payments`** (`stripe` | `lemonsqueezy` | `paddle` | `none`) — Webhook handlers, checkout, subscription management, pricing page
- **`--email`** (`resend` | `nodemailer` | `sendgrid` | `none`) — Email client, send function, welcome + reset password templates
- **`--api-docs`** (`swagger` | `redoc` | `none`) — OpenAPI docs with Swagger UI or Redoc, adapts to NestJS/Express
- **`--storage`** (`s3` | `uploadthing` | `cloudinary` | `none`) — File upload/download service, presigned URLs, UploadThing file router
- **`--e2e`** (`playwright` | `cypress` | `none`) — E2E test config, example tests, CI workflow integration
- **`--storybook`** (boolean) — Storybook config for packages/ui/, stories for Button/Card/Input
- **`--cache`** (`redis` | `none`) — Redis client (ioredis), cache service with TTL, Docker Compose integration
- **`--logging`** (`pino` | `winston` | `default`) — Structured logging with Pino or Winston, logger factory

### Improvements

- **26-step generation pipeline** (up from 16)
- **164 doctor checks** with all options enabled (up from 108)
- **21 CLI options** total (11 original + 10 new)
- **4 new shared packages** — payments, email, storage, cache
- **34 new source files** in the CLI tool
- Config detection for all 10 new options

---

## 1.0.0 (2026-04-11)

Initial release.

### Features

- **16-step generation pipeline** — resolves versions, creates workspace, writes templates, installs deps, initializes git
- **Backend frameworks** — NestJS (modules, controllers, services, decorators) or Express (routes, services, middleware)
- **Styling options** — Tailwind CSS, CSS Modules, or Styled Components with framework-specific component templates
- **Database ORM** — Prisma (schema DSL, migrations, studio) or Drizzle (TypeScript schemas, drizzle-kit) with Postgres, MySQL, SQLite, or MongoDB support
- **Authentication** — NextAuth.js v5 with adapter integration or custom JWT with middleware protection
- **State management** — Zustand, Jotai, Redux Toolkit, or TanStack Query with framework-specific store/provider setup
- **Shared packages** — UI components (Button, Card, Input), hooks (useMediaQuery, useDebounce), types, utils, constants, Zod validators
- **Auto version resolution** — fetches latest compatible versions from npm registry with hardcoded fallbacks for offline use
- **Doctor command** — validates monorepo structure with 100+ checks, auto-detects project config, restores missing files with `--fix`
- **Workflow guides** — step-by-step development guides for components (A), pages (B), and API features (C)
- **AI agent skills** — 4 Claude Code skills (component-design, page-design, api-feature, monorepo-doctor) with pre-approved settings.json
- **GitHub community files** — CI workflow (Turborepo-aware), issue/PR templates, code of conduct, funding placeholder
- **11 license types** — MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, GPL-2.0, GPL-3.0, LGPL-2.1, MPL-2.0, ISC, Unlicense, proprietary
- **Package manager support** — pnpm (default), npm, yarn, or bun with adapted workspace configs
- **Turborepo integration** — optimized build/dev/lint/test pipelines with workspace caching
- **Strict TypeScript** — base, Next.js, and Node.js tsconfig presets with strict mode enabled
- **Production linting** — ESLint flat config with TypeScript plugin, consistent-type-imports, no-console
- **Programmatic API** — all exports available for library usage (ProjectConfig, Generator, Doctor, Workflow)
