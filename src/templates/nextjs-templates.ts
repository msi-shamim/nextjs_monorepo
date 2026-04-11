/**
 * Next.js 15 App Router templates — layout, pages, config, and app-specific files.
 */

import type { ProjectConfig } from '../project-config.js';

/** apps/web/package.json */
export function webPackageJson(config: ProjectConfig): string {
  const deps: Record<string, string> = {
    next: config.versions['next'] ?? '^15.3.1',
    react: config.versions['react'] ?? '^19.1.0',
    'react-dom': config.versions['react-dom'] ?? '^19.1.0',
    [`@${config.name}/ui`]: 'workspace:*',
    [`@${config.name}/lib`]: 'workspace:*',
  };

  // State management dependency
  if (config.state === 'zustand') deps['zustand'] = config.versions['zustand'] ?? '^5.0.3';
  if (config.state === 'jotai') deps['jotai'] = config.versions['jotai'] ?? '^2.12.3';
  if (config.state === 'redux') {
    deps['@reduxjs/toolkit'] = config.versions['@reduxjs/toolkit'] ?? '^2.7.0';
    deps['react-redux'] = config.versions['react-redux'] ?? '^9.2.0';
  }
  if (config.state === 'tanstack-query')
    deps['@tanstack/react-query'] = config.versions['@tanstack/react-query'] ?? '^5.74.4';

  // Auth dependency
  if (config.auth === 'next-auth') deps['next-auth'] = config.versions['next-auth'] ?? '^5.0.0-beta.25';

  // Styled components
  if (config.styling === 'styled-components')
    deps['styled-components'] = config.versions['styled-components'] ?? '^6.1.18';

  const devDeps: Record<string, string> = {
    '@types/react': config.versions['@types/react'] ?? '^19.1.2',
    '@types/react-dom': config.versions['@types/react-dom'] ?? '^19.1.2',
    '@types/node': config.versions['@types/node'] ?? '^22.15.3',
    typescript: config.versions['typescript'] ?? '^5.8.3',
    [`@${config.name}/config`]: 'workspace:*',
  };

  if (config.usesTailwind) {
    devDeps['tailwindcss'] = config.versions['tailwindcss'] ?? '^4.1.4';
    devDeps['@tailwindcss/postcss'] = config.versions['@tailwindcss/postcss'] ?? '^4.1.4';
    devDeps['postcss'] = config.versions['postcss'] ?? '^8.5.3';
    devDeps['autoprefixer'] = config.versions['autoprefixer'] ?? '^10.4.21';
  }

  return `{
  "name": "@${config.name}/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "${config.testing === 'vitest' ? 'vitest run' : 'jest'}"
  },
  "dependencies": ${JSON.stringify(deps, null, 4)},
  "devDependencies": ${JSON.stringify(devDeps, null, 4)}
}
`;
}

/** apps/web/tsconfig.json */
export function webTsConfig(config: ProjectConfig): string {
  return `{
  "extends": "@${config.name}/config/typescript/nextjs",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;
}

/** apps/web/next.config.ts */
export function nextConfig(config: ProjectConfig): string {
  return `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@${config.name}/ui', '@${config.name}/lib'],
  reactStrictMode: true,
};

export default nextConfig;
`;
}

/** apps/web/postcss.config.mjs (Tailwind only) */
export function postcssConfig(): string {
  return `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
`;
}

/** apps/web/app/globals.css */
export function globalsCss(config: ProjectConfig): string {
  if (config.usesTailwind) {
    return `@import "tailwindcss";

:root {
  --foreground: #171717;
  --background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground: #ededed;
    --background: #0a0a0a;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Inter, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;
  }

  return `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --foreground: #171717;
  --background: #ffffff;
  --brand-500: #3b82f6;
  --brand-600: #2563eb;
  --brand-700: #1d4ed8;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;
  --radius: 8px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground: #ededed;
    --background: #0a0a0a;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Inter, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--brand-600);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`;
}

/** apps/web/app/layout.tsx */
export function rootLayout(config: ProjectConfig): string {
  const imports: string[] = [];
  let providers = '{children}';

  imports.push(`import type { Metadata } from 'next';`);
  imports.push(`import './globals.css';`);

  // State management providers
  if (config.state === 'redux') {
    imports.push(`import { StoreProvider } from '@/lib/store/provider';`);
    providers = `<StoreProvider>{children}</StoreProvider>`;
  }
  if (config.state === 'tanstack-query') {
    imports.push(`import { QueryProvider } from '@/lib/query/provider';`);
    providers = `<QueryProvider>{children}</QueryProvider>`;
  }

  return `${imports.join('\n')}

export const metadata: Metadata = {
  title: '${config.pascalCase}',
  description: 'Built with Next.js 15, Turborepo, and ${config.backend === 'nestjs' ? 'NestJS' : 'Express'}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        ${providers}
      </body>
    </html>
  );
}
`;
}

/** apps/web/app/page.tsx */
export function homePage(config: ProjectConfig): string {
  const buttonImport = `import { Button, Card } from '@${config.name}/ui';`;

  if (config.usesTailwind) {
    return `${buttonImport}

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold text-slate-900">
          ${config.pascalCase}
        </h1>
        <p className="text-xl text-slate-500">
          Production-ready monorepo with Next.js 15, ${config.backend === 'nestjs' ? 'NestJS' : 'Express'}, and Turborepo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <Card
            title="Frontend"
            description="Next.js 15 with App Router and ${config.styling === 'tailwind' ? 'Tailwind CSS' : config.styling === 'css-modules' ? 'CSS Modules' : 'Styled Components'}"
          />
          <Card
            title="Backend"
            description="${config.backend === 'nestjs' ? 'NestJS' : 'Express'} REST API${config.hasDatabase ? ' with ' + (config.orm === 'prisma' ? 'Prisma' : 'Drizzle') : ''}"
          />
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Button variant="primary" size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Documentation
          </Button>
        </div>
      </div>
    </main>
  );
}
`;
  }

  // CSS Modules / Styled Components / plain CSS
  return `${buttonImport}

export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '42rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>
          ${config.pascalCase}
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>
          Production-ready monorepo with Next.js 15, ${config.backend === 'nestjs' ? 'NestJS' : 'Express'}, and Turborepo.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Card
            title="Frontend"
            description="Next.js 15 with App Router and ${config.styling === 'css-modules' ? 'CSS Modules' : 'Styled Components'}"
          />
          <Card
            title="Backend"
            description="${config.backend === 'nestjs' ? 'NestJS' : 'Express'} REST API${config.hasDatabase ? ' with ' + (config.orm === 'prisma' ? 'Prisma' : 'Drizzle') : ''}"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button variant="primary" size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Documentation
          </Button>
        </div>
      </div>
    </main>
  );
}
`;
}

/** apps/web/app/not-found.tsx */
export function notFoundPage(config: ProjectConfig): string {
  if (config.usesTailwind) {
    return `import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-xl text-slate-500 mb-8">Page not found</p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Home
      </Link>
    </main>
  );
}
`;
  }

  return `import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>Page not found</p>
      <Link href="/" style={{
        padding: '12px 24px',
        background: '#2563eb',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
      }}>
        Go Home
      </Link>
    </main>
  );
}
`;
}

/** apps/web/app/error.tsx */
export function errorPage(): string {
  return `'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Something went wrong
      </h1>
      <button
        onClick={reset}
        style={{
          padding: '12px 24px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Try again
      </button>
    </main>
  );
}
`;
}

/** apps/web/app/loading.tsx */
export function loadingPage(): string {
  return `export default function Loading() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>
    </main>
  );
}
`;
}
