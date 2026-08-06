import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/customer/auth/auth-shell'
import { ForgotPasswordForm } from '@/components/customer/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'استعادة كلمة المرور',
  description: 'أرسل رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="استعادة كلمة المرور"
      description="أدخل بريدك الإلكتروني وسنرسل لك رابطاً لتعيين كلمة مرور جديدة."
      footer={
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
