/**
 * Lib package templates — shared types, utils, constants, and Zod validators.
 */

import type { ProjectConfig } from '../project-config.js';

/** packages/lib/package.json */
export function libPackageJson(config: ProjectConfig): string {
  return `{
  "name": "@${config.name}/lib",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./utils": "./src/utils/index.ts",
    "./constants": "./src/constants/index.ts",
    "./validators": "./src/validators/index.ts"
  },
  "dependencies": {
    "zod": "${config.versions['zod'] ?? '^3.24.3'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
}

/** packages/lib/tsconfig.json */
export function libTsConfig(): string {
  return `{
  "extends": "@${'{name}'}/config/typescript/base",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
`;
}

/** packages/lib/src/index.ts — barrel export */
export function libIndex(): string {
  return `export * from './types/index';
export * from './utils/index';
export * from './constants/index';
export * from './validators/index';
`;
}

/** packages/lib/src/types/index.ts — shared type definitions */
export function libTypes(): string {
  return `/**
 * Shared TypeScript types used across the monorepo.
 */

/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/** Paginated API response */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/** API error response */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

/** Result type for operations that can succeed or fail */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/** Helper to create a success result */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Helper to create a failure result */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Pagination query parameters */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Base entity with common fields */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
`;
}

/** packages/lib/src/utils/index.ts — shared utility functions */
export function libUtils(): string {
  return `/**
 * Shared utility functions used across the monorepo.
 */

/** Format a date to a locale-aware string */
export function formatDate(date: Date | string, locale = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Delay execution for the specified milliseconds */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Safely parse JSON, returning null on failure */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/** Generate a URL-friendly slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '')
    .replace(/[\\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/** Truncate a string to the specified length with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/** Remove undefined and null values from an object */
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value != null),
  ) as Partial<T>;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
`;
}

/** packages/lib/src/constants/index.ts — shared constants */
export function libConstants(): string {
  return `/**
 * Shared constants used across the monorepo.
 */

/** HTTP status codes */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/** Default pagination values */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** Common regex patterns */
export const Patterns = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;
`;
}

/** packages/lib/src/validators/index.ts — shared Zod schemas */
export function libValidators(): string {
  return `/**
 * Shared Zod validation schemas used across the monorepo.
 */

import { z } from 'zod';

/** Email address validator */
export const emailSchema = z.string().email('Invalid email address').trim().toLowerCase();

/** Non-empty string validator */
export const requiredString = z.string().trim().min(1, 'This field is required');

/** Pagination query schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/** UUID validator */
export const uuidSchema = z.string().uuid('Invalid ID format');

/** Slug validator */
export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

export type PaginationInput = z.infer<typeof paginationSchema>;
`;
}
