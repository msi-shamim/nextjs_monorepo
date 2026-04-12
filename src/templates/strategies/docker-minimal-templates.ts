/**
 * Docker Minimal strategy — simple Dockerfiles and basic docker-compose.
 * Still adaptive to all config options, just without multi-stage builds or nginx.
 */

import type { ProjectConfig } from '../../project-config.js';
import type { DockerStrategy } from './docker-strategy.js';

/** Helper: get install command for package manager */
function installCmd(pm: string): string {
  switch (pm) {
    case 'pnpm': return 'corepack enable pnpm && pnpm install --frozen-lockfile';
    case 'yarn': return 'corepack enable yarn && yarn install --frozen-lockfile';
    case 'bun': return 'bun install --frozen-lockfile';
    default: return 'npm ci';
  }
}

function lockFile(pm: string): string {
  switch (pm) {
    case 'pnpm': return 'pnpm-lock.yaml';
    case 'yarn': return 'yarn.lock';
    case 'bun': return 'bun.lockb';
    default: return 'package-lock.json';
  }
}

export class DockerMinimalTemplateStrategy implements DockerStrategy {
  webDockerfile(config: ProjectConfig): string {
    const lock = lockFile(config.packageManager);
    const install = installCmd(config.packageManager);
    const wsFile = config.packageManager === 'pnpm' ? ' pnpm-workspace.yaml' : '';
    const buildCmd = `${config.packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm' : config.packageManager === 'bun' ? 'bun run' : 'npm run'} build --filter=@${config.name}/web`;

    let prismaGen = '';
    if (config.orm === 'prisma') {
      prismaGen = '\nRUN npx prisma generate --schema=packages/database/prisma/schema.prisma';
    }

    return `FROM node:20-alpine
WORKDIR /app
COPY package.json ${lock}${wsFile} ./
COPY . .
RUN ${install}${prismaGen}
RUN ${buildCmd}

ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
CMD ["node", "apps/web/.next/standalone/apps/web/server.js"]
`;
  }

  apiDockerfile(config: ProjectConfig): string {
    const lock = lockFile(config.packageManager);
    const install = installCmd(config.packageManager);
    const wsFile = config.packageManager === 'pnpm' ? ' pnpm-workspace.yaml' : '';
    const buildCmd = `${config.packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm' : config.packageManager === 'bun' ? 'bun run' : 'npm run'} build --filter=@${config.name}/api`;

    let prismaGen = '';
    if (config.orm === 'prisma') {
      prismaGen = '\nRUN npx prisma generate --schema=packages/database/prisma/schema.prisma';
    }

    return `FROM node:20-alpine
WORKDIR /app
COPY package.json ${lock}${wsFile} ./
COPY . .
RUN ${install}${prismaGen}
RUN ${buildCmd}

ENV NODE_ENV=production
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1
CMD ["node", "apps/api/dist/main.js"]
`;
  }

  dockerComposeProd(config: ProjectConfig): string {
    // ── API env vars ──
    let apiEnv = `      - NODE_ENV=production
      - PORT=3001`;

    const apiDependsOn: string[] = [];

    if (config.hasDatabase && config.db !== 'sqlite') {
      const dbHost = config.db === 'mongodb' ? 'mongodb' : config.db;
      apiDependsOn.push(dbHost);

      switch (config.db) {
        case 'postgres':
          apiEnv += `\n      - DATABASE_URL=postgresql://postgres:password@postgres:5432/${config.name}`;
          break;
        case 'mysql':
          apiEnv += `\n      - DATABASE_URL=mysql://root:password@mysql:3306/${config.name}`;
          break;
        case 'mongodb':
          apiEnv += `\n      - DATABASE_URL=mongodb://mongodb:27017/${config.name}`;
          break;
      }
    }

    if (config.hasCache) {
      apiDependsOn.push('redis');
      apiEnv += `\n      - REDIS_URL=redis://redis:6379`;
    }

    const apiDepsBlock = apiDependsOn.length > 0
      ? `\n    depends_on:\n${apiDependsOn.map(d => `      - ${d}`).join('\n')}`
      : '';

    let services = `  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: ${config.name}-web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on:
      - api
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: ${config.name}-api
    ports:
      - "3001:3001"
    environment:
${apiEnv}${apiDepsBlock}
    restart: unless-stopped
`;

    // DB service
    if (config.hasDatabase && config.db !== 'sqlite') {
      switch (config.db) {
        case 'postgres':
          services += `
  postgres:
    image: postgres:17-alpine
    container_name: ${config.name}-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${config.name}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
`;
          break;
        case 'mysql':
          services += `
  mysql:
    image: mysql:8.4
    container_name: ${config.name}-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: ${config.name}
      MYSQL_ROOT_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped
`;
          break;
        case 'mongodb':
          services += `
  mongodb:
    image: mongo:8
    container_name: ${config.name}-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped
`;
          break;
      }
    }

    if (config.hasCache) {
      services += `
  redis:
    image: redis:7-alpine
    container_name: ${config.name}-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
`;
    }

    // Volumes
    const volumes: string[] = [];
    if (config.db === 'postgres' && config.hasDatabase) volumes.push('postgres_data:');
    if (config.db === 'mysql' && config.hasDatabase) volumes.push('mysql_data:');
    if (config.db === 'mongodb' && config.hasDatabase) volumes.push('mongo_data:');

    let volumesBlock = '';
    if (volumes.length > 0) {
      volumesBlock = `\nvolumes:\n${volumes.map(v => `  ${v}`).join('\n')}\n`;
    }

    return `services:\n${services}${volumesBlock}`;
  }

  dockerignore(config: ProjectConfig): string {
    const lines = [
      'node_modules',
      '.next',
      'dist',
      '.git',
      '*.md',
      '.env*',
      '!.env.example',
      'coverage',
      '.turbo',
      '.vscode',
      '.idea',
      '.DS_Store',
    ];

    if (config.packageManager !== 'pnpm') lines.push('pnpm-lock.yaml');
    if (config.packageManager !== 'yarn') lines.push('yarn.lock');
    if (config.packageManager !== 'bun') lines.push('bun.lockb');
    if (config.packageManager !== 'npm') lines.push('package-lock.json');

    return lines.join('\n') + '\n';
  }

  extraFiles(_config: ProjectConfig): Record<string, string> {
    return {};
  }
}
