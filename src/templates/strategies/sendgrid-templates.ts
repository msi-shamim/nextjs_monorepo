import type { ProjectConfig } from '../../project-config.js';
import type { EmailStrategy } from './email-strategy';

export class SendGridTemplateStrategy implements EmailStrategy {
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
    "@sendgrid/mail": "${config.versions['@sendgrid/mail'] ?? '^8.1.0'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { sendEmail } from './send';
export { sgMail } from './client';
`;
  }

  client(_config: ProjectConfig): string {
    return `import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');

export { sgMail };
`;
  }

  sendFunction(_config: ProjectConfig): string {
    return `import { sgMail } from './client';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM ?? 'noreply@example.com',
    subject,
    html,
    text: text ?? '',
  };

  const [response] = await sgMail.send(msg);
  return { statusCode: response.statusCode };
}
`;
  }

  welcomeTemplate(config: ProjectConfig): string {
    return `/** Generate welcome email HTML */
export function welcomeEmailHtml(name: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return \`<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; background: #f9fafb; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <h1 style="font-size: 24px; color: #111827;">Welcome to ${config.pascalCase}!</h1>
    <p style="font-size: 16px; color: #4b5563;">Hi \${name}, thank you for signing up.</p>
    <a href="\${appUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Get Started</a>
  </div>
</body>
</html>\`;
}
`;
  }

  resetPasswordTemplate(config: ProjectConfig): string {
    return `/** Generate password reset email HTML */
export function resetPasswordEmailHtml(resetUrl: string): string {
  return \`<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; background: #f9fafb; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <h1 style="font-size: 24px; color: #111827;">Reset Your Password</h1>
    <p style="font-size: 16px; color: #4b5563;">Click below to reset your ${config.pascalCase} password.</p>
    <a href="\${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Reset Password</a>
  </div>
</body>
</html>\`;
}
`;
  }
}
