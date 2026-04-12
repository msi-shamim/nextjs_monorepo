import type { ProjectConfig } from '../../project-config.js';
import type { LoggingStrategy } from './logging-strategy';

export class WinstonTemplateStrategy implements LoggingStrategy {
  loggerSetup(_config: ProjectConfig): string {
    return `import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  format: isProduction
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const ctx = context ? \` [\${context}]\` : '';
          const metaStr = Object.keys(meta).length ? \` \${JSON.stringify(meta)}\` : '';
          return \`\${timestamp} \${level}\${ctx}: \${message}\${metaStr}\`;
        }),
      ),
  transports: [
    new winston.transports.Console(),
  ],
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
