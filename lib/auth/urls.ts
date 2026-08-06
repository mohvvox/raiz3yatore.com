/**
 * روابط المصادقة — الجزء 4 (نظام المصادقة).
 *
 * كل روابط رسائل البريد (تفعيل الحساب / استعادة كلمة المرور) تمر من هنا فقط،
 * حتى لا يخترع أي جزء لاحق رابطاً مختلفاً.
 *
 * قاعدة أمنية: أي مسار إعادة توجيه قادم من المتصفح يُنظَّف عبر safeNextPath
 * لمنع ثغرة Open Redirect (تحويل المستخدم لموقع خارجي بعد تسجيل الدخول).
 */
import { getSiteUrl } from '@/lib/env'

/** المسار الافتراضي بعد تسجيل الدخول أو تفعيل الحساب */
export const DEFAULT_AFTER_AUTH = '/'

/** مسار صفحة تعيين كلمة مرور جديدة (يُفتح من رابط الاستعادة) */
export const RESET_PASSWORD_PATH = '/reset-password'

/**
 * يقبل فقط مساراً داخلياً يبدأ بـ / ولا يبدأ بـ // أو /\ (وإلا فهو رابط خارجي).
 * أي شيء آخر يُستبدل بالمسار الافتراضي.
 */
export function safeNextPath(value: string | null | undefined, fallback = DEFAULT_AFTER_AUTH) {
  if (!value) return fallback
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}

/**
 * رابط الرجوع الذي يُرسل إلى Supabase في رسائل البريد.
 *
 * في بيئة تطوير v0 نستخدم وسيط إعادة التوجيه الذي يوفره v0
 * (NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL) لأن معاينة الـ VM لا تملك دومين ثابت.
 * في الإنتاج نستخدم دومين الموقع مباشرة.
 */
export function authCallbackUrl(next: string = DEFAULT_AFTER_AUTH) {
  const base =
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${getSiteUrl()}/auth/callback`
  const url = new URL(base)
  url.searchParams.set('next', safeNextPath(next))
  return url.toString()
}
