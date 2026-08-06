import {
  CircleCheck,
  CircleDashed,
  Database,
  FolderTree,
  KeyRound,
  Palette,
  ShieldCheck,
  Type,
} from 'lucide-react'
import { ENV_SPEC } from '@/lib/env'

const stack = [
  { label: 'Next.js 16 — App Router', value: 'جاهز' },
  { label: 'TypeScript', value: 'جاهز' },
  { label: 'Tailwind CSS v4', value: 'جاهز' },
  { label: 'lucide-react — الأيقونات فقط', value: 'جاهز' },
  { label: 'العربية RTL', value: 'جاهز' },
  { label: 'Supabase', value: 'الجزء 2' },
  { label: 'Sentry', value: 'الجزء 29' },
]

const tokens = [
  { name: '--bg-primary', hex: '#0D0D0D', swatch: 'bg-bg-primary' },
  { name: '--bg-secondary', hex: '#1B1B1D', swatch: 'bg-bg-secondary' },
  { name: '--brand-gold', hex: '#FFB800', swatch: 'bg-brand-gold' },
  { name: '--brand-orange', hex: '#FC8E00', swatch: 'bg-brand-orange' },
  { name: '--alert-red', hex: '#FF2D3A', swatch: 'bg-alert-red' },
  { name: '--text-primary', hex: '#F5F5F5', swatch: 'bg-text-primary' },
  { name: '--text-muted', hex: '#9A9A9A', swatch: 'bg-text-muted' },
  { name: '--border', hex: '#2A2A2C', swatch: 'bg-border' },
]

const tree = [
  'app/(customer)/',
  'app/admin/',
  'app/api/',
  'components/ui/',
  'components/customer/',
  'components/admin/',
  'lib/supabase/',
  'lib/validators/',
  'types/',
]

export default function SetupPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-12 md:py-16">
      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
          الجزء <span className="font-mono">1</span> من <span className="font-mono">30</span> — تهيئة
          المشروع
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
          <span className="text-primary">RAIZEY</span> STORE
        </h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          أساس المشروع جاهز: التقنيات، هيكلة المجلدات، نظام الألوان الموحد، الخطوط، وتوثيق متغيرات
          البيئة. هذه صفحة حالة مؤقتة يتم استبدالها بالصفحة الرئيسية في الجزء 7.
        </p>
      </header>

      <section aria-labelledby="stack-title" className="flex flex-col gap-4">
        <h2 id="stack-title" className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          التقنيات المعتمدة
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {stack.map((item) => {
            const done = item.value === 'جاهز'
            return (
              <li
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
              >
                <span className="flex items-center gap-2 text-sm">
                  {done ? (
                    <CircleCheck className="size-4 text-primary" aria-hidden="true" />
                  ) : (
                    <CircleDashed className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  {item.label}
                </span>
                <span className={`text-xs ${done ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.value}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="tokens-title" className="flex flex-col gap-4">
        <h2 id="tokens-title" className="flex items-center gap-2 text-lg font-semibold">
          <Palette className="size-5 text-primary" aria-hidden="true" />
          نظام الألوان (CSS Variables)
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tokens.map((token) => (
            <li
              key={token.name}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <span
                className={`size-8 shrink-0 rounded-md border border-border ${token.swatch}`}
                aria-hidden="true"
              />
              <span className="flex flex-col gap-0.5 overflow-hidden">
                <span className="truncate font-mono text-xs text-foreground">{token.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{token.hex}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tree-title" className="flex flex-col gap-4">
        <h2 id="tree-title" className="flex items-center gap-2 text-lg font-semibold">
          <FolderTree className="size-5 text-primary" aria-hidden="true" />
          هيكلة المجلدات
        </h2>
        <ul className="grid gap-2 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
          {tree.map((path) => (
            <li key={path} className="font-mono text-xs text-muted-foreground" dir="ltr">
              {path}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="env-title" className="flex flex-col gap-4">
        <h2 id="env-title" className="flex items-center gap-2 text-lg font-semibold">
          <KeyRound className="size-5 text-primary" aria-hidden="true" />
          متغيرات البيئة المطلوبة
        </h2>
        <ul className="flex flex-col gap-3">
          {ENV_SPEC.map((spec) => (
            <li
              key={spec.key}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
            >
              <span className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-xs text-foreground" dir="ltr">
                  {spec.key}
                </code>
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.6875rem] ${
                    spec.required
                      ? 'bg-destructive/15 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {spec.required ? 'إلزامي' : 'اختياري'}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] text-muted-foreground">
                  {spec.scope === 'server' ? 'سيرفر فقط' : 'عام'}
                </span>
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {spec.description}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="auth-title" className="flex flex-col gap-4">
        <h2 id="auth-title" className="flex items-center gap-2 text-lg font-semibold">
          <LogIn className="size-5 text-primary" aria-hidden="true" />
          نظام المصادقة (الجزء 4)
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {authPages.map((page) => (
            <li key={page.href}>
              <Link
                href={page.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span className="text-sm">{page.label}</span>
                <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                  {page.href}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="next-title"
        className="flex flex-col gap-3 rounded-lg border border-primary/25 bg-primary/5 p-5"
      >
        <h2 id="next-title" className="flex items-center gap-2 text-lg font-semibold">
          <Database className="size-5 text-primary" aria-hidden="true" />
          الخطوة التالية
        </h2>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          الجزء 5: نظام التصميم المشترك (Design System) المبني على توكنات الألوان أعلاه، ثم الجزء 6:
          الهيكل العام للموقع (الهيدر والفوتر والتنقل).
        </p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Type className="size-4 shrink-0" aria-hidden="true" />
          الخطوط: Cairo للنصوص العربية، IBM Plex Mono للأرقام والأكواد.
        </p>
      </section>
    </main>
  )
}
