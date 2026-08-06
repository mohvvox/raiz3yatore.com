/**
 * عميل Supabase بصلاحية service role — يتجاوز RLS بالكامل.
 * المرجع: PROJECT_SPEC.md القسم 4.
 *
 * قواعد الاستخدام (إلزامية):
 *  1. ممنوع استيراد هذا الملف في أي كومبوننت عميل أو ملف فيه 'use client'.
 *  2. لا يُستخدم إلا بعد التحقق من الهوية والصلاحية عبر lib/security/guards.ts.
 *  3. كل عملية على الرصيد تمر عبر الدالة الذرية apply_wallet_transaction فقط.
 */
import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/env'
import type { Database } from '@/types/database'

let cached: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createAdminClient() {
  if (!cached) {
    cached = createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return cached
}
