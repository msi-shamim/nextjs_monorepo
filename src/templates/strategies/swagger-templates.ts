import type { ProjectConfig } from '../../project-config.js';
import type { ApiDocsStrategy } from './api-docs-strategy';

export class SwaggerTemplateStrategy implements ApiDocsStrategy {
  docsConfig(config: ProjectConfig): string {
    if (config.backend === 'nestjs') {
      return `import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('${config.pascalCase} API')
    .setDescription('${config.pascalCase} REST API documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
`;
    }

    // Express
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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
`;
  }

  docsSetup(config: ProjectConfig): string {
    if (config.backend === 'nestjs') {
      return `// Add to apps/api/src/main.ts:
// import { setupSwagger } from './docs/swagger-config';
// setupSwagger(app);
//
// Swagger UI will be available at: http://localhost:3001/api/docs
`;
    }

    return `import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import { swaggerSpec } from './swagger-config';

export function setupDocs(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  }));
}
`;
  }
}
