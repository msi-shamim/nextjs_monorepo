/**
 * Express backend strategy — generates Express.js-specific backend files.
 */

import type { ProjectConfig } from '../../project-config.js';
import type { BackendStrategy } from './backend-strategy.js';

export class ExpressTemplateStrategy implements BackendStrategy {
  packageJson(config: ProjectConfig): string {
    return `{
  "name": "@${config.name}/api",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/main.ts",
    "start": "node dist/main.js",
    "lint": "eslint src --ext .ts",
    "test": "${config.testing === 'vitest' ? 'vitest run' : 'jest'}"
  },
  "dependencies": {
    "express": "${config.versions['express'] ?? '^5.1.0'}",
    "cors": "${config.versions['cors'] ?? '^2.8.5'}",
    "@${config.name}/lib": "workspace:*"${config.hasDatabase ? `,\n    "@${config.name}/database": "workspace:*"` : ''}
  },
  "devDependencies": {
    "@types/express": "${config.versions['@types/express'] ?? '^5.0.2'}",
    "@types/cors": "${config.versions['@types/cors'] ?? '^2.8.17'}",
    "@types/node": "${config.versions['@types/node'] ?? '^22.15.3'}",
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
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
`;
  }

  mainEntry(config: ProjectConfig): string {
    return `import { createApp } from './app.js';

const port = process.env.PORT ?? 3001;

const app = createApp();

app.listen(port, () => {
  console.log(\`🚀 ${config.pascalCase} API running on http://localhost:\${port}/api\`);
});
`;
  }

  appSetup(_config: ProjectConfig): string {
    return `import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './common/filters/error-handler.js';
import { requestLogger } from './common/interceptors/request-logger.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Routes
  app.use('/api', healthRouter);

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
`;
  }

  appController(config: ProjectConfig): string {
    return `import { Router } from 'express';
import { AppService } from '../services/app.service.js';

export const healthRouter = Router();
const appService = new AppService('${config.name}');

healthRouter.get('/health', (_req, res) => {
  res.json(appService.getHealth());
});

healthRouter.get('/', (_req, res) => {
  res.json(appService.getInfo());
});
`;
  }

  appService(_config: ProjectConfig): string {
    return `export class AppService {
  constructor(private readonly appName: string) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getInfo() {
    return {
      name: this.appName,
      version: '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}
`;
  }

  exceptionFilter(): string {
    return `import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message || 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
}
`;
  }

  loggingInterceptor(): string {
    return `import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(\`\${req.method} \${req.originalUrl} \${res.statusCode} — \${duration}ms\`);
  });

  next();
}
`;
  }

  authGuard(): string {
    return `import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../filters/error-handler.js';

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Missing or invalid authorization header', 'UNAUTHORIZED'));
  }

  // TODO: Validate the token
  next();
}
`;
  }

  validationPipe(): string {
    return `import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../filters/error-handler.js';

/**
 * Creates Express middleware that validates the request body against a Zod schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!details[path]) details[path] = [];
        details[path].push(issue.message);
      }
      return next(new AppError(422, 'Validation failed', 'VALIDATION_ERROR'));
    }

    req.body = result.data;
    next();
  };
}
`;
  }
}
