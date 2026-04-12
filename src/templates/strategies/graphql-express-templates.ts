import type { ProjectConfig } from '../../project-config.js';
import type { ApiStyleStrategy } from './api-style-strategy';

export class GraphqlExpressTemplateStrategy implements ApiStyleStrategy {
  serverFiles(config: ProjectConfig): Record<string, string> {
    return {
      'apps/api/src/graphql/server.ts': `import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express';
import type { Express } from 'express';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers/health.resolver';
import type { GraphQLContext } from './context';

export async function setupGraphQL(app: Express) {
  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({
        token: req.headers.authorization ?? null,
      }),
    }),
  );

  console.log('GraphQL endpoint: http://localhost:3001/graphql');
}
`,

      'apps/api/src/graphql/typeDefs.ts': `const typeDefs = \`#graphql
  type Health {
    status: String!
    timestamp: String!
    uptime: Float!
  }

  type AppInfo {
    name: String!
    version: String!
    environment: String!
  }

  type Query {
    health: Health!
    info: AppInfo!
  }
\`;

export { typeDefs };
`,

      'apps/api/src/graphql/resolvers/health.resolver.ts': `const resolvers = {
  Query: {
    health: () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
    info: () => ({
      name: '${config.name}',
      version: '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
    }),
  },
};

export { resolvers };
`,

      'apps/api/src/graphql/context.ts': `export interface GraphQLContext {
  token: string | null;
}
`,
    };
  }

  clientFiles(_config: ProjectConfig): Record<string, string> {
    return {};
  }

  setupInstructions(_config: ProjectConfig): string {
    return `// GraphQL (Express + Apollo):
// Import in apps/api/src/app.ts:
//   import { setupGraphQL } from './graphql/server';
//   await setupGraphQL(app);
//
// GraphQL endpoint: http://localhost:3001/graphql
`;
  }
}
