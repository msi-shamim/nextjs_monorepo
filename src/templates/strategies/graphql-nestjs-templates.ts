import type { ProjectConfig } from '../../project-config.js';
import type { ApiStyleStrategy } from './api-style-strategy';

export class GraphqlNestjsTemplateStrategy implements ApiStyleStrategy {
  serverFiles(_config: ProjectConfig): Record<string, string> {
    return {
      'apps/api/src/graphql/graphql.module.ts': `import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { HealthResolver } from './resolvers/health.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
    }),
  ],
  providers: [HealthResolver],
})
export class GqlModule {}
`,

      'apps/api/src/graphql/resolvers/health.resolver.ts': `import { Query, Resolver } from '@nestjs/graphql';
import { HealthModel } from '../models/health.model.js';

@Resolver(() => HealthModel)
export class HealthResolver {
  @Query(() => HealthModel, { description: 'Health check' })
  health(): HealthModel {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
`,

      'apps/api/src/graphql/models/health.model.ts': `import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType({ description: 'Health check response' })
export class HealthModel {
  @Field(() => String)
  status!: string;

  @Field(() => String)
  timestamp!: string;

  @Field(() => Float)
  uptime!: number;
}
`,
    };
  }

  clientFiles(_config: ProjectConfig): Record<string, string> {
    return {};
  }

  setupInstructions(_config: ProjectConfig): string {
    return `// GraphQL (NestJS + Apollo):
// Import GqlModule in apps/api/src/app.module.ts:
//   import { GqlModule } from './graphql/graphql.module';
//   @Module({ imports: [GqlModule] })
//
// GraphQL Playground: http://localhost:3001/graphql
`;
  }
}
