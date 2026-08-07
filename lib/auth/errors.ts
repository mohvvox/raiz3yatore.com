/**
 * تحويل أخطاء Supabase Auth إلى أخطاء HTTP موحّدة برسائل عربية آمنة — الجزء 4.
 * المرجع: توجيهات مهارة supabase-on-vercel + PROJECT_SPEC.md القسم 5.
 *
 * القاعدة: نُعمّم فقط إشارة صحة بيانات الدخول (منعاً لكشف وجود الحساب)،
 * لكن نمرّر الأخطاء التي يجب أن يتصرّف المستخدم بناءً عليها (حساب غير مفعّل،
 * كلمة مرور ضعيفة، تجاوز عدد المحاولات) بدل دمجها كلها في "بيانات خاطئة".
 * أي خطأ غير متوقع يُسجَّل في السيرفر ويُعاد كخطأ عام.
 */
import 'server-only'

import type { AuthError } from '@supabase/supabase-js'
import { HttpError, errors } from '@/lib/security/errors'

type SupabaseAuthErrorLike = Pick<AuthError, 'message' | 'status'> & { code?: string }

/**
 * يحوّل خطأ مصادقة من Supabase إلى HttpError مناسب.
 * @param error الخطأ العائد من Supabase
 * @param context سياق العملية لتسجيل مفهوم في اللوق
 */
export function mapAuthError(error: SupabaseAuthErrorLike, context: string): HttpError {
  const code = error.code ?? ''
  const message = (error.message ?? '').toLowerCase()

  // بيانات دخول غير صحيحة — رسالة موحّدة لا تكشف إن كان البريد موجوداً
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return new HttpError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة.')
  }

  // الحساب غير مفعّل بعد — المستخدم يجب أن يتصرّف
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return new HttpError(
      403,
      'لم يتم تفعيل الحساب بعد. افتح رابط التفعيل المُرسل إلى بريدك، أو اطلب إرساله من جديد.',
    )
  }

  // كلمة مرور ضعيفة (سياسة Supabase)
  if (code === 'weak_password' || message.includes('password should') || message.includes('weak password')) {
    return errors.invalidInput('كلمة المرور ضعيفة. اختر كلمة أقوى تتضمّن حرفاً ورقماً على الأقل.')
  }

  // تجاوز الحد عند Supabase نفسه (إرسال بريد / طلبات)
  if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    error.status === 429 ||
    message.includes('rate limit')
  ) {
    return new HttpError(429, 'عدد المحاولات كبير. انتظر قليلاً ثم أعد المحاولة.', {
      'Retry-After': '60',
    })
  }

  // البريد غير صالح من طرف Supabase
  if (code === 'email_address_invalid' || message.includes('invalid email')) {
    return errors.invalidInput('البريد الإلكتروني غير صالح.')
  }

  // أي شيء آخر: يُسجَّل ولا تُكشف تفاصيله
  console.error(`[v0] auth error (${context}):`, error.status, error.code, error.message)
  return errors.internal('تعذّر إتمام العملية. أعد المحاولة لاحقاً.')
}
