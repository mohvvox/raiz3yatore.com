# RAIZEY STORE

متجر شحن ألعاب (Next.js 16 + TypeScript + Tailwind CSS + Supabase).

> المرجع الوحيد لأسماء الجداول والألوان والـ API هو ملف [`PROJECT_SPEC.md`](./PROJECT_SPEC.md).
> أي وكيل ذكاء اصطناعي يشتغل على أي جزء لازم يقرأه كاملاً قبل كتابة أي كود.

## حالة التنفيذ

| # | الجزء | الحالة |
|---|---|---|
| 1 | تهيئة المشروع | مكتمل |
| 2 | تصميم قاعدة البيانات (Supabase) | لم يبدأ |
| 3 | طبقة الأمان الأساسية (RLS) | لم يبدأ |
| 4 | نظام المصادقة | لم يبدأ |
| 5 | نظام التصميم المشترك | لم يبدأ |
| 6 | الهيكل العام للموقع | لم يبدأ |
| 7-19 | واجهة العميل | لم يبدأ |
| 20-28 | لوحة تحكم الأدمن | لم يبدأ |
| 29-30 | المراجعة الأمنية والنشر | لم يبدأ |

## القواعد الملزمة

- **الأيقونات:** `lucide-react` حصراً. **ممنوع استخدام أي إيموجي** في الكود أو الواجهة أو رسائل النظام أو الإشعارات.
- **الألوان:** استخدم توكنات Tailwind المشتقة من متغيرات CSS في `app/globals.css` فقط. ممنوع كتابة hex مباشر في أي كومبوننت.
- **الأنواع:** كل أنواع جداول قاعدة البيانات تُستورد من `types/` — لا تُعرَّف من جديد في أي ملف.
- **شكل الـ API:** كل استجابة `{ success: true, data }` أو `{ success: false, error }` عبر المساعدين في `types/api.ts`.
- **متغيرات البيئة:** تُقرأ عبر `lib/env.ts` فقط، وليس `process.env` مباشرة.
- **اللغة:** العربية RTL هي الأساس (`<html lang="ar" dir="rtl">`).

## هيكلة المجلدات

```
app/
  (customer)/      واجهة العميل
  admin/           لوحة تحكم الأدمن
  api/             Route Handlers
components/
  ui/              مكونات أساسية مشتركة
  customer/
  admin/
lib/
  supabase/        عملاء Supabase (browser / server / service role)
  validators/      التحقق من المدخلات
  env.ts           متغيرات البيئة الموثّقة
types/             أنواع قاعدة البيانات و الـ API (مصدر واحد للحقيقة)
```

## نظام الألوان

| التوكن | الكود | كلاس Tailwind |
|---|---|---|
| `--bg-primary` | `#0D0D0D` | `bg-background` / `bg-bg-primary` |
| `--bg-secondary` | `#1B1B1D` | `bg-card` / `bg-bg-secondary` |
| `--brand-gold` | `#FFB800` | `text-primary` / `bg-primary` |
| `--brand-orange` | `#FC8E00` | `bg-accent` / `bg-brand-orange` |
| `--alert-red` | `#FF2D3A` | `text-destructive` / `bg-destructive` |
| `--text-primary` | `#F5F5F5` | `text-foreground` |
| `--text-muted` | `#9A9A9A` | `text-muted-foreground` |
| `--border` | `#2A2A2C` | `border-border` |

## الخطوط

- **Cairo** — كل النصوص العربية (`font-sans`).
- **IBM Plex Mono** — الأرقام والأكواد وأرقام العمليات (`font-mono`).

## متغيرات البيئة

انسخ `.env.example` إلى `.env.local` واملأ القيم، وأضف نفس المتغيرات في
Vercel > Project Settings > Environment Variables.

| المتغير | إلزامي | النطاق |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | نعم | عام |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | نعم | عام |
| `SUPABASE_SERVICE_ROLE_KEY` | نعم | **سيرفر فقط** |
| `NEXT_PUBLIC_SITE_URL` | نعم | عام |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | لا | عام |
| `NEXT_PUBLIC_SENTRY_DSN` | لا | عام |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | لا | عام |

`SUPABASE_SERVICE_ROLE_KEY` يتجاوز RLS — يُستخدم فقط في السيرفر لعمليات المحفظة
والأدمن، وممنوع كشفه للمتصفح.

## التشغيل محلياً

```bash
pnpm install
pnpm dev
```

## رؤوس الأمان

مضبوطة في `next.config.mjs`: `X-Content-Type-Options`، `Referrer-Policy`،
`Strict-Transport-Security`، `X-Frame-Options`، `Permissions-Policy`، و
`Content-Security-Policy-Report-Only` (تُشدَّد وتُحوَّل إلى enforcing في الجزء 29).
