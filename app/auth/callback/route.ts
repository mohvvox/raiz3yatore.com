/**
 * GET /auth/callback — نقطة رجوع روابط البريد (تفعيل الحساب واستعادة كلمة المرور).
 *
 * استثناء موثّق من قاعدة "كل مسار داخل createApiRoute": هذا ليس مسار API
 * يعيد JSON، بل نقطة إعادة توجيه للمتصفح، ولا تقبل أي مدخلات غير ما يضعه
 * Supabase في الرابط.
 *
 * حماية Open Redirect: مسار الرجوع يُنظَّف بـ safeNextPath فلا يمكن تحويل
 * المستخدم لموقع خارجي بعد تسجيل الدخول.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { ensureProfileFromAuthUser } from '@/lib/auth/profile'
import { safeNextPath } from '@/lib/auth/urls'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeNextPath(searchParams.get('next'))
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const supabase = await createClient()
  let failed = true

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    failed = Boolean(error)
    if (error) console.error('[v0] auth callback exchange failed:', error.message)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'recovery' | 'invite' | 'email_change' | 'magiclink',
      token_hash: tokenHash,
    })
    failed = Boolean(error)
    if (error) console.error('[v0] auth callback verifyOtp failed:', error.message)
  }

  if (failed) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  // شبكة أمان: لو فُقد البروفايل لأي سبب يُنشأ الآن (ومعه المحفظة عبر التريجر)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) await ensureProfileFromAuthUser(user)

  return NextResponse.redirect(`${origin}${next}`)
}
