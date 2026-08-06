/**
 * مخططات التحقق لنظام المصادقة — الجزء 4.
 * تُستخدم في السيرفر (غلاف createApiRoute) وفي الواجهة معاً،
 * فلا يوجد أي تحقق موجود في المتصفح فقط.
 *
 * المرجع: PROJECT_SPEC.md القسم 4 — لا ثقة بأي بيانات قادمة من المتصفح.
 */
import { z } from 'zod'
import { email, password, phone, redeemCode, requiredText } from '@/lib/validators/common'

/** إنشاء حساب جديد */
export const signupSchema = z
  .object({
    full_name: requiredText('الاسم الكامل', 80),
    email,
    phone: phone.optional().or(z.literal('').transform(() => undefined)),
    password,
    confirm_password: z.string(),
    referral_code: redeemCode.optional().or(z.literal('').transform(() => undefined)),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: 'كلمتا المرور غير متطابقتين.',
    path: ['confirm_password'],
  })

export type SignupInput = z.infer<typeof signupSchema>

/** تسجيل الدخول */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'كلمة المرور مطلوبة.').max(72, 'كلمة المرور طويلة جداً.'),
  next: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

/** طلب رابط استعادة كلمة المرور */
export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

/** إعادة إرسال رسالة تفعيل البريد */
export const resendVerificationSchema = z.object({ email })
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>

/** تعيين كلمة مرور جديدة بعد فتح رابط الاستعادة */
export const resetPasswordSchema = z
  .object({
    password,
    confirm_password: z.string(),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: 'كلمتا المرور غير متطابقتين.',
    path: ['confirm_password'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
