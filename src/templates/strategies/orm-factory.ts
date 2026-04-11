/**
 * ORMFactory — Creates the appropriate ORMStrategy based on config.
 */

import type { ORM } from '../../project-config.js';
import type { ORMStrategy } from './orm-strategy.js';
import { PrismaTemplateStrategy } from './prisma-templates.js';
import { DrizzleTemplateStrategy } from './drizzle-templates.js';

export function createOrmStrategy(orm: ORM): ORMStrategy | null {
  switch (orm) {
    case 'prisma':
      return new PrismaTemplateStrategy();
    case 'drizzle':
      return new DrizzleTemplateStrategy();
    case 'none':
      return null;
  }
}
