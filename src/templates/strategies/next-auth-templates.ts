/**
 * NextAuth.js strategy — generates NextAuth v5 configuration files.
 */

import type { ProjectConfig } from '../../project-config.js';
import type { AuthStrategy } from './auth-strategy.js';

export class NextAuthTemplateStrategy implements AuthStrategy {
  apiRoute(): string {
    return `import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
`;
  }

  authConfig(config: ProjectConfig): string {
    let adapterImport = '';
    let adapterConfig = '';

    if (config.orm === 'prisma') {
      adapterImport = `import { PrismaAdapter } from '@auth/prisma-adapter';\nimport { db } from '@${config.name}/database';`;
      adapterConfig = `\n  adapter: PrismaAdapter(db),`;
    } else if (config.orm === 'drizzle') {
      adapterImport = `import { DrizzleAdapter } from '@auth/drizzle-adapter';\nimport { db } from '@${config.name}/database';`;
      adapterConfig = `\n  adapter: DrizzleAdapter(db),`;
    }

    return `import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
${adapterImport}

export const authConfig: NextAuthConfig = {${adapterConfig}
  providers: [
    // Add your providers here, e.g.:
    // GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET }),
    // Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }),
  ],
  session: {
    strategy: '${config.orm !== 'none' ? 'database' : 'jwt'}',
  },
  pages: {
    signIn: '/auth/signin',
    // signOut: '/auth/signout',
    // error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith('/dashboard');

      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
`;
  }

  middleware(): string {
    return `export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser icon)
     * - public files (public folder)
     * - api/auth (auth endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
};
`;
  }

  types(): string {
    return `import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
`;
  }
}
