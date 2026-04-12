/**
 * Drizzle ORM strategy — generates Drizzle-specific database files.
 */

import type { ProjectConfig } from '../../project-config.js';
import type { ORMStrategy } from './orm-strategy';

export class DrizzleTemplateStrategy implements ORMStrategy {
  packageJson(config: ProjectConfig): string {
    const dbDriverDeps: Record<string, string> = {};

    switch (config.db) {
      case 'postgres':
        dbDriverDeps['pg'] = config.versions['pg'] ?? '^8.14.1';
        break;
      case 'mysql':
        dbDriverDeps['mysql2'] = config.versions['mysql2'] ?? '^3.14.0';
        break;
      case 'sqlite':
        dbDriverDeps['better-sqlite3'] = config.versions['better-sqlite3'] ?? '^11.9.1';
        break;
    }

    const driverDepsStr = Object.entries(dbDriverDeps)
      .map(([key, val]) => `    "${key}": "${val}"`)
      .join(',\n');

    const devDriverDeps = config.db === 'postgres' ? `\n    "@types/pg": "${config.versions['@types/pg'] ?? '^8.11.13'}",` : '';

    return `{
  "name": "@${config.name}/database",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx src/seed.ts",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "drizzle-orm": "${config.versions['drizzle-orm'] ?? '^0.43.1'}",
${driverDepsStr}
  },
  "devDependencies": {${devDriverDeps}
    "drizzle-kit": "${config.versions['drizzle-kit'] ?? '^0.31.1'}",
    "tsx": "^4.19.4",
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  tsConfig(config: ProjectConfig): string {
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

  index(): string {
    return `export { db } from './client';
export * from './schema/index';
`;
  }

  schemaFile(config: ProjectConfig): string {
    switch (config.db) {
      case 'postgres':
        return `import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
`;

      case 'mysql':
        return `import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
`;

      case 'sqlite':
        return `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
`;

      case 'mongodb':
        // Drizzle doesn't support MongoDB — fall back to Postgres-like schema with a note
        return `// Note: Drizzle ORM does not natively support MongoDB.
// Consider using Prisma with MongoDB, or use a Postgres/MySQL/SQLite database.
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
`;
    }
  }

  clientFile(config: ProjectConfig): string {
    switch (config.db) {
      case 'postgres':
        return `import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
`;

      case 'mysql':
        return `import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema/index';

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

export const db = drizzle(connection, { schema, mode: 'default' });
`;

      case 'sqlite':
        return `import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema/index';

const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') ?? 'dev.db');
export const db = drizzle(sqlite, { schema });
`;

      default:
        return `import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
`;
    }
  }

  seedFile(): string {
    return `import { db } from './client';
import { users } from './schema/index';

async function main() {
  console.log('🌱 Seeding database...');

  await db.insert(users).values({
    email: 'admin@example.com',
    name: 'Admin User',
  }).onConflictDoNothing();

  console.log('✅ Seed complete');
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
`;
  }

  envVars(config: ProjectConfig): string {
    switch (config.db) {
      case 'postgres':
        return `DATABASE_URL="postgresql://postgres:password@localhost:5432/${config.name}?schema=public"`;
      case 'mysql':
        return `DATABASE_URL="mysql://root:password@localhost:3306/${config.name}"`;
      case 'sqlite':
        return `DATABASE_URL="file:./dev.db"`;
      case 'mongodb':
        return `DATABASE_URL="mongodb://localhost:27017/${config.name}"`;
    }
  }
}
