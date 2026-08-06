/**
 * تحديث جلسة Supabase وحماية المسارات على مستوى الطلب.
 * يُنادى من proxy.ts في جذر المشروع.
 *
 * ملاحظة أمنية: هذه الطبقة راحة للمستخدم (توجيه مبكر) وليست خط الدفاع.
 * خط الدفاع الحقيقي هو RLS في قاعدة البيانات + التحقق في lib/security/guards.ts.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from '@/lib/env'
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

  // بدون متغيرات Supabase لا توجد جلسة يمكن تحديثها. نمرّر الطلب كما هو
  // بدل إسقاط كل مسارات الموقع بخطأ 500 غامض.
  if (!hasSupabaseEnv()) {
    console.error(
      '[v0] متغيرات Supabase غير مضبوطة (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). تم تخطي تحديث الجلسة.',
    )
    return response
  }

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
    // سياسة admin_roles_select_own في قاعدة البيانات تسمح للمستخدم بقراءة صفّه
    // هو فقط، فالقراءة المباشرة هنا آمنة ولا تكشف بقية المشرفين.
    const [{ data: adminRole }, { data: profile }] = await Promise.all([
      supabase.from('admin_roles').select('role').eq('user_id', user.id).maybeSingle(),
      supabase.from('users').select('is_banned').eq('id', user.id).maybeSingle(),
    ])

    if (!adminRole?.role || profile?.is_banned) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return response
}
