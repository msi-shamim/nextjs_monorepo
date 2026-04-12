/**
 * TanStack Query state management strategy.
 */

import type { ProjectConfig } from '../../project-config.js';
import type { StateStrategy } from './state-strategy';

export class TanstackQueryTemplateStrategy implements StateStrategy {
  storeSetup(): string {
    return `/**
 * TanStack Query setup and utilities.
 */

export { queryClient } from './query-client';
export { QueryProvider } from './provider';
`;
  }

  exampleStore(_config: ProjectConfig): string {
    return `import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Example query hook — fetches health status from the API.
 */
export function useHealthQuery() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  return {
    queryKey: ['health'],
    queryFn: async () => {
      const response = await fetch(\`\${apiUrl}/api/health\`);
      if (!response.ok) throw new Error('API health check failed');
      return response.json();
    },
  };
}
`;
  }

  providerWrapper(): string {
    return `'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
`;
  }
}
