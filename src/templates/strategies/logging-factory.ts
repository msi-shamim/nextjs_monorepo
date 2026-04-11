import type { Logging } from '../../project-config.js';
import type { LoggingStrategy } from './logging-strategy.js';
import { PinoTemplateStrategy } from './pino-templates.js';
import { WinstonTemplateStrategy } from './winston-templates.js';

export function createLoggingStrategy(logging: Logging): LoggingStrategy | null {
  switch (logging) {
    case 'pino':
      return new PinoTemplateStrategy();
    case 'winston':
      return new WinstonTemplateStrategy();
    case 'default':
      return null;
  }
}
