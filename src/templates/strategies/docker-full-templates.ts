/**
 * Docker Full strategy — multi-stage Dockerfiles, production docker-compose
 * with nginx reverse proxy, health checks, and fully adaptive to all config options.
 */

import type { ProjectConfig } from '../../project-config.js';
import type { DockerStrategy } from './docker-strategy.js';

/** Helper: get lock file name for package manager */
function lockFile(pm: string): string {
  switch (pm) {
    case 'pnpm': return 'pnpm-lock.yaml';
    case 'yarn': return 'yarn.lock';
    case 'bun': return 'bun.lockb';
    default: return 'package-lock.json';
  }
}

/** Helper: get install command for package manager */
function installCmd(pm: string): string {
  switch (pm) {
    case 'pnpm': return 'corepack enable pnpm && pnpm install --frozen-lockfile';
    case 'yarn': return 'corepack enable yarn && yarn install --frozen-lockfile';
    case 'bun': return 'bun install --frozen-lockfile';
    default: return 'npm ci';
  }
}

/** Helper: build workspace package COPY lines based on config */
function packageCopyLines(config: ProjectConfig, indent: string): string {
  const lines = [
    `${indent}COPY packages/ui/package.json ./packages/ui/`,
    `${indent}COPY packages/lib/package.json ./packages/lib/`,
    `${indent}COPY packages/config/package.json ./packages/config/`,
  ];
  if (config.hasDatabase) lines.push(`${indent}COPY packages/database/package.json ./packages/database/`);
  if (config.hasCache) lines.push(`${indent}COPY packages/cache/package.json ./packages/cache/`);
  if (config.hasEmail) lines.push(`${indent}COPY packages/email/package.json ./packages/email/`);
  if (config.hasStorage) lines.push(`${indent}COPY packages/storage/package.json ./packages/storage/`);
  if (config.hasPayments) lines.push(`${indent}COPY packages/payments/package.json ./packages/payments/`);
  return lines.join('\n');
}

export class DockerFullTemplateStrategy implements DockerStrategy {
  webDockerfile(config: ProjectConfig): string {
    const lock = lockFile(config.packageManager);
    const install = installCmd(config.packageManager);
    const wsFile = config.packageManager === 'pnpm' ? ' pnpm-workspace.yaml' : '';

    let prismaGenerate = '';
    if (config.orm === 'prisma') {
      prismaGenerate = '\nRUN npx prisma generate --schema=packages/database/prisma/schema.prisma';
    }

    let copyMessages = '';
    if (config.hasI18n) {
      copyMessages = '\nCOPY apps/web/messages ./apps/web/messages';
    }

    return `# ── Stage 1: Dependencies ──
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ${lock}${wsFile} ./
COPY apps/web/package.json ./apps/web/
${packageCopyLines(config, '')}
RUN ${install}${prismaGenerate}

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/
COPY . .${copyMessages}
ENV NEXT_TELEMETRY_DISABLED=1
RUN ${config.packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm' : config.packageManager === 'bun' ? 'bun run' : 'npm run'} build --filter=@${config.name}/web

# ── Stage 3: Runner ──
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "apps/web/server.js"]
`;
  }

  apiDockerfile(config: ProjectConfig): string {
    const lock = lockFile(config.packageManager);
    const install = installCmd(config.packageManager);
    const wsFile = config.packageManager === 'pnpm' ? ' pnpm-workspace.yaml' : '';

    const buildCmd = config.backend === 'nestjs'
      ? `${config.packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm' : config.packageManager === 'bun' ? 'bun run' : 'npm run'} build --filter=@${config.name}/api`
      : `${config.packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm' : config.packageManager === 'bun' ? 'bun run' : 'npm run'} build --filter=@${config.name}/api`;

    let prismaSteps = '';
    if (config.orm === 'prisma') {
      prismaSteps = '\nRUN npx prisma generate --schema=packages/database/prisma/schema.prisma';
    }

    let copyPrismaToRunner = '';
    if (config.orm === 'prisma') {
      copyPrismaToRunner = '\nCOPY --from=builder /app/packages/database/prisma ./prisma\nCOPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma\nCOPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma';
    }

    return `# ── Stage 1: Dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json ${lock}${wsFile} ./
COPY apps/api/package.json ./apps/api/
${packageCopyLines(config, '')}
RUN ${install}${prismaSteps}

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${buildCmd}

# ── Stage 3: Runner ──
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules${copyPrismaToRunner}

USER appuser
EXPOSE 3001
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "dist/main.js"]
`;
  }

  dockerComposeProd(config: ProjectConfig): string {
    // ── Web service ──
    let webEnv = `      - NEXT_PUBLIC_API_URL=http://api:3001`;

    // ── API service ──
    let apiEnv = `      - NODE_ENV=production
      - PORT=3001
      - CORS_ORIGIN=http://localhost`;

    const apiDependsOn: string[] = [];

    // Database
    if (config.hasDatabase && config.db !== 'sqlite') {
      apiDependsOn.push(config.db === 'mongodb' ? 'mongodb' : config.db);

      switch (config.db) {
        case 'postgres':
          apiEnv += `\n      - DATABASE_URL=postgresql://postgres:password@postgres:5432/${config.name}?schema=public`;
          break;
        case 'mysql':
          apiEnv += `\n      - DATABASE_URL=mysql://root:password@mysql:3306/${config.name}`;
          break;
        case 'mongodb':
          apiEnv += `\n      - DATABASE_URL=mongodb://mongodb:27017/${config.name}`;
          break;
      }
    }
    if (config.hasDatabase && config.db === 'sqlite') {
      apiEnv += `\n      - DATABASE_URL=file:./data/dev.db`;
    }

    // Cache
    if (config.hasCache) {
      apiDependsOn.push('redis');
      apiEnv += `\n      - REDIS_URL=redis://redis:6379`;
    }

    // Auth
    if (config.auth === 'next-auth') {
      apiEnv += `\n      - AUTH_SECRET=\${AUTH_SECRET:-change-me-in-production}`;
    } else if (config.auth === 'custom') {
      apiEnv += `\n      - JWT_SECRET=\${JWT_SECRET:-change-me-in-production}`;
    }

    // Email
    if (config.email === 'resend') apiEnv += `\n      - RESEND_API_KEY=\${RESEND_API_KEY}`;
    if (config.email === 'nodemailer') {
      apiEnv += `\n      - SMTP_HOST=\${SMTP_HOST:-smtp.gmail.com}`;
      apiEnv += `\n      - SMTP_PORT=\${SMTP_PORT:-587}`;
      apiEnv += `\n      - SMTP_USER=\${SMTP_USER}`;
      apiEnv += `\n      - SMTP_PASS=\${SMTP_PASS}`;
    }
    if (config.email === 'sendgrid') apiEnv += `\n      - SENDGRID_API_KEY=\${SENDGRID_API_KEY}`;

    // Storage
    if (config.storage === 's3') {
      apiEnv += `\n      - AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID}`;
      apiEnv += `\n      - AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY}`;
      apiEnv += `\n      - AWS_REGION=\${AWS_REGION:-us-east-1}`;
      apiEnv += `\n      - S3_BUCKET=\${S3_BUCKET:-uploads}`;
    }
    if (config.storage === 'uploadthing') apiEnv += `\n      - UPLOADTHING_SECRET=\${UPLOADTHING_SECRET}`;
    if (config.storage === 'cloudinary') {
      apiEnv += `\n      - CLOUDINARY_CLOUD_NAME=\${CLOUDINARY_CLOUD_NAME}`;
      apiEnv += `\n      - CLOUDINARY_API_KEY=\${CLOUDINARY_API_KEY}`;
      apiEnv += `\n      - CLOUDINARY_API_SECRET=\${CLOUDINARY_API_SECRET}`;
    }

    // Payments
    if (config.payments === 'stripe') {
      apiEnv += `\n      - STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY}`;
      apiEnv += `\n      - STRIPE_WEBHOOK_SECRET=\${STRIPE_WEBHOOK_SECRET}`;
    }
    if (config.payments === 'lemonsqueezy') {
      apiEnv += `\n      - LEMONSQUEEZY_API_KEY=\${LEMONSQUEEZY_API_KEY}`;
      apiEnv += `\n      - LEMONSQUEEZY_WEBHOOK_SECRET=\${LEMONSQUEEZY_WEBHOOK_SECRET}`;
    }
    if (config.payments === 'paddle') {
      apiEnv += `\n      - PADDLE_API_KEY=\${PADDLE_API_KEY}`;
      apiEnv += `\n      - PADDLE_WEBHOOK_SECRET=\${PADDLE_WEBHOOK_SECRET}`;
    }

    const apiDepsBlock = apiDependsOn.length > 0
      ? `\n    depends_on:\n${apiDependsOn.map(d => `      ${d}:\n        condition: service_healthy`).join('\n')}`
      : '';

    // ── Build services string ──
    let services = `  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: ${config.name}-web
    ports:
      - "3000:3000"
    environment:
${webEnv}
    depends_on:
      api:
        condition: service_started
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

    // ── Database service ──
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
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
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
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
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
`;
          break;
      }
    }

    // ── Redis service ──
    if (config.hasCache) {
      services += `
  redis:
    image: redis:7-alpine
    container_name: ${config.name}-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
`;
    }

    // ── Nginx service ──
    services += `
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: ${config.name}-nginx
    ports:
      - "80:80"
    depends_on:
      - web
      - api
    restart: unless-stopped
`;

    // ── Volumes ──
    const volumes: string[] = [];
    if (config.hasDatabase) {
      if (config.db === 'postgres') volumes.push('postgres_data:');
      if (config.db === 'mysql') volumes.push('mysql_data:');
      if (config.db === 'mongodb') volumes.push('mongo_data:');
    }
    if (config.hasCache) volumes.push('redis_data:');

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
      '.gitignore',
      '*.md',
      '!README.md',
      '.env*',
      '!.env.example',
      'coverage',
      '.turbo',
      '.vscode',
      '.idea',
      '*.swp',
      '*.swo',
      '.DS_Store',
      'Thumbs.db',
      '*.tgz',
      'npm-debug.log*',
      'pnpm-debug.log*',
    ];

    // Ignore other package managers' lock files
    if (config.packageManager !== 'pnpm') lines.push('pnpm-lock.yaml', 'pnpm-workspace.yaml');
    if (config.packageManager !== 'yarn') lines.push('yarn.lock', '.yarnrc.yml');
    if (config.packageManager !== 'bun') lines.push('bun.lockb');
    if (config.packageManager !== 'npm') lines.push('package-lock.json');

    // Storybook
    if (config.storybook) lines.push('storybook-static');

    // E2E artifacts
    if (config.hasE2e) {
      lines.push('playwright-report', 'test-results', 'cypress/videos', 'cypress/screenshots');
    }

    return lines.join('\n') + '\n';
  }

  extraFiles(config: ProjectConfig): Record<string, string> {
    // ── nginx.conf ──
    let apiLocations = `    location /api/ {
      proxy_pass http://api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }`;

    // GraphQL endpoint
    if (config.apiStyle === 'graphql') {
      apiLocations += `

    location /graphql {
      proxy_pass http://api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      # WebSocket support for subscriptions
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }`;
    }

    // tRPC endpoint
    if (config.apiStyle === 'trpc') {
      apiLocations += `

    location /api/trpc/ {
      proxy_pass http://api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      # WebSocket support
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }`;
    }

    // API docs endpoint
    if (config.hasApiDocs) {
      apiLocations += `

    location /api/docs {
      proxy_pass http://api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }`;
    }

    const nginxConf = `events {
  worker_connections 1024;
}

http {
  upstream web {
    server web:3000;
  }

  upstream api {
    server api:3001;
  }

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
  gzip_min_length 1000;

  server {
    listen 80;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Health check
    location /nginx-health {
      return 200 'ok';
      add_header Content-Type text/plain;
    }

    # Frontend
    location / {
      proxy_pass http://web;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      # Next.js HMR WebSocket
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }

    # Backend API
${apiLocations}
  }
}
`;

    return {
      'nginx/nginx.conf': nginxConf,
      'nginx/Dockerfile': `FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost/nginx-health || exit 1
CMD ["nginx", "-g", "daemon off;"]
`,
    };
  }
}
