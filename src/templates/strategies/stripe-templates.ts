import type { ProjectConfig } from '../../project-config.js';
import type { PaymentStrategy } from './payment-strategy';

export class StripeTemplateStrategy implements PaymentStrategy {
  packageJson(config: ProjectConfig): string {
    return `{
  "name": "@${config.name}/payments",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "stripe": "${config.versions['stripe'] ?? '^17.7.0'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { stripe } from './client';
export { createCheckoutSession } from './checkout';
export { handleWebhook } from './webhook';
export { getSubscription, cancelSubscription } from './subscription';
`;
  }

  client(_config: ProjectConfig): string {
    return `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-03-31.basil',
  typescript: true,
});
`;
  }

  webhookHandler(_config: ProjectConfig): string {
    return `import type Stripe from 'stripe';
import { stripe } from './client';

/** Verify and handle a Stripe webhook event */
export async function handleWebhook(body: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: Fulfill the order, update database
      console.log('Checkout completed:', session.id);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      // TODO: Update subscription status in database
      console.log('Subscription updated:', subscription.id);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      // TODO: Handle subscription cancellation
      console.log('Subscription cancelled:', subscription.id);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      // TODO: Notify user of failed payment
      console.log('Payment failed:', invoice.id);
      break;
    }
    default:
      console.log('Unhandled event type:', event.type);
  }

  return { received: true };
}
`;
  }

  checkout(_config: ProjectConfig): string {
    return `import { stripe } from './client';

interface CreateCheckoutOptions {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  mode?: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

/** Create a Stripe Checkout session */
export async function createCheckoutSession({
  priceId,
  customerId,
  customerEmail,
  mode = 'subscription',
  successUrl,
  cancelUrl,
}: CreateCheckoutOptions) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    ...(customerId ? { customer: customerId } : {}),
    ...(customerEmail && !customerId ? { customer_email: customerEmail } : {}),
    success_url: successUrl ?? \`\${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: cancelUrl ?? \`\${appUrl}/pricing\`,
  });

  return { sessionId: session.id, url: session.url };
}
`;
  }

  subscription(_config: ProjectConfig): string {
    return `import { stripe } from './client';

/** Get a customer's active subscription */
export async function getSubscription(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });

  return subscriptions.data[0] ?? null;
}

/** Cancel a subscription at period end */
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/** Create a customer portal session */
export async function createPortalSession(customerId: string, returnUrl?: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl ?? \`\${appUrl}/dashboard\`,
  });

  return { url: session.url };
}
`;
  }

  pricingPage(config: ProjectConfig): string {
    return `import { Button } from '@${config.name}/ui';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['1 project', 'Basic support', 'Community access'],
    priceId: '', // No checkout for free tier
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    features: ['Unlimited projects', 'Priority support', 'Advanced features', 'API access'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID ?? '',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Simple Pricing
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '3rem' }}>
          Choose the plan that fits your needs
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                border: plan.highlighted ? '2px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '2rem',
                background: 'white',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{plan.name}</h3>
              <div style={{ margin: '1rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{plan.price}</span>
                <span style={{ color: '#64748b' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', textAlign: 'left' }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ padding: '0.5rem 0', color: '#374151' }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlighted ? 'primary' : 'outline'}
                style={{ width: '100%' }}
              >
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
      return `import { Controller, Post, Req, Headers, RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { handleWebhook } from '@${config.name}/payments';

@Controller('payments')
export class PaymentsController {
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) throw new Error('Missing raw body');
    return handleWebhook(rawBody, signature);
  }
}
`;
    }

    return `import { Router } from 'express';
import { handleWebhook } from '@${config.name}/payments';

export const paymentsRouter = Router();

paymentsRouter.post('/payments/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const result = await handleWebhook(req.body, signature);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
`;
  }
}
