/**
 * POST /api/auth/reset-password — تعيين كلمة مرور جديدة.
 *
 * يُنادى بعد أن يفتح المستخدم رابط الاستعادة، لأن Supabase يمنحه جلسة
 * مؤقتة عند تبديل الكود في /auth/callback. لذلك المسار يشترط جلسة (auth: 'user')
 * ولا يقبل أي بريد أو توكن من جسم الطلب — الهوية من الجلسة فقط.
 *
 * التشفير: Supabase Auth يتولى تجزئة كلمة المرور (bcrypt).
 * ممنوع تخزين أو تجزئة كلمات المرور بأنفسنا في أي جزء من المشروع.
 */
import { createApiRoute } from '@/lib/api/route'
import { mapAuthError } from '@/lib/auth/errors'
import { createClient } from '@/lib/supabase/server'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators/auth'

export const POST = createApiRoute<'user', ResetPasswordInput>(
  { auth: 'user', schema: resetPasswordSchema, rateLimit: 'passwordReset' },
  async ({ body }) => {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: body.password })
    if (error) throw mapAuthError(error, 'reset-password')

    return { updated: true }
  },
)
