import type { ProjectConfig } from '../../project-config.js';
import type { DockerStrategy } from './docker-strategy.js';

export class DockerFullTemplateStrategy implements DockerStrategy {
  webDockerfile(config: ProjectConfig): string {
    return `# ── Stage 1: Dependencies ──
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ${config.packageManager === 'pnpm' ? 'pnpm-lock.yaml pnpm-workspace.yaml' : 'package-lock.json'} ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/lib/package.json ./packages/lib/
COPY packages/config/package.json ./packages/config/
${config.packageManager === 'pnpm' ? 'RUN corepack enable pnpm && pnpm install --frozen-lockfile' : 'RUN npm ci'}

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${config.packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm' : 'npm run'} build --filter=@${config.name}/web

# ── Stage 3: Runner ──
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
`;
  }

  apiDockerfile(config: ProjectConfig): string {
    return `# ── Stage 1: Dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ${config.packageManager === 'pnpm' ? 'pnpm-lock.yaml pnpm-workspace.yaml' : 'package-lock.json'} ./
COPY apps/api/package.json ./apps/api/
COPY packages/lib/package.json ./packages/lib/
COPY packages/config/package.json ./packages/config/
${config.hasDatabase ? `COPY packages/database/package.json ./packages/database/` : ''}
${config.packageManager === 'pnpm' ? 'RUN corepack enable pnpm && pnpm install --frozen-lockfile' : 'RUN npm ci'}

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${config.packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm' : 'npm run'} build --filter=@${config.name}/api

# ── Stage 3: Runner ──
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
${config.orm === 'prisma' ? 'COPY --from=builder /app/packages/database/prisma ./prisma' : ''}

USER appuser
EXPOSE 3001
ENV PORT=3001
CMD ["node", "dist/main.js"]
`;
  }

  dockerComposeProd(config: ProjectConfig): string {
    let services = `  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
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
    ports:
      - "3001:3001"
    env_file:
      - .env
    restart: unless-stopped
`;

    if (config.hasDatabase && config.db !== 'sqlite') {
      services += `    depends_on:
      - db
`;
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

    services += `
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - web
      - api
    restart: unless-stopped
`;

    return `services:
${services}`;
  }

  dockerignore(_config: ProjectConfig): string {
    return `node_modules
.next
dist
.git
.gitignore
*.md
.env*
!.env.example
coverage
.turbo
`;
  }

  extraFiles(_config: ProjectConfig): Record<string, string> {
    return {
      'nginx/nginx.conf': `events {
  worker_connections 1024;
}

http {
  upstream web {
    server web:3000;
  }

  upstream api {
    server api:3001;
  }

  server {
    listen 80;
    server_name localhost;

    location / {
      proxy_pass http://web;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
      proxy_pass http://api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
`,
      'nginx/Dockerfile': `FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`,
    };
  }
}
