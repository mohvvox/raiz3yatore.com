/**
 * GET /auth/callback — استبدال كود Supabase بجلسة بعد فتح رابط البريد.
 * المرجع: مهارة supabase-on-vercel.
 *
 * يُستخدم لتفعيل الحساب (رابط التأكيد) واستعادة كلمة المرور (رابط recovery).
 * بروكسي v0 في التطوير يوجّه تلقائياً إلى هذا المسار.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  // next محصور في مسارات داخلية فقط لمنع التوجيه المفتوح (open redirect)
  const nextParam = searchParams.get('next') ?? '/'
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
