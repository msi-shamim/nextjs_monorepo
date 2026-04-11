/**
 * Workflow — Step-by-step development guides for building features.
 * Three flows: A (Component), B (Page/Route), C (API Feature).
 * Adapts output based on detected project configuration.
 * Mirrors flutter_monorepo's Workflow class.
 */

import type { ProjectConfig } from './project-config.js';
import {
  backendDisplayName,
  stylingDisplayName,
  ormDisplayName,
} from './project-config.js';
import { detectProjectConfig } from './config-detector.js';
import { logger } from './logger.js';
import chalk from 'chalk';

export class Workflow {
  constructor(private rootPath: string) {}

  /** Run the specified workflow (or show overview) */
  run(flow?: string): void {
    const config = detectProjectConfig(this.rootPath);

    if (!flow) {
      this.printOverview(config);
      return;
    }

    switch (flow.toLowerCase()) {
      case 'a':
        this.printComponentFlow(config);
        break;
      case 'b':
        this.printPageFlow(config);
        break;
      case 'c':
        this.printApiFlow(config);
        break;
      default:
        logger.error(`Unknown workflow "${flow}". Use: a, b, or c`);
        logger.log('  a — Component Design');
        logger.log('  b — Page/Route Design');
        logger.log('  c — API Feature Design');
    }
  }

  // ── Overview ─────────────────────────────────────────────────────

  private printOverview(config: ProjectConfig | null): void {
    logger.header('Development Workflows');
    logger.newline();

    if (config) {
      logger.info(`Project: ${config.pascalCase}`);
      logger.info(`Backend: ${backendDisplayName[config.backend]} | Styling: ${stylingDisplayName[config.styling]} | ORM: ${ormDisplayName[config.orm]}`);
      logger.newline();
    }

    console.log(chalk.bold('  Workflow A — Component Design'));
    console.log('  Build a reusable UI component in packages/ui/');
    console.log(chalk.dim('  Run: create-next-monorepo workflow a'));
    logger.newline();

    console.log(chalk.bold('  Workflow B — Page/Route Design'));
    console.log('  Build a Next.js page with state and API integration');
    console.log(chalk.dim('  Run: create-next-monorepo workflow b'));
    logger.newline();

    console.log(chalk.bold('  Workflow C — API Feature Design'));
    console.log('  Build a backend endpoint with validation and DB access');
    console.log(chalk.dim('  Run: create-next-monorepo workflow c'));
    logger.newline();

    if (config) {
      logger.header('Quick Reference');
      logger.newline();

      console.log(`  ${chalk.cyan('Frontend app')}    apps/web/`);
      console.log(`  ${chalk.cyan('Backend app')}     apps/api/`);
      console.log(`  ${chalk.cyan('UI components')}   packages/ui/src/components/`);
      console.log(`  ${chalk.cyan('Shared types')}    packages/lib/src/types/`);
      console.log(`  ${chalk.cyan('Shared utils')}    packages/lib/src/utils/`);
      console.log(`  ${chalk.cyan('Validators')}      packages/lib/src/validators/`);

      if (config.hasState) {
        const stateDir = config.state === 'tanstack-query' ? 'apps/web/lib/query/' : 'apps/web/lib/store/';
        console.log(`  ${chalk.cyan('State mgmt')}      ${stateDir}`);
      }
      if (config.hasDatabase) {
        console.log(`  ${chalk.cyan('Database')}        packages/database/`);
      }

      logger.newline();
    }
  }

  // ── Workflow A: Component Design ─────────────────────────────────

  private printComponentFlow(config: ProjectConfig | null): void {
    const styling = config?.styling ?? 'tailwind';

    logger.header('Workflow A — Component Design');
    logger.newline();
    console.log(chalk.dim('  Build a reusable UI component in the shared packages/ui/ package.'));
    logger.newline();

    // Step 1
    console.log(chalk.bold.cyan('  Step 1: Define the Component Interface'));
    console.log('  Start by defining the props interface and variants.');
    console.log();
    console.log(chalk.dim('  File: packages/ui/src/components/<name>.tsx'));
    console.log();
    console.log(chalk.gray(`    export interface MyComponentProps {
      variant?: 'primary' | 'secondary';
      size?: 'sm' | 'md' | 'lg';
      children: React.ReactNode;
    }`));
    logger.newline();

    // Step 2
    console.log(chalk.bold.cyan('  Step 2: Implement the Component'));

    if (styling === 'tailwind') {
      console.log('  Use Tailwind utility classes for styling.');
      console.log();
      console.log(chalk.gray(`    export function MyComponent({ variant = 'primary', size = 'md', children }: MyComponentProps) {
      return (
        <div className={\`rounded-lg \${variantStyles[variant]} \${sizeStyles[size]}\`}>
          {children}
        </div>
      );
    }`));
    } else if (styling === 'css-modules') {
      console.log('  Create a CSS Module alongside the component.');
      console.log();
      console.log(chalk.dim('  Files:'));
      console.log(chalk.dim('    packages/ui/src/components/<name>.tsx'));
      console.log(chalk.dim('    packages/ui/src/components/<name>.module.css'));
      console.log();
      console.log(chalk.gray(`    import styles from './<name>.module.css';

    export function MyComponent({ variant, children }: MyComponentProps) {
      return <div className={\`\${styles.root} \${styles[variant]}\`}>{children}</div>;
    }`));
    } else {
      console.log('  Use styled-components for styling.');
      console.log();
      console.log(chalk.gray(`    import styled from 'styled-components';

    const StyledWrapper = styled.div<{ $variant: string }>\`
      border-radius: 8px;
      /* variant-specific styles */
    \`;

    export function MyComponent({ variant, children }: MyComponentProps) {
      return <StyledWrapper $variant={variant}>{children}</StyledWrapper>;
    }`));
    }
    logger.newline();

    // Step 3
    console.log(chalk.bold.cyan('  Step 3: Export from Barrel'));
    console.log('  Add the export to the components barrel file.');
    console.log();
    console.log(chalk.dim('  File: packages/ui/src/components/index.ts'));
    console.log();
    console.log(chalk.gray(`    export { MyComponent } from './my-component.js';
    export type { MyComponentProps } from './my-component.js';`));
    logger.newline();

    // Step 4
    console.log(chalk.bold.cyan('  Step 4: Write Tests'));
    console.log('  Create a test file for your component.');
    console.log();
    console.log(chalk.dim('  File: packages/ui/src/components/__tests__/my-component.test.tsx'));
    logger.newline();

    // Step 5
    console.log(chalk.bold.cyan('  Step 5: Use in App'));
    console.log('  Import from the UI package in your Next.js app.');
    console.log();
    const pkgName = config?.name ?? 'my-app';
    console.log(chalk.gray(`    import { MyComponent } from '@${pkgName}/ui';`));
    logger.newline();

    // Checklist
    console.log(chalk.bold('  Checklist'));
    console.log('  [ ] Props interface defined with clear types');
    console.log('  [ ] Component handles all variant/size combinations');
    console.log('  [ ] Exported from barrel file');
    console.log('  [ ] Works in both light and dark modes');
    console.log('  [ ] Tests written and passing');
    logger.newline();
  }

  // ── Workflow B: Page/Route Design ────────────────────────────────

  private printPageFlow(config: ProjectConfig | null): void {
    const state = config?.state ?? 'none';

    logger.header('Workflow B — Page/Route Design');
    logger.newline();
    console.log(chalk.dim('  Build a Next.js page with state management and API integration.'));
    logger.newline();

    // Step 1
    console.log(chalk.bold.cyan('  Step 1: Create the Page'));
    console.log('  Create a new page in the App Router.');
    console.log();
    console.log(chalk.dim('  File: apps/web/app/<route>/page.tsx'));
    console.log();
    console.log(chalk.gray(`    export default function MyPage() {
      return (
        <main>
          <h1>My Page</h1>
        </main>
      );
    }`));
    logger.newline();

    // Step 2
    console.log(chalk.bold.cyan('  Step 2: Add Loading and Error States'));
    console.log('  Create loading.tsx and error.tsx in the same route directory.');
    console.log();
    console.log(chalk.dim('  Files:'));
    console.log(chalk.dim('    apps/web/app/<route>/loading.tsx'));
    console.log(chalk.dim('    apps/web/app/<route>/error.tsx'));
    logger.newline();

    // Step 3 — State management (adapts to detected framework)
    console.log(chalk.bold.cyan('  Step 3: Wire State Management'));

    if (state === 'zustand') {
      console.log('  Create a Zustand store for this page\'s state.');
      console.log();
      console.log(chalk.dim('  File: apps/web/lib/store/<feature>-store.ts'));
      console.log();
      console.log(chalk.gray(`    import { create } from 'zustand';

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
        const res = await fetch('/api/items');
        const data = await res.json();
        set({ items: data, isLoading: false });
      },
    }));`));
    } else if (state === 'jotai') {
      console.log('  Create Jotai atoms for this page\'s state.');
      console.log();
      console.log(chalk.dim('  File: apps/web/lib/store/<feature>-atom.ts'));
      console.log();
      console.log(chalk.gray(`    import { atom } from 'jotai';
    import { atomWithQuery } from 'jotai-tanstack-query';

    export const itemsAtom = atom<Item[]>([]);
    export const isLoadingAtom = atom(false);`));
    } else if (state === 'redux') {
      console.log('  Create a Redux Toolkit slice for this feature.');
      console.log();
      console.log(chalk.dim('  File: apps/web/lib/store/<feature>-slice.ts'));
      console.log();
      console.log(chalk.gray(`    import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

    export const fetchItems = createAsyncThunk('feature/fetchItems', async () => {
      const res = await fetch('/api/items');
      return res.json();
    });

    const featureSlice = createSlice({ name: 'feature', initialState: { items: [] }, ... });`));
      console.log();
      console.log(chalk.dim('  Don\'t forget to add the reducer to apps/web/lib/store/store.ts'));
    } else if (state === 'tanstack-query') {
      console.log('  Create query hooks for data fetching.');
      console.log();
      console.log(chalk.dim('  File: apps/web/hooks/use-<feature>.ts'));
      console.log();
      console.log(chalk.gray(`    import { useQuery, useMutation } from '@tanstack/react-query';

    export function useItems() {
      return useQuery({
        queryKey: ['items'],
        queryFn: () => fetch('/api/items').then(r => r.json()),
      });
    }`));
    } else {
      console.log('  No state management configured. Use React state or fetch directly.');
      console.log();
      console.log(chalk.gray(`    // Use React Server Components for data fetching:
    export default async function MyPage() {
      const res = await fetch('http://localhost:3001/api/items');
      const items = await res.json();
      return <ItemList items={items} />;
    }`));
    }
    logger.newline();

    // Step 4
    console.log(chalk.bold.cyan('  Step 4: Connect to API'));
    console.log('  Fetch data from your backend API endpoint.');
    console.log();
    console.log(chalk.dim('  Use NEXT_PUBLIC_API_URL from .env for the API base URL.'));
    logger.newline();

    // Step 5
    console.log(chalk.bold.cyan('  Step 5: Write Tests'));
    console.log('  Test the page component and any hooks/stores.');
    console.log();
    console.log(chalk.dim('  File: apps/web/app/<route>/__tests__/page.test.tsx'));
    logger.newline();

    // Checklist
    console.log(chalk.bold('  Checklist'));
    console.log('  [ ] Page component created in app/<route>/page.tsx');
    console.log('  [ ] Loading and error states handled');
    console.log('  [ ] State management wired (if applicable)');
    console.log('  [ ] API integration working');
    console.log('  [ ] Responsive design verified');
    console.log('  [ ] Tests written and passing');
    logger.newline();
  }

  // ── Workflow C: API Feature Design ───────────────────────────────

  private printApiFlow(config: ProjectConfig | null): void {
    const backend = config?.backend ?? 'nestjs';
    const orm = config?.orm ?? 'none';

    logger.header('Workflow C — API Feature Design');
    logger.newline();
    console.log(chalk.dim('  Build a backend API endpoint with validation, database access, and error handling.'));
    logger.newline();

    // Step 1
    console.log(chalk.bold.cyan('  Step 1: Define Types and Validators'));
    console.log('  Add shared types and Zod validators to the lib package.');
    console.log();
    console.log(chalk.dim('  Files:'));
    console.log(chalk.dim('    packages/lib/src/types/<feature>.ts'));
    console.log(chalk.dim('    packages/lib/src/validators/<feature>.ts'));
    console.log();
    console.log(chalk.gray(`    // packages/lib/src/validators/item.ts
    import { z } from 'zod';

    export const createItemSchema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    });

    export type CreateItemInput = z.infer<typeof createItemSchema>;`));
    logger.newline();

    // Step 2 — Database schema (adapts to ORM)
    console.log(chalk.bold.cyan('  Step 2: Define Database Schema'));

    if (orm === 'prisma') {
      console.log('  Add a model to the Prisma schema.');
      console.log();
      console.log(chalk.dim('  File: packages/database/prisma/schema.prisma'));
      console.log();
      console.log(chalk.gray(`    model Item {
      id          String   @id @default(cuid())
      name        String
      description String?
      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt

      @@map("items")
    }`));
      console.log();
      console.log(chalk.dim('  Then run: cd packages/database && npx prisma migrate dev'));
    } else if (orm === 'drizzle') {
      console.log('  Add a table definition to the Drizzle schema.');
      console.log();
      console.log(chalk.dim('  File: packages/database/src/schema/items.ts'));
      console.log();
      console.log(chalk.gray(`    import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

    export const items = pgTable('items', {
      id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
      name: varchar('name', { length: 100 }).notNull(),
      description: text('description'),
      createdAt: timestamp('created_at').defaultNow().notNull(),
      updatedAt: timestamp('updated_at').defaultNow().notNull(),
    });`));
      console.log();
      console.log(chalk.dim('  Then run: cd packages/database && npx drizzle-kit push'));
    } else {
      console.log('  No ORM configured. Use raw queries or add an ORM.');
    }
    logger.newline();

    // Step 3 — Backend endpoint (adapts to backend framework)
    console.log(chalk.bold.cyan('  Step 3: Build the API Endpoint'));

    if (backend === 'nestjs') {
      console.log('  Create a NestJS module with controller and service.');
      console.log();
      console.log(chalk.dim('  Files:'));
      console.log(chalk.dim('    apps/api/src/items/items.module.ts'));
      console.log(chalk.dim('    apps/api/src/items/items.controller.ts'));
      console.log(chalk.dim('    apps/api/src/items/items.service.ts'));
      console.log(chalk.dim('    apps/api/src/items/dto/create-item.dto.ts'));
      console.log();
      console.log(chalk.gray(`    // items.controller.ts
    @Controller('items')
    export class ItemsController {
      constructor(private readonly itemsService: ItemsService) {}

      @Get()
      findAll() { return this.itemsService.findAll(); }

      @Post()
      create(@Body() dto: CreateItemDto) { return this.itemsService.create(dto); }
    }`));
      console.log();
      console.log(chalk.dim('  Register in apps/api/src/app.module.ts imports array.'));
    } else {
      console.log('  Create Express route and service files.');
      console.log();
      console.log(chalk.dim('  Files:'));
      console.log(chalk.dim('    apps/api/src/routes/items.ts'));
      console.log(chalk.dim('    apps/api/src/services/items.service.ts'));
      console.log();
      console.log(chalk.gray(`    // routes/items.ts
    import { Router } from 'express';
    import { ItemsService } from '../services/items.service.js';
    import { validate } from '../common/pipes/validate.js';
    import { createItemSchema } from '@my-app/lib/validators';

    export const itemsRouter = Router();
    const service = new ItemsService();

    itemsRouter.get('/items', async (_req, res) => {
      res.json(await service.findAll());
    });

    itemsRouter.post('/items', validate(createItemSchema), async (req, res) => {
      res.status(201).json(await service.create(req.body));
    });`));
      console.log();
      console.log(chalk.dim('  Register in apps/api/src/app.ts with app.use(\'/api\', itemsRouter)'));
    }
    logger.newline();

    // Step 4
    console.log(chalk.bold.cyan('  Step 4: Add Validation and Error Handling'));
    console.log('  Use Zod validators from packages/lib/ for request validation.');
    if (backend === 'nestjs') {
      console.log('  Use the ZodValidationPipe in apps/api/src/common/pipes/.');
    } else {
      console.log('  Use the validate() middleware in apps/api/src/common/pipes/.');
    }
    logger.newline();

    // Step 5
    console.log(chalk.bold.cyan('  Step 5: Connect from Frontend'));
    const pkgName = config?.name ?? 'my-app';
    console.log('  Call the API from your Next.js page.');
    console.log();
    console.log(chalk.gray(`    import type { CreateItemInput } from '@${pkgName}/lib/validators';

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    async function createItem(data: CreateItemInput) {
      const res = await fetch(\`\${apiUrl}/api/items\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    }`));
    logger.newline();

    // Step 6
    console.log(chalk.bold.cyan('  Step 6: Write Tests'));
    if (backend === 'nestjs') {
      console.log(chalk.dim('  File: apps/api/test/items.e2e-spec.ts'));
    } else {
      console.log(chalk.dim('  File: apps/api/test/items.test.ts'));
    }
    logger.newline();

    // Checklist
    console.log(chalk.bold('  Checklist'));
    console.log('  [ ] Types defined in packages/lib/src/types/');
    console.log('  [ ] Zod validators defined in packages/lib/src/validators/');
    if (orm !== 'none') {
      console.log('  [ ] Database schema defined and migrated');
    }
    console.log('  [ ] API endpoint created and tested');
    console.log('  [ ] Request validation in place');
    console.log('  [ ] Error handling for edge cases');
    console.log('  [ ] Frontend integration working');
    console.log('  [ ] Tests written and passing');
    logger.newline();
  }
}
