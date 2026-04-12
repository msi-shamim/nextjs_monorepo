import type { ProjectConfig } from '../../project-config.js';
import type { PaymentStrategy } from './payment-strategy';

export class PaddleTemplateStrategy implements PaymentStrategy {
  packageJson(config: ProjectConfig): string {
    return `{
  "name": "@${config.name}/payments",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@paddle/paddle-node-sdk": "${config.versions['@paddle/paddle-node-sdk'] ?? '^1.7.0'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { paddle } from './client';
export { createCheckout } from './checkout';
export { handleWebhook } from './webhook';
export { getSubscription, cancelSubscription } from './subscription';
`;
  }

  client(_config: ProjectConfig): string {
    return `import { Paddle, Environment } from '@paddle/paddle-node-sdk';

const isProd = process.env.NODE_ENV === 'production';

export const paddle = new Paddle(process.env.PADDLE_API_KEY ?? '', {
  environment: isProd ? Environment.production : Environment.sandbox,
});
`;
  }

  webhookHandler(_config: ProjectConfig): string {
    return `import { paddle } from './client';

/** Verify and handle a Paddle webhook event */
export async function handleWebhook(body: string, signature: string) {
  const secretKey = process.env.PADDLE_WEBHOOK_SECRET ?? '';

  const eventData = paddle.webhooks.unmarshal(body, secretKey, signature);
  if (!eventData) throw new Error('Invalid webhook signature');

  switch (eventData.eventType) {
    case 'transaction.completed':
      console.log('Transaction completed:', eventData.data?.id);
      break;
    case 'subscription.activated':
      console.log('Subscription activated:', eventData.data?.id);
      break;
    case 'subscription.canceled':
      console.log('Subscription cancelled:', eventData.data?.id);
      break;
    case 'subscription.past_due':
      console.log('Subscription past due:', eventData.data?.id);
      break;
    default:
      console.log('Unhandled event:', eventData.eventType);
  }

  return { received: true };
}
`;
  }

  checkout(_config: ProjectConfig): string {
    return `import { paddle } from './client';

interface CreateCheckoutOptions {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
}

/** Create a Paddle checkout transaction */
export async function createCheckout({ priceId, customerId, customerEmail }: CreateCheckoutOptions) {
  const transaction = await paddle.transactions.create({
    items: [{ priceId, quantity: 1 }],
    ...(customerId ? { customerId } : {}),
    ...(customerEmail ? { customerEmail } : {}),
  });

  return { transactionId: transaction.id };
}
`;
  }

  subscription(_config: ProjectConfig): string {
    return `import { paddle } from './client';

/** Get subscription details */
export async function getSubscription(subscriptionId: string) {
  return paddle.subscriptions.get(subscriptionId);
}

/** Cancel a subscription */
export async function cancelSubscription(subscriptionId: string) {
  return paddle.subscriptions.cancel(subscriptionId, { effectiveFrom: 'next_billing_period' });
}
`;
  }

  pricingPage(config: ProjectConfig): string {
    return `import { Button } from '@${config.name}/ui';

const plans = [
  { name: 'Free', price: '$0', period: '/month', features: ['1 project', 'Basic support'], priceId: '', highlighted: false },
  { name: 'Pro', price: '$19', period: '/month', features: ['Unlimited projects', 'Priority support', 'Advanced features'], priceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? '', highlighted: true },
  { name: 'Enterprise', price: '$99', period: '/month', features: ['Everything in Pro', 'Dedicated support', 'SLA'], priceId: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_PRICE_ID ?? '', highlighted: false },
];

export default function PricingPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Pricing</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{ border: plan.highlighted ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', background: 'white' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{plan.name}</h3>
              <div style={{ margin: '1rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{plan.price}</span>
                <span style={{ color: '#64748b' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', textAlign: 'left' }}>
                {plan.features.map((f) => <li key={f} style={{ padding: '0.5rem 0' }}>✓ {f}</li>)}
              </ul>
              <Button variant={plan.highlighted ? 'primary' : 'outline'} style={{ width: '100%' }}>
                {plan.priceId ? 'Get Started' : 'Start Free'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
`;
  }

  apiRoute(config: ProjectConfig): string {
    if (config.backend === 'nestjs') {
      return `import { Controller, Post, Req, Headers } from '@nestjs/common';
import type { Request } from 'express';
import { handleWebhook } from '@${config.name}/payments';

@Controller('payments')
export class PaymentsController {
  @Post('webhook')
  async webhook(@Req() req: Request, @Headers('paddle-signature') signature: string) {
    const body = JSON.stringify(req.body);
    return handleWebhook(body, signature);
  }
}
`;
    }

    return `import { Router } from 'express';
import { handleWebhook } from '@${config.name}/payments';

export const paymentsRouter = Router();

paymentsRouter.post('/payments/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['paddle-signature'] as string;
    const result = await handleWebhook(JSON.stringify(req.body), signature);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
`;
  }
}
