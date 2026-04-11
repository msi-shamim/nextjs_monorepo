/**
 * Cache templates — Redis ioredis client and service.
 */

import type { ProjectConfig } from '../project-config.js';

/** packages/cache/package.json */
export function cachePackageJson(config: ProjectConfig): string {
  return `{
  "name": "@${config.name}/cache",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./service": "./src/service.ts"
  },
  "dependencies": {
    "ioredis": "${config.versions['ioredis'] ?? '^5.6.0'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
}

/** packages/cache/tsconfig.json */
export function cacheTsConfig(config: ProjectConfig): string {
  return `{
  "extends": "@${config.name}/config/typescript/base",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "verbatimModuleSyntax": false
  },
  "include": ["src/**/*"]
}
`;
}

/** packages/cache/src/index.ts */
export function cacheIndex(): string {
  return `export { redis } from './client.js';
export { CacheService } from './service.js';
`;
}

/** packages/cache/src/client.ts */
export function cacheClient(): string {
  return `import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
`;
}

/** packages/cache/src/service.ts */
export function cacheService(): string {
  return `import { redis } from './client.js';

/** Simple cache wrapper around Redis with JSON serialization and TTL support */
export class CacheService {
  private defaultTtl: number;

  constructor(defaultTtl = 3600) {
    this.defaultTtl = defaultTtl;
  }

  /** Get a cached value by key */
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /** Set a cached value with optional TTL (seconds) */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    const expiry = ttl ?? this.defaultTtl;
    await redis.set(key, serialized, 'EX', expiry);
  }

  /** Delete a cached value */
  async del(key: string): Promise<void> {
    await redis.del(key);
  }

  /** Delete all keys matching a pattern */
  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  /** Check if a key exists */
  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1;
  }
}
`;
}
