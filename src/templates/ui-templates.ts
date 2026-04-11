/**
 * UI package templates — shared React components and hooks.
 */

import type { ProjectConfig } from '../project-config.js';

/** packages/ui/package.json */
export function uiPackageJson(config: ProjectConfig): string {
  const styledDep =
    config.styling === 'styled-components'
      ? `\n    "styled-components": "${config.versions['styled-components'] ?? '^6.1.18'}",`
      : '';

  return `{
  "name": "@${config.name}/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./hooks": "./src/hooks/index.ts"
  },
  "dependencies": {
    "react": "${config.versions['react'] ?? '^19.1.0'}",${styledDep}
    "react-dom": "${config.versions['react-dom'] ?? '^19.1.0'}"
  },
  "devDependencies": {
    "@types/react": "${config.versions['@types/react'] ?? '^19.1.2'}",
    "@types/react-dom": "${config.versions['@types/react-dom'] ?? '^19.1.2'}",
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
}

/** packages/ui/tsconfig.json */
export function uiTsConfig(config: ProjectConfig): string {
  return `{
  "extends": "@${config.name}/config/typescript/base",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "verbatimModuleSyntax": false
  },
  "include": ["src/**/*"]
}
`;
}

/** packages/ui/src/index.ts — barrel export */
export function uiIndex(): string {
  return `export * from './components/index.js';
export * from './hooks/index.js';
`;
}

/** packages/ui/src/components/index.ts — component barrel */
export function uiComponentsIndex(): string {
  return `export { Button } from './button.js';
export type { ButtonProps } from './button.js';

export { Card } from './card.js';
export type { CardProps } from './card.js';

export { Input } from './input.js';
export type { InputProps } from './input.js';
`;
}

/** packages/ui/src/components/button.tsx */
export function uiButton(config: ProjectConfig): string {
  if (config.styling === 'styled-components') {
    return `import React from 'react';
import styled from 'styled-components';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const StyledButton = styled.button<{ $variant: string; $size: string }>\`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  \${({ $size }) =>
    $size === 'sm'
      ? 'padding: 6px 12px; font-size: 14px;'
      : $size === 'lg'
        ? 'padding: 12px 24px; font-size: 18px;'
        : 'padding: 8px 16px; font-size: 16px;'}

  \${({ $variant }) =>
    $variant === 'primary'
      ? 'background: #2563eb; color: white; border: none;'
      : $variant === 'secondary'
        ? 'background: #64748b; color: white; border: none;'
        : $variant === 'outline'
          ? 'background: transparent; color: #2563eb; border: 1px solid #2563eb;'
          : 'background: transparent; color: #374151; border: none;'}

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
\`;

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <StyledButton $variant={variant} $size={size} {...props}>
      {children}
    </StyledButton>
  );
}
`;
  }

  if (config.styling === 'css-modules') {
    return `import React from 'react';
import styles from './button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}
`;
  }

  // Tailwind (default)
  return `import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
  secondary: 'bg-slate-600 text-white hover:bg-slate-700 border-transparent',
  outline: 'bg-transparent text-blue-600 hover:bg-blue-50 border-blue-600',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent',
} as const;

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={\`inline-flex items-center justify-center rounded-lg font-medium border transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none \${variantStyles[variant]} \${sizeStyles[size]} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
}
`;
}

/** packages/ui/src/components/card.tsx */
export function uiCard(config: ProjectConfig): string {
  if (config.styling === 'styled-components') {
    return `import React from 'react';
import styled from 'styled-components';

export interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const StyledCard = styled.div\`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
\`;

const Title = styled.h3\`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
\`;

const Description = styled.p\`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
\`;

export function Card({ title, description, children }: CardProps) {
  return (
    <StyledCard>
      {title && <Title>{title}</Title>}
      {description && <Description>{description}</Description>}
      {children}
    </StyledCard>
  );
}
`;
  }

  if (config.styling === 'css-modules') {
    return `import React from 'react';
import styles from './card.module.css';

export interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div className={\`\${styles.card} \${className ?? ''}\`}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {children}
    </div>
  );
}
`;
  }

  return `import React from 'react';

export interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div
      className={\`rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg \${className}\`}
    >
      {title && <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>}
      {description && <p className="text-sm text-slate-500 mb-4">{description}</p>}
      {children}
    </div>
  );
}
`;
}

/** packages/ui/src/components/input.tsx */
export function uiInput(config: ProjectConfig): string {
  if (config.styling === 'styled-components') {
    return `import React from 'react';
import styled from 'styled-components';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Wrapper = styled.div\`
  display: flex;
  flex-direction: column;
  gap: 4px;
\`;

const Label = styled.label\`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
\`;

const StyledInput = styled.input<{ $hasError: boolean }>\`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid \${({ $hasError }) => ($hasError ? '#ef4444' : '#d1d5db')};
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: \${({ $hasError }) => ($hasError ? '#ef4444' : '#2563eb')};
    box-shadow: 0 0 0 3px \${({ $hasError }) =>
      $hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)'};
  }
\`;

const ErrorText = styled.span\`
  font-size: 12px;
  color: #ef4444;
\`;

export function Input({ label, error, ...props }: InputProps) {
  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <StyledInput $hasError={!!error} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}
`;
  }

  if (config.styling === 'css-modules') {
    return `import React from 'react';
import styles from './input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        className={\`\${styles.input} \${error ? styles.error : ''} \${className ?? ''}\`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
`;
  }

  return `import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={\`w-full rounded-lg border px-3 py-2 text-base outline-none transition-colors focus:ring-2 \${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
        } \${className}\`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
`;
}

/** packages/ui/src/components/button.module.css (CSS Modules only) */
export function uiButtonCss(): string {
  return `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.button:hover { opacity: 0.9; transform: translateY(-1px); }
.button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.primary { background: #2563eb; color: white; }
.secondary { background: #64748b; color: white; }
.outline { background: transparent; color: #2563eb; border-color: #2563eb; }
.ghost { background: transparent; color: #374151; }

.sm { padding: 6px 12px; font-size: 14px; }
.md { padding: 8px 16px; font-size: 16px; }
.lg { padding: 12px 24px; font-size: 18px; }
`;
}

/** packages/ui/src/components/card.module.css (CSS Modules only) */
export function uiCardCss(): string {
  return `.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  transition: box-shadow 0.2s ease;
}

.card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
}
`;
}

/** packages/ui/src/components/input.module.css (CSS Modules only) */
export function uiInputCss(): string {
  return `.wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.error { border-color: #ef4444; }
.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.errorText {
  font-size: 12px;
  color: #ef4444;
}
`;
}

/** packages/ui/src/hooks/index.ts — hooks barrel */
export function uiHooksIndex(): string {
  return `export { useMediaQuery } from './use-media-query.js';
export { useDebounce } from './use-debounce.js';
`;
}

/** packages/ui/src/hooks/use-media-query.ts */
export function uiUseMediaQuery(): string {
  return `import { useState, useEffect } from 'react';

/**
 * Hook that tracks a CSS media query match state.
 *
 * @param query - CSS media query string (e.g. '(min-width: 768px)')
 * @returns Whether the media query currently matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
`;
}

/** packages/ui/src/hooks/use-debounce.ts */
export function uiUseDebounce(): string {
  return `import { useState, useEffect } from 'react';

/**
 * Hook that debounces a rapidly changing value.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default 300)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
`;
}
