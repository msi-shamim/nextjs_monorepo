/**
 * Logger — Colored terminal output utility using chalk.
 */

import chalk from 'chalk';

export const logger = {
  /** Step indicator (e.g. "[1/16] Resolving versions...") */
  step(current: number, total: number, message: string): void {
    console.log(chalk.cyan(`  [${current}/${total}] `) + message);
  },

  /** Success message with green checkmark */
  success(message: string): void {
    console.log(chalk.green('  ✓ ') + message);
  },

  /** Warning message with yellow indicator */
  warn(message: string): void {
    console.log(chalk.yellow('  ⚠ ') + message);
  },

  /** Error message with red indicator */
  error(message: string): void {
    console.log(chalk.red('  ✗ ') + message);
  },

  /** Info message */
  info(message: string): void {
    console.log(chalk.blue('  ℹ ') + message);
  },

  /** Plain message with indent */
  log(message: string): void {
    console.log('  ' + message);
  },

  /** Section header */
  header(message: string): void {
    console.log();
    console.log(chalk.bold.white(message));
  },

  /** Dim secondary text */
  dim(message: string): void {
    console.log(chalk.dim('  ' + message));
  },

  /** Blank line */
  newline(): void {
    console.log();
  },

  /** Banner for CLI startup */
  banner(version: string): void {
    console.log();
    console.log(
      chalk.bold.cyan('  create-next-monorepo') + chalk.dim(` v${version}`),
    );
    console.log(
      chalk.dim('  Generate production-ready Next.js monorepos in one command'),
    );
    console.log();
  },

  /** Summary box after generation */
  summary(lines: string[]): void {
    const maxLength = Math.max(...lines.map((line) => line.length));
    const border = '─'.repeat(maxLength + 4);

    console.log();
    console.log(chalk.green('  ┌' + border + '┐'));
    for (const line of lines) {
      console.log(
        chalk.green('  │') +
          '  ' +
          line.padEnd(maxLength + 2) +
          chalk.green('│'),
      );
    }
    console.log(chalk.green('  └' + border + '┘'));
    console.log();
  },
};
