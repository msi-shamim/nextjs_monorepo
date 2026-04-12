import type { ProjectConfig } from '../../project-config.js';
import type { ApiStyleStrategy } from './api-style-strategy';

export class TrpcExpressTemplateStrategy implements ApiStyleStrategy {
  serverFiles(config: ProjectConfig): Record<string, string> {
    return {
      'apps/api/src/trpc/trpc.ts': `import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.token) {
    throw new Error('UNAUTHORIZED');
  }
  return next({ ctx: { ...ctx, token: ctx.token } });
});
`,

      'apps/api/src/trpc/router.ts': `import { z } from 'zod';
import { router, publicProcedure } from './trpc';

export const appRouter = router({
  health: publicProcedure.query(() => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })),

  info: publicProcedure.query(() => ({
    name: '${config.name}',
    version: '1.0.0',
    environment: process.env.NODE_ENV ?? 'development',
  })),

  hello: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .query(({ input }) => ({
      greeting: \`Hello, \${input.name}!\`,
    })),
});

export type AppRouter = typeof appRouter;
`,

      'apps/api/src/trpc/context.ts': `import type { Request } from 'express';

export interface Context {
  token: string | null;
}

export function createContext({ req }: { req: Request }): Context {
  const token = req.headers.authorization?.replace('Bearer ', '') ?? null;
  return { token };
}
`,

      'apps/api/src/trpc/adapter.ts': `import * as trpcExpress from '@trpc/server/adapters/express';
import type { Express } from 'express';
import { appRouter } from './router';
import { createContext } from './context';

/** Mount tRPC as Express middleware */
export function setupTrpc(app: Express) {
  app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: ({ req }) => createContext({ req }),
    }),
  );
}
`,
    };
  }

  clientFiles(config: ProjectConfig): Record<string, string> {
    // Reuse same client files as NestJS variant
    return {
      'apps/web/lib/trpc/client.ts': `import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@${config.name}/api/src/trpc/router';

export const trpc = createTRPCReact<AppRouter>();
`,

      'apps/web/lib/trpc/provider.tsx': `'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { trpc } from './client';

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: \`\${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/trpc\`,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
`,

      'apps/web/lib/trpc/server.ts': `import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@${config.name}/api/src/trpc/router';

/** Server-side tRPC caller for use in Server Components */
export const serverTrpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: \`\${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/trpc\`,
      transformer: superjson,
    }),
  ],
});
`,

      'apps/web/app/api/trpc/[trpc]/route.ts': `import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@${config.name}/api/src/trpc/router';
import { createContext } from '@${config.name}/api/src/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ req: req as any }),
  });

export { handler as GET, handler as POST };
`,
    };
  }

  setupInstructions(_config: ProjectConfig): string {
    return `// tRPC (Express):
// In apps/api/src/app.ts:
//   import { setupTrpc } from './trpc/adapter';
//   setupTrpc(app);
//
// tRPC endpoint: http://localhost:3001/api/trpc
`;
  }
}
