import type { ApiStyle, Backend } from '../../project-config.js';
import type { ApiStyleStrategy } from './api-style-strategy.js';
import { GraphqlNestjsTemplateStrategy } from './graphql-nestjs-templates.js';
import { GraphqlExpressTemplateStrategy } from './graphql-express-templates.js';
import { TrpcNestjsTemplateStrategy } from './trpc-nestjs-templates.js';
import { TrpcExpressTemplateStrategy } from './trpc-express-templates.js';

/** Factory takes both apiStyle and backend since implementations differ per backend */
export function createApiStyleStrategy(apiStyle: ApiStyle, backend: Backend): ApiStyleStrategy | null {
  switch (apiStyle) {
    case 'graphql':
      return backend === 'nestjs'
        ? new GraphqlNestjsTemplateStrategy()
        : new GraphqlExpressTemplateStrategy();
    case 'trpc':
      return backend === 'nestjs'
        ? new TrpcNestjsTemplateStrategy()
        : new TrpcExpressTemplateStrategy();
    case 'rest':
      return null;
  }
}
