/**
 * i18n templates — next-intl setup for Next.js App Router.
 */

import type { ProjectConfig } from '../project-config.js';

/** apps/web/i18n/request.ts */
export function i18nRequest(): string {
  return `import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(\`../messages/\${locale}.json\`)).default,
  };
});
`;
}

/** apps/web/i18n/routing.ts */
export function i18nRouting(): string {
  return `import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
});
`;
}

/** apps/web/i18n/navigation.ts */
export function i18nNavigation(): string {
  return `import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
`;
}

/** apps/web/messages/en.json */
export function messagesEn(config: ProjectConfig): string {
  return JSON.stringify(
    {
      common: {
        appName: config.pascalCase,
        home: 'Home',
        about: 'About',
        contact: 'Contact',
        getStarted: 'Get Started',
        documentation: 'Documentation',
        language: 'Language',
      },
      home: {
        title: config.pascalCase,
        description: `Production-ready monorepo with Next.js 15 and Turborepo.`,
        frontend: 'Frontend',
        frontendDesc: 'Next.js 15 with App Router',
        backend: 'Backend',
        backendDesc: 'REST API server',
      },
      notFound: {
        title: 'Page not found',
        goHome: 'Go Home',
      },
    },
    null,
    2,
  ) + '\n';
}

/** apps/web/messages/ar.json */
export function messagesAr(config: ProjectConfig): string {
  return JSON.stringify(
    {
      common: {
        appName: config.pascalCase,
        home: 'الرئيسية',
        about: 'حول',
        contact: 'اتصل بنا',
        getStarted: 'ابدأ الآن',
        documentation: 'التوثيق',
        language: 'اللغة',
      },
      home: {
        title: config.pascalCase,
        description: 'مستودع إنتاجي متكامل مع Next.js 15 و Turborepo.',
        frontend: 'الواجهة الأمامية',
        frontendDesc: 'Next.js 15 مع App Router',
        backend: 'الخادم',
        backendDesc: 'خادم REST API',
      },
      notFound: {
        title: 'الصفحة غير موجودة',
        goHome: 'العودة للرئيسية',
      },
    },
    null,
    2,
  ) + '\n';
}

/** apps/web/app/[locale]/layout.tsx */
export function i18nLayout(config: ProjectConfig): string {
  return `import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = {
  title: '${config.pascalCase}',
  description: 'Built with Next.js 15 and Turborepo',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
`;
}

/** apps/web/app/[locale]/page.tsx */
export function i18nPage(config: ProjectConfig): string {
  return `import { useTranslations } from 'next-intl';
import { Button, Card } from '@${config.name}/ui';

export default function HomePage() {
  const t = useTranslations('home');
  const tc = useTranslations('common');

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '42rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          {t('title')}
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>
          {t('description')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Card title={t('frontend')} description={t('frontendDesc')} />
          <Card title={t('backend')} description={t('backendDesc')} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button variant="primary" size="lg">{tc('getStarted')}</Button>
          <Button variant="outline" size="lg">{tc('documentation')}</Button>
        </div>
      </div>
    </main>
  );
}
`;
}

/** apps/web/components/language-switcher.tsx */
export function languageSwitcher(): string {
  return `'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

const localeLabels: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        background: 'white',
        cursor: 'pointer',
      }}
    >
      {Object.entries(localeLabels).map(([code, label]) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
`;
}

/** apps/web/middleware.ts (i18n version) */
export function i18nMiddleware(): string {
  return `import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(en|ar)/:path*'],
};
`;
}
