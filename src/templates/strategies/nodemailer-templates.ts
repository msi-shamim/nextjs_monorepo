import type { ProjectConfig } from '../../project-config.js';
import type { EmailStrategy } from './email-strategy';

export class NodemailerTemplateStrategy implements EmailStrategy {
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
    "nodemailer": "${config.versions['nodemailer'] ?? '^6.10.0'}"
  },
  "devDependencies": {
    "@types/nodemailer": "${config.versions['@types/nodemailer'] ?? '^6.4.17'}",
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { sendEmail } from './send';
export { transporter } from './client';
`;
  }

  client(_config: ProjectConfig): string {
    return `import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
`;
  }

  sendFunction(_config: ProjectConfig): string {
    return `import { transporter } from './client';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'noreply@example.com',
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    text,
  });

  return { messageId: info.messageId };
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
    <p style="font-size: 16px; color: #4b5563;">
      Hi \${name}, thank you for signing up. We're excited to have you on board.
    </p>
    <a href="\${appUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
      Get Started
    </a>
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
    <p style="font-size: 16px; color: #4b5563;">
      Click the button below to reset your ${config.pascalCase} password. This link expires in 1 hour.
    </p>
    <a href="\${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
      Reset Password
    </a>
    <p style="font-size: 14px; color: #9ca3af; margin-top: 24px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>\`;
}
`;
  }
}
