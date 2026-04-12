/**
 * Zustand state management strategy.
 */

import type { StateStrategy } from './state-strategy';

export class ZustandTemplateStrategy implements StateStrategy {
  storeSetup(): string {
    return `/**
 * Zustand store utilities.
 * Zustand requires no provider — stores are used directly via hooks.
 */

export { useThemeStore } from './theme-store';
`;
  }

  exampleStore(): string {
    return `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme;
        set({ theme: current === 'dark' ? 'light' : 'dark' });
      },
    }),
    { name: 'theme-storage' },
  ),
);
`;
  }

  /** Zustand needs no provider */
  providerWrapper(): string {
    return '';
  }
}
