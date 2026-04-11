import type { ProjectConfig } from '../../project-config.js';
import type { DockerStrategy } from './docker-strategy.js';

export class DockerMinimalTemplateStrategy implements DockerStrategy {
  webDockerfile(config: ProjectConfig): string {
    return `FROM node:20-alpine
WORKDIR /app
COPY . .
${config.packageManager === 'pnpm' ? 'RUN corepack enable pnpm && pnpm install --frozen-lockfile' : 'RUN npm ci'}
RUN ${config.packageManager === 'pnpm' ? 'pnpm' : 'npm run'} build --filter=@${config.name}/web
EXPOSE 3000
CMD ["node", "apps/web/.next/standalone/apps/web/server.js"]
`;
  }

  apiDockerfile(config: ProjectConfig): string {
    return `FROM node:20-alpine
WORKDIR /app
COPY . .
${config.packageManager === 'pnpm' ? 'RUN corepack enable pnpm && pnpm install --frozen-lockfile' : 'RUN npm ci'}
RUN ${config.packageManager === 'pnpm' ? 'pnpm' : 'npm run'} build --filter=@${config.name}/api
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
`;
  }

  dockerComposeProd(_config: ProjectConfig): string {
    return `services:
  web:
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
  }

  dockerignore(_config: ProjectConfig): string {
    return `node_modules
.next
dist
.git
*.md
.env*
!.env.example
coverage
.turbo
`;
  }

  extraFiles(_config: ProjectConfig): Record<string, string> {
    return {};
  }
}
