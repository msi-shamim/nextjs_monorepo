# Advanced Usage Guide

Detailed guide for `@msishamim/create-next-monorepo` — option combinations, comparisons, and advanced features.

## Common Presets

### Full-Stack (defaults)

```bash
npx @msishamim/create-next-monorepo my-app
```

NestJS + Tailwind + Prisma/Postgres + NextAuth + Zustand + Vitest. Best for most projects.

### Lightweight API

```bash
npx @msishamim/create-next-monorepo my-app \
  --backend express \
  --orm none \
  --auth none \
  --state tanstack-query
```

Express backend, no database, no auth, TanStack Query for API state. Good for BFF (Backend for Frontend) patterns.

### Enterprise

```bash
npx @msishamim/create-next-monorepo my-app \
  --backend nestjs \
  --orm prisma \
  --db postgres \
  --auth next-auth \
  --state redux \
  --github \
  --license Apache-2.0
```

Full NestJS with Redux Toolkit, GitHub CI, Apache license. Best for large teams.

### Minimal Frontend

```bash
npx @msishamim/create-next-monorepo my-app \
  --backend express \
  --styling css-modules \
  --orm none \
  --auth none \
  --state none
```

Bare minimum — Express API, CSS Modules, no database/auth/state. Good for learning or prototyping.

### Design System

```bash
npx @msishamim/create-next-monorepo my-app \
  --styling styled-components \
  --orm none \
  --auth none \
  --state jotai
```

Styled Components for a design system approach, Jotai for atomic state.

---

## Backend Comparison

### NestJS

Best for: large applications, enterprise teams, complex business logic.

**Generated structure:**
```
apps/api/src/
├── main.ts                     # NestFactory bootstrap
├── app.module.ts               # Root module with imports
├── app.controller.ts           # Decorated controller
├── app.service.ts              # Injectable service
└── common/
    ├── filters/                # @Catch() exception filters
    ├── guards/                 # @Injectable() CanActivate guards
    ├── interceptors/           # NestInterceptor logging
    └── pipes/                  # PipeTransform Zod validation
```

**Adding a feature:**
```bash
# Create module, controller, and service
# Register in app.module.ts imports
create-next-monorepo workflow c   # Step-by-step guide
```

### Express

Best for: lightweight APIs, microservices, serverless.

**Generated structure:**
```
apps/api/src/
├── main.ts                     # App bootstrap
├── app.ts                      # Express app factory
├── routes/
│   └── health.ts               # Express Router
├── services/
│   └── app.service.ts          # Plain class
└── common/
    ├── filters/                # Error handler middleware
    ├── guards/                 # Auth middleware
    ├── interceptors/           # Request logger middleware
    └── pipes/                  # Zod validate middleware
```

---

## ORM Comparison

### Prisma

- Schema defined in `.prisma` DSL — declarative and visual
- Auto-generated TypeScript types
- Built-in migration CLI (`prisma migrate dev`)
- Prisma Studio for visual DB management

```bash
cd packages/database
npx prisma migrate dev --name add-posts
npx prisma studio
```

### Drizzle

- Schema defined in TypeScript — full control, type inference
- SQL-like query builder
- Lightweight, no code generation step
- drizzle-kit for migrations

```bash
cd packages/database
npx drizzle-kit push
npx drizzle-kit studio
```

---

## State Management Comparison

### Zustand (default)

No provider needed. Create stores anywhere, use directly as hooks.

```typescript
const useStore = create<State>()((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

### Jotai

Atomic state — fine-grained reactivity, minimal re-renders.

```typescript
const countAtom = atom(0);
const [count, setCount] = useAtom(countAtom);
```

### Redux Toolkit

Centralized state with slices. Best for complex, predictable state flows.

```typescript
const slice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
  },
});
```

Requires `<StoreProvider>` wrapper in layout.tsx.

### TanStack Query

Server state management — caching, refetching, mutations. Not a general state manager.

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: () => fetch('/api/posts').then(r => r.json()),
});
```

Requires `<QueryProvider>` wrapper in layout.tsx.

---

## Styling Comparison

### Tailwind CSS (default)

Utility-first, zero-runtime CSS. Fastest for prototyping.

```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Click me
</button>
```

### CSS Modules

Scoped CSS files with `.module.css` extension. Traditional CSS approach.

```tsx
import styles from './button.module.css';
<button className={styles.primary}>Click me</button>
```

### Styled Components

CSS-in-JS with tagged template literals. Component-scoped, dynamic styling.

```tsx
const Button = styled.button<{ $variant: string }>`
  background: ${({ $variant }) => $variant === 'primary' ? '#2563eb' : '#64748b'};
`;
```

---

## Doctor Command

### What it checks

The doctor validates your monorepo structure against the expected layout:

- **Directories** — all expected dirs exist (30+ checks)
- **Files** — all expected files exist (70+ checks)
- **Config-aware** — adapts checks based on your detected backend, ORM, auth, state, and styling choices

### Auto-detection

Doctor auto-detects your project configuration by reading:
- `apps/api/package.json` → backend framework
- `apps/web/package.json` → styling, state, auth
- `packages/database/package.json` → ORM
- `packages/database/prisma/schema.prisma` → database type
- Root `package.json` → package manager
- `LICENSE` → license type

### Fix mode

```bash
create-next-monorepo doctor --fix
```

- **Restorable files** (README, LICENSE, configs, utilities, hooks) are regenerated with full content from templates
- **Non-restorable files** (containing user code) are created as empty placeholders with `// TODO` comments
- Directories are created with `recursive: true`

---

## Workflow Guides

### Workflow A — Component Design

Build a reusable component in `packages/ui/`:

1. Define props interface
2. Implement component with styling
3. Export from barrel
4. Write tests
5. Import from `@<name>/ui` in apps

### Workflow B — Page/Route Design

Build a Next.js page with state and API:

1. Create page in `apps/web/app/`
2. Add loading/error states
3. Wire state management (adapts to your choice)
4. Connect to API
5. Write tests

### Workflow C — API Feature Design

Build a backend endpoint:

1. Define types + Zod validators in `packages/lib/`
2. Create database schema (adapts to Prisma/Drizzle)
3. Build endpoint (adapts to NestJS/Express)
4. Add validation and error handling
5. Connect from frontend
6. Write tests

---

## Programmatic API

The generator can be used as a library:

```typescript
import {
  ProjectConfig,
  Generator,
  VersionResolver,
  Doctor,
  Workflow,
  detectProjectConfig,
  getExpectedDirectories,
  getExpectedFiles,
} from '@msishamim/create-next-monorepo';

// Create with full options
const config = new ProjectConfig({
  name: 'my-saas',
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
  githubFiles: true,
});

// Access derived properties
console.log(config.pascalCase);     // "MySaas"
console.log(config.hasDatabase);    // true
console.log(config.requiredPackages); // ["next", "react", ...]

// Generate
const generator = new Generator(config, '/path/to/my-saas');
await generator.run();

// Detect config from existing project
const detected = detectProjectConfig('/path/to/my-saas');
console.log(detected?.backend);     // "nestjs"

// Validate structure
const doctor = new Doctor('/path/to/my-saas');
await doctor.run(false);            // report only
await doctor.run(true);             // auto-fix

// Get expected paths
const dirs = getExpectedDirectories(config);
const files = getExpectedFiles(config);
```

---

## CI/CD Integration

When using `--github`, a GitHub Actions workflow is generated at `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup pnpm
      - Setup Node.js 20
      - Install dependencies
      - Lint (turbo)
      - Build (turbo)
```

The workflow adapts to your selected package manager (pnpm, npm, yarn, or bun).
