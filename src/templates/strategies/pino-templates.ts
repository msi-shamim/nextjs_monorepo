import type { ProjectConfig } from '../../project-config.js';
import type { LoggingStrategy } from './logging-strategy';

export class PinoTemplateStrategy implements LoggingStrategy {
  loggerSetup(_config: ProjectConfig): string {
    return `import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),
});

/** Create a child logger with a context label */
export function createLogger(context: string) {
  return logger.child({ context });
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { logger, createLogger } from './logger';
`;
  }
}
