import { KeyRound } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/customer/auth/auth-shell'
import { ResetPasswordForm } from '@/components/customer/auth/reset-password-form'
import { getSessionUser } from '@/lib/security/guards'

export const metadata: Metadata = {
  title: 'تعيين كلمة مرور جديدة',
  description: 'اختر كلمة مرور جديدة لحسابك في RAIZEY STORE.',
}

export default async function ResetPasswordPage() {
  // الجلسة المؤقتة القادمة من رابط الاستعادة هي ما يثبت الهوية.
  // لا جلسة = الرابط منتهي أو مفتوح على متصفح مختلف.
  const user = await getSessionUser()

  if (!user) {
    return (
      <AuthShell
        title="الرابط غير صالح"
        description="انتهت صلاحية رابط الاستعادة أو فُتح على متصفح مختلف عن الذي طلبه."
        footer={
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            العودة إلى تسجيل الدخول
          </Link>
        }
      >
        <p className="flex items-start gap-2 rounded-lg border border-border bg-secondary p-3 text-sm leading-relaxed text-muted-foreground">
          <KeyRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            اطلب رابطاً جديداً من صفحة{' '}
            <Link href="/forgot-password" className="text-primary underline-offset-4 hover:underline">
              استعادة كلمة المرور
            </Link>
            ، وافتحه على نفس الجهاز والمتصفح.
          </span>
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="تعيين كلمة مرور جديدة"
      description="اختر كلمة مرور قوية لا تستخدمها في مواقع أخرى."
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
