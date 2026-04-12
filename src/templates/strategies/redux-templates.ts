/**
 * Redux Toolkit state management strategy.
 */

import type { StateStrategy } from './state-strategy';

export class ReduxTemplateStrategy implements StateStrategy {
  storeSetup(): string {
    return `import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { themeReducer } from './theme-slice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Typed dispatch hook */
export const useAppDispatch: () => AppDispatch = useDispatch;

/** Typed selector hook */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`;
  }

  exampleStore(): string {
    return `import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
`;
  }

  providerWrapper(): string {
    return `'use client';

import { Provider } from 'react-redux';
import { store } from './store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
`;
  }
}
