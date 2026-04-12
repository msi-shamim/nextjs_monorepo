/**
 * NestJS backend strategy — generates NestJS-specific backend files.
 */

import type { ProjectConfig } from '../../project-config.js';
import type { BackendStrategy } from './backend-strategy';

export class NestjsTemplateStrategy implements BackendStrategy {
  packageJson(config: ProjectConfig): string {
    return `{
  "name": "@${config.name}/api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "nest start",
    "start:prod": "node dist/main",
    "lint": "eslint src --ext .ts",
    "test": "${config.testing === 'vitest' ? 'vitest run' : 'jest'}"
  },
  "dependencies": {
    "@nestjs/common": "${config.versions['@nestjs/common'] ?? '^11.0.20'}",
    "@nestjs/core": "${config.versions['@nestjs/core'] ?? '^11.0.20'}",
    "@nestjs/platform-express": "${config.versions['@nestjs/platform-express'] ?? '^11.0.20'}",
    "reflect-metadata": "${config.versions['reflect-metadata'] ?? '^0.2.2'}",
    "rxjs": "${config.versions['rxjs'] ?? '^7.8.2'}",
    "@${config.name}/lib": "workspace:*"${config.hasDatabase ? `,\n    "@${config.name}/database": "workspace:*"` : ''}
  },
  "devDependencies": {
    "@nestjs/cli": "${config.versions['@nestjs/cli'] ?? '^11.0.5'}",
    "@nestjs/testing": "${config.versions['@nestjs/testing'] ?? '^11.0.20'}",
    "@types/node": "${config.versions['@types/node'] ?? '^22.15.3'}",
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  tsConfig(config: ProjectConfig): string {
    return `{
  "extends": "@${config.name}/config/typescript/node",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
`;
  }

  mainEntry(config: ProjectConfig): string {
    return `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(\`🚀 ${config.pascalCase} API running on http://localhost:\${port}/api\`);
}

bootstrap();
`;
  }

  appSetup(_config: ProjectConfig): string {
    return `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;
  }

  appController(_config: ProjectConfig): string {
    return `import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  getInfo() {
    return this.appService.getInfo();
  }
}
`;
  }

  appService(config: ProjectConfig): string {
    return `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getInfo() {
    return {
      name: '${config.name}',
      version: '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}
`;
  }

  exceptionFilter(): string {
    return `import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    response.status(status).json({
      success: false,
      error: {
        code: HttpStatus[status] ?? 'UNKNOWN_ERROR',
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
`;
  }

  loggingInterceptor(): string {
    return `import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        console.log(\`\${method} \${url} — \${duration}ms\`);
      }),
    );
  }
}
`;
  }

  authGuard(): string {
    return `import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    // TODO: Validate the token
    return true;
  }
}
`;
  }

  validationPipe(): string {
    return `import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          if (!details[path]) details[path] = [];
          details[path].push(issue.message);
        }
        throw new BadRequestException({
          message: 'Validation failed',
          details,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
`;
  }
}
