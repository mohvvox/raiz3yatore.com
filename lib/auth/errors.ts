/**
 * ترجمة أخطاء Supabase Auth إلى أخطاء HTTP عربية موحّدة — الجزء 4.
 *
 * قواعد إلزامية:
 *  1. ممنوع إرجاع رسالة Supabase الأصلية للمتصفح (تسريب تفاصيل + تمكين
 *     تخمين وجود الحساب - account enumeration).
 *  2. الإشارة الوحيدة التي تُعمَّم هي "صحة بيانات الدخول / وجود الحساب".
 *     أما ما يحتاج المستخدم أن يتصرف بناءً عليه (بريد غير مفعّل، كلمة مرور
 *     ضعيفة، تجاوز عدد المحاولات) فيُبلَّغ به بوضوح.
 *  3. أي خطأ غير معروف يُسجَّل في السيرفر ويُعاد كخطأ غير متوقع، لا كـ
 *     "كلمة مرور خاطئة".
 */
import 'server-only'

import { HttpError, errors } from '@/lib/security/errors'

type SupabaseAuthErrorLike = {
  code?: string | null
  status?: number | null
  message?: string | null
}

/** رسالة موحّدة لكل ما يتعلق بصحة بيانات الدخول */
export const INVALID_CREDENTIALS_MESSAGE = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'

/** رسالة موحّدة لكل عمليات إرسال البريد (لا تكشف إن كان الحساب موجوداً أم لا) */
export const EMAIL_SENT_MESSAGE =
  'إذا كان هذا البريد مسجّلاً لدينا فستصلك رسالة على بريدك خلال دقائق. تحقّق أيضاً من مجلد الرسائل غير المرغوبة.'

export function mapAuthError(error: SupabaseAuthErrorLike, context: string): HttpError {
  const code = error.code ?? ''
  const status = error.status ?? 0

  // يُسجَّل الخطأ الأصلي في السيرفر فقط
  console.error(`[v0] auth error (${context}):`, code || status, error.message)

  if (status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return new HttpError(429, 'عدد المحاولات كبير. انتظر قليلاً ثم أعد المحاولة.', {
      'Retry-After': '60',
    })
  }

  switch (code) {
    case 'invalid_credentials':
    case 'user_not_found':
      return new HttpError(401, INVALID_CREDENTIALS_MESSAGE)

    case 'email_not_confirmed':
      return new HttpError(
        403,
        'لم يتم تفعيل بريدك الإلكتروني بعد. افتح رسالة التفعيل المرسلة إليك، أو اطلب إعادة إرسالها.',
      )

    case 'weak_password':
      return errors.invalidInput('كلمة المرور ضعيفة. اختر كلمة مرور أقوى.')

    case 'same_password':
      return errors.invalidInput('كلمة المرور الجديدة يجب أن تختلف عن الحالية.')

    case 'email_address_invalid':
      return errors.invalidInput('البريد الإلكتروني غير مقبول. استخدم بريداً حقيقياً.')

    case 'email_address_not_authorized':
      return new HttpError(
        403,
        'تعذّر إرسال البريد إلى هذا العنوان حالياً. تواصل مع الدعم لإكمال التسجيل.',
      )

    case 'validation_failed':
      return errors.invalidInput('البيانات المُرسلة غير صحيحة.')

    case 'signup_disabled':
      return new HttpError(403, 'التسجيل متوقف مؤقتاً. حاول لاحقاً.')

    case 'session_expired':
    case 'refresh_token_not_found':
    case 'flow_state_expired':
      return new HttpError(401, 'انتهت صلاحية الرابط أو الجلسة. أعد المحاولة من البداية.')

    case 'user_banned':
      return errors.banned()

    default:
      return errors.internal()
  }
}
