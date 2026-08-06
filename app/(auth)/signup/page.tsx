import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthShell } from '@/components/customer/auth/auth-shell'
import { SignupForm } from '@/components/customer/auth/signup-form'

export const metadata: Metadata = {
  title: 'إنشاء حساب',
  description: 'أنشئ حسابك في RAIZEY STORE للشحن الفوري ومتابعة طلباتك ورصيدك.',
}

export default function SignupPage() {
  return (
    <AuthShell
      title="إنشاء حساب جديد"
      description="دقيقة واحدة وتصير جاهز للشحن. سنرسل لك رسالة لتفعيل بريدك."
      footer={
        <>
          <span>لديك حساب بالفعل؟ </span>
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            تسجيل الدخول
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  )
}
