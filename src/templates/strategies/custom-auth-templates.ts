/**
 * Custom JWT auth strategy — generates custom authentication files.
 */

import type { AuthStrategy } from './auth-strategy';

export class CustomAuthTemplateStrategy implements AuthStrategy {
  apiRoute(): string {
    return `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Email and password are required' } },
        { status: 400 },
      );
    }

    // TODO: Validate credentials against your database
    // const user = await db.user.findUnique({ where: { email } });
    // if (!user || !await bcrypt.compare(password, user.passwordHash)) { ... }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const response = await fetch(\`\${apiUrl}/api/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_ERROR', message: 'Authentication failed' } },
      { status: 500 },
    );
  }
}
`;
  }

  authConfig(): string {
    return `/**
 * Custom auth configuration.
 * Handles JWT token creation, validation, and refresh.
 */

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export const authConfig = {
  secret: JWT_SECRET,
  expiresIn: JWT_EXPIRES_IN,
  cookieName: 'auth-token',
  secureCookies: process.env.NODE_ENV === 'production',
} as const;

/** Parse the authorization header to extract the Bearer token */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
`;
  }

  middleware(): string {
    return `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard'];
const authPaths = ['/auth/signin', '/auth/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
`;
  }

  types(): string {
    return `/** JWT payload structure */
export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  iat: number;
  exp: number;
}

/** Authenticated user from token */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

/** Auth session state for the frontend */
export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
`;
  }
}
