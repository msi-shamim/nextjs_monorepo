import type { ProjectConfig } from '../../project-config.js';
import type { ApiDocsStrategy } from './api-docs-strategy.js';

export class RedocTemplateStrategy implements ApiDocsStrategy {
  docsConfig(config: ProjectConfig): string {
    if (config.backend === 'nestjs') {
      return `import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function getOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('${config.pascalCase} API')
    .setDescription('${config.pascalCase} REST API documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, config);
}
`;
    }

    return `import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '${config.pascalCase} API',
      description: '${config.pascalCase} REST API documentation',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
`;
  }

  docsSetup(config: ProjectConfig): string {
    if (config.backend === 'nestjs') {
      return `import type { INestApplication } from '@nestjs/common';
import redoc from 'redoc-express';
import { getOpenApiDocument } from './swagger-config.js';

export function setupDocs(app: INestApplication) {
  const httpAdapter = app.getHttpAdapter();
  const document = getOpenApiDocument(app);

  httpAdapter.get('/api/docs/openapi.json', (_req: any, res: any) => {
    res.json(document);
  });

  httpAdapter.use(
    '/api/docs',
    redoc({
      title: '${config.pascalCase} API',
      specUrl: '/api/docs/openapi.json',
    }),
  );
}
`;
    }

    return `import redoc from 'redoc-express';
import type { Express } from 'express';
import { swaggerSpec } from './swagger-config.js';

export function setupDocs(app: Express) {
  app.get('/api/docs/openapi.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use(
    '/api/docs',
    redoc({
      title: '${config.pascalCase} API',
      specUrl: '/api/docs/openapi.json',
    }),
  );
}
`;
  }
}
