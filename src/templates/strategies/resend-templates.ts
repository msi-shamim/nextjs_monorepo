import type { ProjectConfig } from '../../project-config.js';
import type { EmailStrategy } from './email-strategy';

export class ResendTemplateStrategy implements EmailStrategy {
  packageJson(config: ProjectConfig): string {
    return `{
  "name": "@${config.name}/email",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "resend": "${config.versions['resend'] ?? '^4.1.0'}",
    "@react-email/components": "${config.versions['@react-email/components'] ?? '^0.0.36'}",
    "react": "${config.versions['react'] ?? '^19.1.0'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { sendEmail } from './send';
export { resend } from './client';
`;
  }

  client(_config: ProjectConfig): string {
    return `import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
`;
  }

  sendFunction(_config: ProjectConfig): string {
    return `import { resend } from './client';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'noreply@example.com',
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  });

  if (error) {
    throw new Error(\`Failed to send email: \${error.message}\`);
  }

  return data;
}
`;
  }

  welcomeTemplate(config: ProjectConfig): string {
    return `import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'system-ui, sans-serif', background: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Welcome to ${config.pascalCase}!
          </Heading>
          <Text style={{ fontSize: '16px', color: '#4b5563' }}>
            Hi {name}, thank you for signing up. We're excited to have you on board.
          </Text>
          <Button
            href={process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}
            style={{ background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}
          >
            Get Started
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
`;
  }

  resetPasswordTemplate(config: ProjectConfig): string {
    return `import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components';

interface ResetPasswordEmailProps {
  resetUrl: string;
}

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'system-ui, sans-serif', background: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Reset Your Password
          </Heading>
          <Text style={{ fontSize: '16px', color: '#4b5563' }}>
            Click the button below to reset your ${config.pascalCase} password. This link expires in 1 hour.
          </Text>
          <Button
            href={resetUrl}
            style={{ background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}
          >
            Reset Password
          </Button>
          <Text style={{ fontSize: '14px', color: '#9ca3af', marginTop: '24px' }}>
            If you didn't request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
`;
  }
}
