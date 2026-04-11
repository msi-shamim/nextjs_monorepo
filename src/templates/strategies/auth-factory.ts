/**
 * AuthFactory — Creates the appropriate AuthStrategy based on config.
 */

import type { Auth } from '../../project-config.js';
import type { AuthStrategy } from './auth-strategy.js';
import { NextAuthTemplateStrategy } from './next-auth-templates.js';
import { CustomAuthTemplateStrategy } from './custom-auth-templates.js';

export function createAuthStrategy(auth: Auth): AuthStrategy | null {
  switch (auth) {
    case 'next-auth':
      return new NextAuthTemplateStrategy();
    case 'custom':
      return new CustomAuthTemplateStrategy();
    case 'none':
      return null;
  }
}
