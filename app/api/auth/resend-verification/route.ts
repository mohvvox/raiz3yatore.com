/**
 * POST /api/auth/resend-verification — إعادة إرسال رسالة تفعيل البريد.
 *
 * نفس قاعدة استعادة كلمة المرور: رد عام واحد لا يكشف إن كان البريد مسجّلاً
 * أو مفعّلاً بالفعل.
 */
import { createApiRoute } from '@/lib/api/route'
import { EMAIL_SENT_MESSAGE, mapAuthError } from '@/lib/auth/errors'
import { authCallbackUrl } from '@/lib/auth/urls'
import { HttpError } from '@/lib/security/errors'
import { consumeRateLimit } from '@/lib/security/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { resendVerificationSchema, type ResendVerificationInput } from '@/lib/validators/auth'

export const POST = createApiRoute<'public', ResendVerificationInput>(
  { auth: 'public', schema: resendVerificationSchema, rateLimit: 'passwordReset' },
  async ({ body }) => {
    const emailLimit = consumeRateLimit('passwordReset', `resend:${body.email}`)
    if (!emailLimit.allowed) {
      throw new HttpError(
        429,
        `تم إرسال طلبات كثيرة لهذا البريد. أعد المحاولة بعد ${emailLimit.retryAfterSeconds} ثانية.`,
        { 'Retry-After': String(emailLimit.retryAfterSeconds) },
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: body.email,
      options: { emailRedirectTo: authCallbackUrl('/') },
    })

    if (error) {
      const mapped = mapAuthError(error, 'resend-verification')
      if (mapped.status === 429) throw mapped
    }

    return { message: EMAIL_SENT_MESSAGE }
  },
)
