/**
 * POST /api/auth/signup — إنشاء حساب جديد.
 * المرجع: PROJECT_SPEC.md القسم 5، الجزء 4 من الخطة.
 *
 * لماذا في السيرفر وليس من المتصفح مباشرة؟
 *  - حتى يمكن فرض تحديد المعدل بأنفسنا (حماية من brute-force وإنشاء حسابات آلي).
 *  - حتى لا تظهر رسالة خطأ Supabase الأصلية في شبكة المتصفح.
 *  - حتى يُنشأ صف البروفايل بمفتاح service role قبل تفعيل البريد.
 */
import { createApiRoute } from '@/lib/api/route'
import { mapAuthError } from '@/lib/auth/errors'
import {
  ensureUserProfile,
  isPhoneTaken,
  resolveReferrerId,
} from '@/lib/auth/profile'
import { authCallbackUrl } from '@/lib/auth/urls'
import { errors } from '@/lib/security/errors'
import { createClient } from '@/lib/supabase/server'
import { signupSchema, type SignupInput } from '@/lib/validators/auth'

export const POST = createApiRoute<'public', SignupInput>(
  { auth: 'public', schema: signupSchema, rateLimit: 'signup' },
  async ({ body }) => {
    // 1) رقم الهاتف فريد على مستوى قاعدة البيانات — نتحقق مبكراً برسالة واضحة
    if (body.phone && (await isPhoneTaken(body.phone))) {
      throw errors.conflict('رقم الهاتف مستخدم بحساب آخر.')
    }

    // 2) كود الإحالة يُترجم لمعرّف صاحبه في السيرفر فقط
    let referredBy: string | null = null
    if (body.referral_code) {
      referredBy = await resolveReferrerId(body.referral_code)
      if (!referredBy) throw errors.invalidInput('كود الإحالة غير صحيح.')
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        emailRedirectTo: authCallbackUrl('/'),
        data: {
          full_name: body.full_name,
          phone: body.phone ?? null,
          referred_by: referredBy,
        },
      },
    })

    if (error) throw mapAuthError(error, 'signup')

    const user = data.user
    if (!user) throw errors.internal()

    // Supabase يعيد مستخدماً "وهمياً" بقائمة identities فارغة لو البريد مسجّل
    // مسبقاً (منع تخمين الحسابات). نرجّع نفس الرد العام ولا ننشئ أي بروفايل.
    const isExistingEmail = Array.isArray(user.identities) && user.identities.length === 0
    if (!isExistingEmail) {
      await ensureUserProfile({
        userId: user.id,
        fullName: body.full_name,
        phone: body.phone ?? null,
        referredBy,
      })
    }

    return {
      needsEmailConfirmation: !data.session,
      email: body.email,
    }
  },
)
