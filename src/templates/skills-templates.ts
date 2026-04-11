/**
 * AI Skills templates — .claude/settings.json + 4 SKILL.md files
 * for Claude Code integration in generated monorepos.
 */

import type { ProjectConfig } from '../project-config.js';
import {
  backendDisplayName,
  stylingDisplayName,
  ormDisplayName,
  stateDisplayName,
} from '../project-config.js';

/** .claude/settings.json — pre-approved tools and commands */
export function claudeSettings(config: ProjectConfig): string {
  const allowList = [
    'Read',
    'Glob',
    'Grep',
    `Bash(${config.packageManager} install)`,
    `Bash(${config.runCommand} build)`,
    `Bash(${config.runCommand} dev)`,
    `Bash(${config.runCommand} lint)`,
    `Bash(${config.runCommand} test)`,
    `Bash(${config.runCommand} format)`,
    'Bash(npx turbo *)',
  ];

  if (config.orm === 'prisma') {
    allowList.push('Bash(npx prisma *)');
  }
  if (config.orm === 'drizzle') {
    allowList.push('Bash(npx drizzle-kit *)');
  }

  return JSON.stringify({ permissions: { allow: allowList } }, null, 2) + '\n';
}

/** .claude/skills/component-design/SKILL.md */
export function componentDesignSkill(config: ProjectConfig): string {
  let stylingGuide = '';
  switch (config.styling) {
    case 'tailwind':
      stylingGuide = `Use Tailwind utility classes for all styling. Define variant/size style maps as const objects.
Example: \`const variantStyles = { primary: 'bg-blue-600 text-white', secondary: 'bg-slate-600 text-white' } as const;\``;
      break;
    case 'css-modules':
      stylingGuide = `Create a CSS Module alongside the component (\`<name>.module.css\`).
Import as \`import styles from './<name>.module.css'\` and apply with \`className={styles.root}\`.`;
      break;
    case 'styled-components':
      stylingGuide = `Use styled-components for all styling. Create styled wrappers with transient props (\`$variant\`).
Example: \`const StyledButton = styled.button<{ $variant: string }>\\\`...\\\`;\``;
      break;
  }

  return `---
description: Build a reusable React component in the shared UI package
triggers:
  - "Build a component"
  - "Create a reusable UI element"
  - "Convert this design to a component"
---

# Component Design Workflow

Build reusable React components in \`packages/ui/src/components/\` that can be shared across the monorepo.

## When to Use
- Building a reusable UI element (Button, Card, Modal, Form, etc.)
- Converting a design/mockup into a component
- Extracting a repeated pattern into a shared component

## File Placement

| What | Where |
|------|-------|
| Component | \`packages/ui/src/components/<name>.tsx\` |
| Types | Exported from the component file |
| Barrel | \`packages/ui/src/components/index.ts\` |
| Tests | \`packages/ui/src/components/__tests__/<name>.test.tsx\` |

## Component Rules

1. **Props interface** — Define a clear TypeScript interface with JSDoc comments
2. **Variants** — Support variant/size props with sensible defaults
3. **Composition** — Extend native HTML element props (\`React.ButtonHTMLAttributes<HTMLButtonElement>\`)
4. **No hardcoded text** — Accept all text via props or children
5. **Accessible** — Include proper ARIA attributes and keyboard handling
6. **Responsive** — Works across all screen sizes

## Styling

${stylingGuide}

## Steps

1. **Define the props interface** with variants, sizes, and children
2. **Implement the component** as a named function export
3. **Add styling** following the ${stylingDisplayName[config.styling]} patterns above
4. **Export from barrel** in \`packages/ui/src/components/index.ts\`
5. **Write tests** covering all variants, sizes, and edge cases
6. **Use in app** — import from \`@${config.name}/ui\`

## Checklist

- [ ] Props interface is well-typed with JSDoc
- [ ] All variants and sizes render correctly
- [ ] Component is accessible (ARIA, keyboard nav)
- [ ] Responsive across breakpoints
- [ ] Exported from barrel file
- [ ] Tests written and passing

## Verification

\`\`\`bash
${config.runCommand} lint
${config.runCommand} test
\`\`\`
`;
}

/** .claude/skills/page-design/SKILL.md */
export function pageDesignSkill(config: ProjectConfig): string {
  let stateGuide = '';
  switch (config.state) {
    case 'zustand':
      stateGuide = `### Zustand Store
Create a store in \`apps/web/lib/store/<feature>-store.ts\`:
\`\`\`typescript
import { create } from 'zustand';

interface FeatureState {
  items: Item[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
}

export const useFeatureStore = create<FeatureState>()((set) => ({
  items: [],
  isLoading: false,
  fetchItems: async () => {
    set({ isLoading: true });
    const res = await fetch(\\\`\\\${process.env.NEXT_PUBLIC_API_URL}/api/items\\\`);
    const data = await res.json();
    set({ items: data.data, isLoading: false });
  },
}));
\`\`\``;
      break;
    case 'jotai':
      stateGuide = `### Jotai Atoms
Create atoms in \`apps/web/lib/store/<feature>-atom.ts\`:
\`\`\`typescript
import { atom } from 'jotai';

export const itemsAtom = atom<Item[]>([]);
export const isLoadingAtom = atom(false);
\`\`\`
Use with \`const [items, setItems] = useAtom(itemsAtom)\` in your page.`;
      break;
    case 'redux':
      stateGuide = `### Redux Toolkit Slice
Create a slice in \`apps/web/lib/store/<feature>-slice.ts\`:
\`\`\`typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchItems = createAsyncThunk('feature/fetchItems', async () => {
  const res = await fetch(\\\`\\\${process.env.NEXT_PUBLIC_API_URL}/api/items\\\`);
  return res.json();
});

const featureSlice = createSlice({
  name: 'feature',
  initialState: { items: [], isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchItems.fulfilled, (state, action) => { state.items = action.payload; });
  },
});
\`\`\`
Register the reducer in \`apps/web/lib/store/store.ts\`.`;
      break;
    case 'tanstack-query':
      stateGuide = `### TanStack Query Hook
Create a query hook in \`apps/web/hooks/use-<feature>.ts\`:
\`\`\`typescript
import { useQuery } from '@tanstack/react-query';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await fetch(\\\`\\\${process.env.NEXT_PUBLIC_API_URL}/api/items\\\`);
      return res.json();
    },
  });
}
\`\`\``;
      break;
    default:
      stateGuide = `### No State Management
Use React Server Components for data fetching, or \`useState\`/\`useEffect\` for client-side state.`;
      break;
  }

  return `---
description: Build a Next.js page with state management and API integration
triggers:
  - "Build a page"
  - "Create a route"
  - "Add a screen"
---

# Page/Route Design Workflow

Build Next.js App Router pages in \`apps/web/app/\` with ${config.hasState ? stateDisplayName[config.state] : 'React'} state management.

## When to Use
- Adding a new page or route to the frontend
- Building a data-driven view that fetches from the API
- Creating a form page with client-side state

## File Placement

| What | Where |
|------|-------|
| Page | \`apps/web/app/<route>/page.tsx\` |
| Loading | \`apps/web/app/<route>/loading.tsx\` |
| Error | \`apps/web/app/<route>/error.tsx\` |
| Layout | \`apps/web/app/<route>/layout.tsx\` (optional) |
${config.hasState ? `| State | \`apps/web/lib/${config.state === 'tanstack-query' ? 'query' : 'store'}/<feature>.ts\` |` : ''}
| Tests | \`apps/web/app/<route>/__tests__/page.test.tsx\` |

## Steps

1. **Create the page** in \`apps/web/app/<route>/page.tsx\`
2. **Add loading and error states** (\`loading.tsx\`, \`error.tsx\`) in the same directory
3. **Wire state management** (see pattern below)
4. **Connect to API** using \`NEXT_PUBLIC_API_URL\` env var
5. **Import shared components** from \`@${config.name}/ui\`
6. **Write tests** for the page component

## State Management Pattern

${stateGuide}

## Checklist

- [ ] Page component created in \`app/<route>/page.tsx\`
- [ ] Loading and error states handled
- [ ] State management wired (if applicable)
- [ ] API integration working
- [ ] Shared UI components used from \`@${config.name}/ui\`
- [ ] Responsive design verified
- [ ] Tests written and passing

## Verification

\`\`\`bash
${config.runCommand} lint
${config.runCommand} test
\`\`\`
`;
}

/** .claude/skills/api-feature/SKILL.md */
export function apiFeatureSkill(config: ProjectConfig): string {
  let endpointGuide = '';
  if (config.backend === 'nestjs') {
    endpointGuide = `### NestJS Module Pattern
Create a feature module with controller and service:

\`\`\`
apps/api/src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
└── dto/
    └── create-<feature>.dto.ts
\`\`\`

Register the module in \`apps/api/src/app.module.ts\` imports array.`;
  } else {
    endpointGuide = `### Express Route Pattern
Create route and service files:

\`\`\`
apps/api/src/
├── routes/<feature>.ts
└── services/<feature>.service.ts
\`\`\`

Register the route in \`apps/api/src/app.ts\` with \`app.use('/api', <feature>Router)\`.`;
  }

  let schemaGuide = '';
  if (config.orm === 'prisma') {
    schemaGuide = `### Prisma Schema
Add a model to \`packages/database/prisma/schema.prisma\`, then run:
\`\`\`bash
cd packages/database && npx prisma migrate dev --name add-<feature>
\`\`\``;
  } else if (config.orm === 'drizzle') {
    schemaGuide = `### Drizzle Schema
Create \`packages/database/src/schema/<feature>.ts\`, export from \`index.ts\`, then run:
\`\`\`bash
cd packages/database && npx drizzle-kit push
\`\`\``;
  } else {
    schemaGuide = `### No ORM
No database ORM is configured. Use raw queries or add an ORM.`;
  }

  return `---
description: Build a backend API endpoint with validation and database access
triggers:
  - "Add an API endpoint"
  - "Create a backend feature"
  - "Build a CRUD resource"
---

# API Feature Design Workflow

Build ${backendDisplayName[config.backend]} API endpoints with Zod validation${config.hasDatabase ? ' and ' + ormDisplayName[config.orm] + ' database access' : ''}.

## When to Use
- Adding a new REST endpoint to the backend
- Building CRUD operations for a resource
- Creating a service with business logic

## Steps

### 1. Define Types and Validators
Create shared types and Zod schemas in \`packages/lib/\`:

\`\`\`
packages/lib/src/
├── types/<feature>.ts        # TypeScript interfaces
└── validators/<feature>.ts   # Zod schemas
\`\`\`

### 2. Database Schema
${schemaGuide}

### 3. Build the API Endpoint
${endpointGuide}

### 4. Add Validation
Use Zod validators from \`@${config.name}/lib/validators\` for request body validation.
${config.backend === 'nestjs' ? 'Use the `ZodValidationPipe` in `apps/api/src/common/pipes/`.' : 'Use the `validate()` middleware in `apps/api/src/common/pipes/`.'}

### 5. Connect from Frontend
Call the API from your Next.js page:
\`\`\`typescript
import type { CreateItemInput } from '@${config.name}/lib/validators';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
\`\`\`

### 6. Write Tests
${config.backend === 'nestjs' ? 'File: `apps/api/test/<feature>.e2e-spec.ts`' : 'File: `apps/api/test/<feature>.test.ts`'}

## Checklist

- [ ] Types defined in \`packages/lib/src/types/\`
- [ ] Zod validators defined in \`packages/lib/src/validators/\`
${config.hasDatabase ? '- [ ] Database schema defined and migrated\n' : ''}- [ ] API endpoint created and tested
- [ ] Request validation in place
- [ ] Error handling for edge cases
- [ ] Frontend integration working
- [ ] Tests written and passing

## Verification

\`\`\`bash
${config.runCommand} lint
${config.runCommand} test
\`\`\`
`;
}

/** .claude/skills/monorepo-doctor/SKILL.md */
export function monrepoDoctorSkill(): string {
  return `---
description: Check monorepo structure integrity and fix missing items
triggers:
  - "Check structure"
  - "What is missing"
  - "Run doctor"
  - "Validate the project"
---

# Monorepo Doctor

Validate the monorepo's directory and file structure, and auto-fix any missing items.

## When to Use
- After pulling changes or merging branches
- When something seems broken or files are missing
- To verify the project structure is complete
- After manually deleting or moving files

## How to Run

### Check structure (report only)
\`\`\`bash
npx @msishamim/create-next-monorepo doctor
\`\`\`

### Auto-fix missing items
\`\`\`bash
npx @msishamim/create-next-monorepo doctor --fix
\`\`\`

## What It Checks

### Directories
- App directories: \`apps/web/\`, \`apps/api/\`
- Package directories: \`packages/ui/\`, \`packages/lib/\`, \`packages/config/\`, \`packages/database/\`
- Source subdirectories: components, hooks, types, utils, validators
- Backend-specific: controllers/routes, services, filters, guards, interceptors, pipes
- AI skills: \`.claude/skills/\`

### Files
- Root configs: \`package.json\`, \`turbo.json\`, \`.gitignore\`, \`.prettierrc\`, \`README.md\`, \`LICENSE\`
- Package configs: \`package.json\`, \`tsconfig.json\` for each package
- Source files: barrel exports, components, hooks, utilities
- Backend files: entry point, controllers/routes, services, middleware
- Database files: schema, client, seed (if ORM configured)

### Restorable Files
Files marked as "restorable" can be fully regenerated from templates with \`--fix\`:
- README.md, LICENSE, CONTRIBUTING.md
- Config files (ESLint, TypeScript, Tailwind)
- Shared utilities, validators, constants
- UI hooks (useMediaQuery, useDebounce)
- AI skill files

Non-restorable files (containing user code) are created as empty placeholders.
`;
}
