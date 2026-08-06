/**
 * POST /api/auth/login — تسجيل الدخول.
 * المرجع: PROJECT_SPEC.md القسم 5، الجزء 4 من الخطة.
 *
 * الحماية من محاولات الدخول المتكررة (brute-force) على ثلاث طبقات:
 *  1. حد لكل IP (يفرضه غلاف createApiRoute عبر rateLimit: 'login').
 *  2. حد لكل بريد إلكتروني (هنا) — يمنع تخمين كلمة مرور حساب واحد من عدة IPs.
 *  3. حدود Supabase الخاصة كخط أخير.
 * عداد البريد يُصفَّر عند نجاح الدخول فقط.
 */
import { createApiRoute } from '@/lib/api/route'
import { mapAuthError } from '@/lib/auth/errors'
import { ensureProfileFromAuthUser } from '@/lib/auth/profile'
import { DEFAULT_AFTER_AUTH, safeNextPath } from '@/lib/auth/urls'
import { errors } from '@/lib/security/errors'
import { consumeRateLimit, resetRateLimit } from '@/lib/security/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, type LoginInput } from '@/lib/validators/auth'

export const POST = createApiRoute<'public', LoginInput>(
  { auth: 'public', schema: loginSchema, rateLimit: 'login' },
  async ({ body }) => {
    const emailKey = `email:${body.email}`
    const emailLimit = consumeRateLimit('login', emailKey)
    if (!emailLimit.allowed) throw errors.tooManyRequests(emailLimit.retryAfterSeconds)

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (error) throw mapAuthError(error, 'login')

    const user = data.user
    if (!user) throw errors.internal()

    // شبكة أمان: حساب قديم بلا بروفايل (أو فشل الإنشاء وقت التسجيل)
    const profile = await ensureProfileFromAuthUser(user)

    // الحساب المحظور لا يُسمح له بجلسة نشطة إطلاقاً
    if (profile?.is_banned) {
      await supabase.auth.signOut()
      throw errors.banned()
    }

    resetRateLimit('login', emailKey)

    return {
      userId: user.id,
      redirectTo: safeNextPath(body.next, DEFAULT_AFTER_AUTH),
    }
  },
)
