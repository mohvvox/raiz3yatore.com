/**
 * عميل Supabase للسيرفر (Server Components / Route Handlers / Server Actions).
 * المرجع: PROJECT_SPEC.md القسم 4.
 *
 * يعمل بمفتاح anon وبجلسة المستخدم من الكوكيز، فتنطبق عليه سياسات RLS كاملة.
 * لأي عملية تتجاوز RLS (رصيد / أدمن) استخدم lib/supabase/admin.ts داخل السيرفر فقط.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // الكتابة على الكوكيز غير مسموحة داخل Server Component —
          // تحديث الجلسة يتم في proxy.ts، لذا يمكن تجاهل الخطأ بأمان.
        }
      },
    },
  })
}
