/**
 * تحديث جلسة Supabase وحماية المسارات على مستوى الطلب.
 * يُنادى من proxy.ts في جذر المشروع.
 *
 * ملاحظة أمنية: هذه الطبقة راحة للمستخدم (توجيه مبكر) وليست خط الدفاع.
 * خط الدفاع الحقيقي هو RLS في قاعدة البيانات + التحقق في lib/security/guards.ts.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'
import type { Database } from '@/types/database'

/** مسارات العميل التي تتطلب تسجيل دخول */
const PROTECTED_CUSTOMER_PREFIXES = [
  '/wallet',
  '/orders',
  '/checkout',
  '/account',
  '/referrals',
  '/notifications',
]

/** مسارات لوحة الأدمن */
const ADMIN_PREFIX = '/admin'

/** صفحات المصادقة — يُمنع دخولها لو المستخدم مسجّل بالفعل */
const AUTH_PREFIXES = ['/login', '/signup', '/forgot-password']

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // getUser يتحقق من التوكن عند Supabase — لا نعتمد أبداً على getSession وحدها
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  if (!user && (startsWithAny(pathname, PROTECTED_CUSTOMER_PREFIXES) || pathname.startsWith(ADMIN_PREFIX))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(url)
  }

  if (user && startsWithAny(pathname, AUTH_PREFIXES)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (user && pathname.startsWith(ADMIN_PREFIX)) {
    // جدول admin_roles غير مرئي للعميل في RLS، لذا نستخدم الدالة الآمنة
    // current_admin_role() التي تُرجع دور المستخدم الحالي فقط.
    const [{ data: adminRole }, { data: profile }] = await Promise.all([
      supabase.rpc('current_admin_role'),
      supabase.from('users').select('is_banned').eq('id', user.id).maybeSingle(),
    ])

    if (!adminRole || profile?.is_banned) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return response
}
