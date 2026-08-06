/**
 * متغيرات البيئة — مصدر واحد للحقيقة.
 * ممنوع قراءة process.env مباشرة في أي مكان آخر بالمشروع.
 *
 * القاعدة الأمنية: أي مفتاح بدون بادئة NEXT_PUBLIC_ لا يُقرأ إلا في السيرفر
 * (Route Handlers / Server Components / Server Actions) ولا يُمرَّر للمتصفح أبداً.
 */

export type EnvVarSpec = {
  key: string
  required: boolean
  scope: 'public' | 'server'
  /** وصف بالعربي لما يفعله المتغير ومن أين نجيبه */
  description: string
}

/** توثيق كل متغير مطلوب للمشروع (يُستخدم في صفحة الحالة وفي .env.example) */
export const ENV_SPEC: EnvVarSpec[] = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    scope: 'public',
    description: 'رابط مشروع Supabase (Project URL) — من Supabase > Project Settings > API.',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    scope: 'public',
    description: 'مفتاح anon العام لـ Supabase — محمي بواسطة RLS، آمن للمتصفح.',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    scope: 'server',
    description:
      'مفتاح service role — يتجاوز RLS. يستخدم فقط في السيرفر لعمليات المحفظة والأدمن. ممنوع كشفه للمتصفح.',
  },
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    required: true,
    scope: 'public',
    description:
      'رابط الموقع الأساسي (مثال: https://raizey-store.vercel.app) — يستخدم في روابط التفعيل والإحالة.',
  },
  {
    key: 'NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL',
    required: false,
    scope: 'public',
    description: 'رابط إعادة التوجيه في بيئة التطوير لمصادقة Supabase (يوفره v0 تلقائياً).',
  },
  {
    key: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    scope: 'public',
    description: 'عنوان Sentry لرصد الأخطاء (يضاف في الجزء 29 — المراجعة الأمنية).',
  },
  {
    key: 'NEXT_PUBLIC_WHATSAPP_NUMBER',
    required: false,
    scope: 'public',
    description: 'رقم واتساب الدعم بالصيغة الدولية بدون + (يستخدم في صفحة تواصل معنا).',
  },
]

/** قراءة متغير سيرفر إلزامي — يرمي خطأ واضح لو مفقود */
export function requireServerEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`متغير البيئة ${key} غير مضبوط. راجع ملف .env.example.`)
  }
  return value
}

/** حالة كل متغير: مضبوط أو لا (للمتغيرات العامة فقط تُقرأ في المتصفح) */
export function getPublicEnvStatus() {
  const publicValues: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  }

  return ENV_SPEC.map((spec) => ({
    ...spec,
    isSet: spec.scope === 'public' ? Boolean(publicValues[spec.key]) : undefined,
  }))
}
