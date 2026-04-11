/**
 * StateFactory — Creates the appropriate StateStrategy based on config.
 */

import type { StateManagement } from '../../project-config.js';
import type { StateStrategy } from './state-strategy.js';
import { ZustandTemplateStrategy } from './zustand-templates.js';
import { JotaiTemplateStrategy } from './jotai-templates.js';
import { ReduxTemplateStrategy } from './redux-templates.js';
import { TanstackQueryTemplateStrategy } from './tanstack-query-templates.js';

export function createStateStrategy(state: StateManagement): StateStrategy | null {
  switch (state) {
    case 'zustand':
      return new ZustandTemplateStrategy();
    case 'jotai':
      return new JotaiTemplateStrategy();
    case 'redux':
      return new ReduxTemplateStrategy();
    case 'tanstack-query':
      return new TanstackQueryTemplateStrategy();
    case 'none':
      return null;
  }
}
