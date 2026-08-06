/**
 * Proxy (كان اسمه middleware في الإصدارات السابقة من Next.js).
 * وظيفته: تحديث جلسة Supabase على كل طلب + توجيه مبكر للمسارات المحمية.
 *
 * تنبيه: هذه طبقة راحة فقط. الحماية الفعلية في RLS داخل قاعدة البيانات
 * وفي lib/security/guards.ts داخل الـ API.
 */
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * كل المسارات ما عدا الملفات الثابتة والصور.
     * مسارات /api تمر أيضاً حتى تُحدَّث الجلسة قبل قراءتها في الـ handlers.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|glb|gltf)$).*)',
  ],
}
