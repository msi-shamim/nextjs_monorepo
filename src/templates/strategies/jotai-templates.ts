/**
 * Jotai state management strategy.
 */

import type { StateStrategy } from './state-strategy.js';

export class JotaiTemplateStrategy implements StateStrategy {
  storeSetup(): string {
    return `/**
 * Jotai atom exports.
 * Jotai is atomic — no provider needed (uses default store).
 */

export { themeAtom } from './theme-atom.js';
`;
  }

  exampleStore(): string {
    return `import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type Theme = 'light' | 'dark' | 'system';

/** Persisted theme atom */
export const themeAtom = atomWithStorage<Theme>('theme', 'system');

/** Derived atom that resolves 'system' to actual theme */
export const resolvedThemeAtom = atom((get) => {
  const theme = get(themeAtom);
  if (theme !== 'system') return theme;

  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
});

/** Convenience hook for theme management */
export function useTheme() {
  const [theme, setTheme] = useAtom(themeAtom);
  return { theme, setTheme };
}
`;
  }

  /** Jotai works without a provider (uses default store) */
  providerWrapper(): string {
    return '';
  }
}
