/**
 * قواعد التحقق الخاصة بالمصادقة (Zod) — الجزء 4.
 * المرجع: PROJECT_SPEC.md القسمان 4 و 5.
 *
 * كل الرسائل بالعربي لأنها تُعرض للمستخدم كما هي.
 * لا نثق بأي بيانات قادمة من المتصفح — كل مسار مصادقة يتحقق بهذه المخططات.
 */
import { z } from 'zod'
import { email, password, phone, requiredText } from '@/lib/validators/common'

/**
 * كود الإحالة المُدخل عند التسجيل (كود صاحب الدعوة).
 * اختياري، ويُطبَّع لحروف كبيرة. صيغة الأكواد المولّدة: حروف وأرقام فقط.
 */
export const referralCodeInput = z
  .string()
  .trim()
  .toUpperCase()
  .min(4, 'كود الإحالة غير صالح.')
  .max(16, 'كود الإحالة غير صالح.')
  .regex(/^[A-Z0-9]+$/, 'كود الإحالة غير صالح.')

/** إنشاء حساب جديد */
export const signupInput = z.object({
  full_name: requiredText('الاسم الكامل', 80),
  phone,
  email,
  password,
  /** كود إحالة اختياري — فارغ يعني بدون إحالة */
  referral_code: z
    .union([referralCodeInput, z.literal('')])
    .optional()
    .transform((value) => (value ? value : undefined)),
})
export type SignupInput = z.infer<typeof signupInput>

/**
 * تسجيل الدخول.
 * ملاحظة: لا نطبّق سياسة قوة كلمة المرور هنا — الحسابات القديمة قد تخالفها،
 * ونحن نتحقق فقط من أن الحقل غير فارغ ثم نترك Supabase يحكم على الصحة.
 */
export const loginInput = z.object({
  email,
  password: z.string().min(1, 'كلمة المرور مطلوبة.').max(72, 'كلمة المرور طويلة جداً.'),
})
export type LoginInput = z.infer<typeof loginInput>

/** طلب رابط استعادة كلمة المرور */
export const forgotPasswordInput = z.object({ email })
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInput>

/** تعيين كلمة مرور جديدة بعد فتح رابط الاستعادة (الجلسة نوعها recovery) */
export const resetPasswordInput = z.object({ password })
export type ResetPasswordInput = z.infer<typeof resetPasswordInput>

/** إعادة إرسال رابط التفعيل */
export const resendActivationInput = z.object({ email })
export type ResendActivationInput = z.infer<typeof resendActivationInput>
