/**
 * Prisma ORM strategy — generates Prisma-specific database files.
 */

import type { ProjectConfig } from '../../project-config.js';
import type { ORMStrategy } from './orm-strategy';

export class PrismaTemplateStrategy implements ORMStrategy {
  packageJson(config: ProjectConfig): string {
    return `{
  "name": "@${config.name}/database",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx src/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "${config.versions['@prisma/client'] ?? '^6.6.0'}"
  },
  "devDependencies": {
    "prisma": "${config.versions['prisma'] ?? '^6.6.0'}",
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
`;
  }

  schemaFile(config: ProjectConfig): string {
    let datasource = '';
    switch (config.db) {
      case 'postgres':
        datasource = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;
        break;
      case 'mysql':
        datasource = `datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}`;
        break;
      case 'sqlite':
        datasource = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;
        break;
      case 'mongodb':
        datasource = `datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}`;
        break;
    }

    const idField = config.db === 'mongodb'
      ? `id    String @id @default(auto()) @map("_id") @db.ObjectId`
      : `id        String   @id @default(cuid())`;

    return `generator client {
  provider = "prisma-client-js"
}

${datasource}

model User {
  ${idField}
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
`;
  }

  clientFile(): string {
    return `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
`;
  }

  seedFile(): string {
    return `import { db } from './client';

async function main() {
  console.log('🌱 Seeding database...');

  const user = await db.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  });

  console.log('Created user:', user.email);
  console.log('✅ Seed complete');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
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
