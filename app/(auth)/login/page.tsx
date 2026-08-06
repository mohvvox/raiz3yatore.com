import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthShell } from '@/components/customer/auth/auth-shell'
import { LoginForm } from '@/components/customer/auth/login-form'

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  description: 'سجّل الدخول إلى حسابك في RAIZEY STORE لمتابعة طلباتك ورصيد محفظتك.',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="تسجيل الدخول"
      description="أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى محفظتك وطلباتك."
      footer={
        <>
          <span>ليس لديك حساب؟ </span>
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            إنشاء حساب جديد
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
