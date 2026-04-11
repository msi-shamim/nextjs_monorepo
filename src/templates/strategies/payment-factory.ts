import type { Payments } from '../../project-config.js';
import type { PaymentStrategy } from './payment-strategy.js';
import { StripeTemplateStrategy } from './stripe-templates.js';
import { LemonSqueezyTemplateStrategy } from './lemonsqueezy-templates.js';
import { PaddleTemplateStrategy } from './paddle-templates.js';

export function createPaymentStrategy(payments: Payments): PaymentStrategy | null {
  switch (payments) {
    case 'stripe':
      return new StripeTemplateStrategy();
    case 'lemonsqueezy':
      return new LemonSqueezyTemplateStrategy();
    case 'paddle':
      return new PaddleTemplateStrategy();
    case 'none':
      return null;
  }
}
