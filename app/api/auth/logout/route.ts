/**
 * POST /api/auth/logout — تسجيل الخروج وإبطال الجلسة.
 * POST فقط (وليس GET) حتى لا يُخرج المستخدم برابط أو صورة مدسوسة — حماية CSRF.
 */
import { createApiRoute } from '@/lib/api/route'
import { createClient } from '@/lib/supabase/server'

export const POST = createApiRoute<'public', undefined>(
  { auth: 'public', rateLimit: 'write', allowBanned: true },
  async () => {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return { signedOut: true }
  },
)
