/**
 * POST /api/auth/forgot-password — إرسال رابط استعادة كلمة المرور.
 *
 * قاعدة أمنية: الرد واحد دائماً سواء كان البريد مسجّلاً أم لا،
 * حتى لا يُستخدم هذا المسار لمعرفة عملاء المتجر (account enumeration).
 * الاستثناء الوحيد: تجاوز عدد المحاولات، لأن المستخدم يحتاج معرفته.
 */
import { createApiRoute } from '@/lib/api/route'
import { EMAIL_SENT_MESSAGE, mapAuthError } from '@/lib/auth/errors'
import { RESET_PASSWORD_PATH, authCallbackUrl } from '@/lib/auth/urls'
import { HttpError } from '@/lib/security/errors'
import { consumeRateLimit } from '@/lib/security/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators/auth'

export const POST = createApiRoute<'public', ForgotPasswordInput>(
  { auth: 'public', schema: forgotPasswordSchema, rateLimit: 'passwordReset' },
  async ({ body }) => {
    const emailLimit = consumeRateLimit('passwordReset', `email:${body.email}`)
    if (!emailLimit.allowed) {
      throw new HttpError(
        429,
        `تم إرسال طلبات كثيرة لهذا البريد. أعد المحاولة بعد ${emailLimit.retryAfterSeconds} ثانية.`,
        { 'Retry-After': String(emailLimit.retryAfterSeconds) },
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
      redirectTo: authCallbackUrl(RESET_PASSWORD_PATH),
    })

    if (error) {
      const mapped = mapAuthError(error, 'forgot-password')
      // نمرّر فقط أخطاء تجاوز المعدل؛ أي خطأ آخر يُكتم بالرد العام
      if (mapped.status === 429) throw mapped
    }

    return { message: EMAIL_SENT_MESSAGE }
  },
)
