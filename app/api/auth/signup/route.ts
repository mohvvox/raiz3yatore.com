/**
 * POST /api/auth/signup — إنشاء حساب جديد (الجزء 4.1).
 * المرجع: PROJECT_SPEC.md القسمان 4 و 5 + مهارة supabase-on-vercel.
 *
 * التدفّق:
 *   1. تحديد المعدل بالـ IP (RATE_LIMITS.signup) عبر غلاف createApiRoute.
 *   2. التحقق من كود الإحالة (إن وُجد) قبل إنشاء أي شيء.
 *   3. supabase.auth.signUp مع emailRedirectTo يمرّ عبر بروكسي v0 إلى /auth/callback.
 *   4. تهيئة صف users + المحفظة + قيد الإحالة بمفتاح service role.
 *   5. عدم كشف إن كان البريد مسجّلاً مسبقاً (مقاومة تعداد الحسابات).
 *
 * التفعيل عبر البريد مُفعّل افتراضياً، لذا لا تُفتح جلسة هنا — المستخدم يفعّل
 * حسابه من رابط البريد ثم يسجّل الدخول.
 */
import { createApiRoute } from '@/lib/api/route'
import { createClient } from '@/lib/supabase/server'
import { signupInput, type SignupInput } from '@/lib/validators/auth'
import { mapAuthError } from '@/lib/auth/errors'
import { bootstrapUserProfile, resolveReferrer } from '@/lib/auth/profile'
import { errors } from '@/lib/security/errors'

const ACTIVATION_MESSAGE =
  'تم إنشاء الحساب. أرسلنا رابط تفعيل إلى بريدك الإلكتروني، افتحه لتفعيل حسابك ثم سجّل الدخول.'

export const POST = createApiRoute<'public', SignupInput>(
  { auth: 'public', schema: signupInput, rateLimit: 'signup' },
  async ({ body, request }) => {
    // 2) التحقق من كود الإحالة قبل إنشاء المستخدم لتفادي حسابات يتيمة
    let referredBy: string | null = null
    if (body.referral_code) {
      referredBy = await resolveReferrer(body.referral_code)
      if (!referredBy) throw errors.invalidInput('كود الإحالة غير صالح.')
    }

    const supabase = await createClient()

    // رابط التفعيل: في بيئة التطوير يمرّ عبر بروكسي v0، وإلا مسار /auth/callback
    const origin = new URL(request.url).origin
    const emailRedirectTo =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${origin}/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        emailRedirectTo,
        data: { full_name: body.full_name, phone: body.phone },
      },
    })

    if (error) throw mapAuthError(error, 'signup')

    // Supabase يعيد مستخدماً بقائمة identities فارغة عندما يكون البريد مسجّلاً
    // مسبقاً — لا نكشف ذلك، ونعيد نفس رسالة النجاح.
    const isExistingUser = data.user && (data.user.identities?.length ?? 0) === 0
    if (data.user && !isExistingUser) {
      await bootstrapUserProfile({
        userId: data.user.id,
        fullName: body.full_name,
        phone: body.phone,
        referredBy,
      })
    }

    return { message: ACTIVATION_MESSAGE, email: body.email }
  },
)
