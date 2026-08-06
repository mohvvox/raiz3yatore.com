/**
 * تحديد معدل الطلبات (Rate limiting) — الجزء 3 من الخطة.
 *
 * الهدف: منع محاولات تخمين كلمة المرور (brute-force) وتكرار رفع طلبات الشحن
 * أو إنشاء الطلبات آلياً.
 *
 * التنفيذ الحالي: نافذة زمنية ثابتة في ذاكرة نسخة السيرفر (بدون أي تبعية خارجية).
 * كافٍ لصد التكرار الآلي السريع. في الجزء 29 (المراجعة الأمنية) يمكن استبدال
 * المخزن بـ Redis مشترك دون تغيير أي كود يستدعي هذه الدوال.
 */
import 'server-only'

export type RateLimitRule = {
  /** أقصى عدد طلبات مسموح داخل النافذة */
  limit: number
  /** طول النافذة بالمللي ثانية */
  windowMs: number
}

/** قواعد موحّدة لكل المشروع — ممنوع تعريف أرقام عشوائية في الـ routes */
export const RATE_LIMITS = {
  /** تسجيل الدخول: 5 محاولات كل 5 دقائق لكل هوية */
  login: { limit: 5, windowMs: 5 * 60_000 },
  /** إنشاء حساب: 3 حسابات كل ساعة لكل IP */
  signup: { limit: 3, windowMs: 60 * 60_000 },
  /** استعادة كلمة المرور: 3 رسائل كل 15 دقيقة */
  passwordReset: { limit: 3, windowMs: 15 * 60_000 },
  /** طلب شحن رصيد: 5 طلبات كل ساعة لكل مستخدم */
  topupRequest: { limit: 5, windowMs: 60 * 60_000 },
  /** إنشاء طلب شراء: 10 طلبات كل 10 دقائق */
  orderCreate: { limit: 10, windowMs: 10 * 60_000 },
  /** التحقق من كوبون: 15 محاولة كل 10 دقائق (منع تخمين الأكواد) */
  couponValidate: { limit: 15, windowMs: 10 * 60_000 },
  /** استبدال كارت هدية: 10 محاولات كل ساعة (منع تخمين الأكواد) */
  giftCardRedeem: { limit: 10, windowMs: 60 * 60_000 },
  /** الحد العام لأي مسار كتابة آخر */
  write: { limit: 30, windowMs: 60_000 },
  /** الحد العام لأي مسار قراءة */
  read: { limit: 120, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitRule>

export type RateLimitName = keyof typeof RATE_LIMITS

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  /** ثواني حتى إعادة المحاولة (0 لو مسموح) */
  retryAfterSeconds: number
  resetAt: number
}

type Bucket = { count: number; resetAt: number }

/**
 * المخزن على globalThis حتى لا تُفقد العدادات مع إعادة تحميل الوحدات في التطوير.
 */
const store: Map<string, Bucket> = ((globalThis as Record<string, unknown>).__raizeyRateLimit ??
  ((globalThis as Record<string, unknown>).__raizeyRateLimit = new Map<string, Bucket>())) as Map<
  string,
  Bucket
>

function sweep(now: number) {
  if (store.size < 5000) return
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key)
  }
}

/**
 * تسجيل محاولة واحدة والحكم عليها.
 * @param name اسم القاعدة من RATE_LIMITS
 * @param identifier هوية الطالب (IP أو معرّف المستخدم أو الاثنين)
 */
export function consumeRateLimit(name: RateLimitName, identifier: string): RateLimitResult {
  const rule = RATE_LIMITS[name]
  const now = Date.now()
  const key = `${name}:${identifier}`

  sweep(now)

  let bucket = store.get(key)
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + rule.windowMs }
    store.set(key, bucket)
  }

  bucket.count += 1

  const allowed = bucket.count <= rule.limit
  return {
    allowed,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - bucket.count),
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    resetAt: bucket.resetAt,
  }
}

/** تصفير العداد — يُنادى بعد نجاح تسجيل الدخول مثلاً */
export function resetRateLimit(name: RateLimitName, identifier: string) {
  store.delete(`${name}:${identifier}`)
}

/** استخراج IP الطالب من رؤوس الطلب (Vercel يضبط x-forwarded-for) */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/** رؤوس معيارية توضح حالة الحد للعميل */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
  if (!result.allowed) headers['Retry-After'] = String(result.retryAfterSeconds)
  return headers
}
