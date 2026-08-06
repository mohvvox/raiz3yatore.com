/**
 * عميل Supabase للمتصفح (Client Components).
 * المرجع: PROJECT_SPEC.md القسم 4.
 *
 * يستخدم مفتاح anon فقط، وكل قراءة أو كتابة منه تمر عبر سياسات RLS.
 * ممنوع استخدامه لأي عملية مالية أو إدارية — تلك تمر عبر /api فقط.
 */
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'
import type { Database } from '@/types/database'

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!cached) {
    cached = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey())
  }
  return cached
}
