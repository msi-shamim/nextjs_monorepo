import type { ApiDocs } from '../../project-config.js';
import type { ApiDocsStrategy } from './api-docs-strategy.js';
import { SwaggerTemplateStrategy } from './swagger-templates.js';
import { RedocTemplateStrategy } from './redoc-templates.js';

export function createApiDocsStrategy(apiDocs: ApiDocs): ApiDocsStrategy | null {
  switch (apiDocs) {
    case 'swagger':
      return new SwaggerTemplateStrategy();
    case 'redoc':
      return new RedocTemplateStrategy();
    case 'none':
      return null;
  }
}
