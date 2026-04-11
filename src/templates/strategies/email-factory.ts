import type { Email } from '../../project-config.js';
import type { EmailStrategy } from './email-strategy.js';
import { ResendTemplateStrategy } from './resend-templates.js';
import { NodemailerTemplateStrategy } from './nodemailer-templates.js';
import { SendGridTemplateStrategy } from './sendgrid-templates.js';

export function createEmailStrategy(email: Email): EmailStrategy | null {
  switch (email) {
    case 'resend':
      return new ResendTemplateStrategy();
    case 'nodemailer':
      return new NodemailerTemplateStrategy();
    case 'sendgrid':
      return new SendGridTemplateStrategy();
    case 'none':
      return null;
  }
}
