import type { ProjectConfig } from '../../project-config.js';
import type { PaymentStrategy } from './payment-strategy.js';

export class LemonSqueezyTemplateStrategy implements PaymentStrategy {
  packageJson(config: ProjectConfig): string {
    return `{
  "name": "@${config.name}/payments",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@lemonsqueezy/lemonsqueezy.js": "${config.versions['@lemonsqueezy/lemonsqueezy.js'] ?? '^4.0.0'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { lemonSqueezySetup } from './client.js';
export { createCheckout } from './checkout.js';
export { handleWebhook } from './webhook.js';
export { getSubscription, cancelSubscription } from './subscription.js';
`;
  }

  client(_config: ProjectConfig): string {
    return `import { lemonSqueezySetup as setup } from '@lemonsqueezy/lemonsqueezy.js';

export function lemonSqueezySetup() {
  setup({ apiKey: process.env.LEMONSQUEEZY_API_KEY ?? '', onError: (error) => console.error('LemonSqueezy error:', error) });
}
`;
  }

  webhookHandler(_config: ProjectConfig): string {
    return `import crypto from 'node:crypto';

/** Verify LemonSqueezy webhook signature and parse event */
export async function handleWebhook(body: string, signature: string) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '';
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');

  if (digest !== signature) {
    throw new Error('Invalid webhook signature');
  }

  const event = JSON.parse(body);
  const eventName = event.meta?.event_name;

  switch (eventName) {
    case 'order_created':
      console.log('Order created:', event.data?.id);
      break;
    case 'subscription_created':
      console.log('Subscription created:', event.data?.id);
      break;
    case 'subscription_cancelled':
      console.log('Subscription cancelled:', event.data?.id);
      break;
    case 'subscription_payment_failed':
      console.log('Payment failed:', event.data?.id);
      break;
    default:
      console.log('Unhandled event:', eventName);
  }

  return { received: true };
}
`;
  }

  checkout(_config: ProjectConfig): string {
    return `import { createCheckout as lsCreateCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { lemonSqueezySetup } from './client.js';

interface CreateCheckoutOptions {
  variantId: number;
  email?: string;
  name?: string;
}

/** Create a LemonSqueezy checkout URL */
export async function createCheckout({ variantId, email, name }: CreateCheckoutOptions) {
  lemonSqueezySetup();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID ?? '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const { data } = await lsCreateCheckout(storeId, variantId, {
    checkoutData: {
      email,
      name,
    },
    productOptions: {
      redirectUrl: \`\${appUrl}/checkout/success\`,
    },
  });

  return { url: data?.data?.attributes?.url ?? null };
}
`;
  }

  subscription(_config: ProjectConfig): string {
    return `import { getSubscription as lsGetSubscription, cancelSubscription as lsCancelSubscription } from '@lemonsqueezy/lemonsqueezy.js';
import { lemonSqueezySetup } from './client.js';

/** Get subscription details */
export async function getSubscription(subscriptionId: string) {
  lemonSqueezySetup();
  const { data } = await lsGetSubscription(subscriptionId);
  return data?.data ?? null;
}

/** Cancel a subscription */
export async function cancelSubscription(subscriptionId: string) {
  lemonSqueezySetup();
  const { data } = await lsCancelSubscription(subscriptionId);
  return data?.data ?? null;
}
`;
  }

  pricingPage(config: ProjectConfig): string {
    return `import { Button } from '@${config.name}/ui';

const plans = [
  { name: 'Free', price: '$0', period: '/month', features: ['1 project', 'Basic support'], variantId: 0, highlighted: false },
  { name: 'Pro', price: '$19', period: '/month', features: ['Unlimited projects', 'Priority support', 'Advanced features'], variantId: Number(process.env.NEXT_PUBLIC_LS_PRO_VARIANT_ID ?? 0), highlighted: true },
  { name: 'Enterprise', price: '$99', period: '/month', features: ['Everything in Pro', 'Dedicated support', 'SLA'], variantId: Number(process.env.NEXT_PUBLIC_LS_ENTERPRISE_VARIANT_ID ?? 0), highlighted: false },
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
                {plan.variantId ? 'Get Started' : 'Start Free'}
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
  async webhook(@Req() req: Request, @Headers('x-signature') signature: string) {
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
    const signature = req.headers['x-signature'] as string;
    const result = await handleWebhook(JSON.stringify(req.body), signature);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
`;
  }
}
