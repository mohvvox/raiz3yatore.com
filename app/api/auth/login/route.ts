/**
 * POST /api/auth/login — تسجيل الدخول (الجزء 4.1).
 * المرجع: PROJECT_SPEC.md القسمان 4 و 5 + مهارة supabase-on-vercel.
 *
 * إجراء المصادقة يتم في السيرفر عمداً حتى يكون تحديد المعدل جماعياً على مستوى
 * الموقع (لا يعتمد على IP كل مستخدم فقط)، وحتى لا تظهر رسائل Supabase الخام
 * في استجابة الشبكة. الحماية المتقدّمة من التكرار لكل حساب تُضاف في الجزء 4.4.
 *
 * عند النجاح يضبط عميل السيرفر كوكيز الجلسة تلقائياً على الاستجابة.
 */
import { createApiRoute } from '@/lib/api/route'
import { createClient } from '@/lib/supabase/server'
import { loginInput, type LoginInput } from '@/lib/validators/auth'
import { mapAuthError } from '@/lib/auth/errors'

export const POST = createApiRoute<'public', LoginInput>(
  { auth: 'public', schema: loginInput, rateLimit: 'login' },
  async ({ body }) => {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (error) throw mapAuthError(error, 'login')

    return {
      user: { id: data.user.id, email: data.user.email },
    }
  },
)
