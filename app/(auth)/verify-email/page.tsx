import { MailCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/customer/auth/auth-shell'
import { ResendVerificationForm } from '@/components/customer/auth/resend-verification-form'

export const metadata: Metadata = {
  title: 'تفعيل البريد الإلكتروني',
  description: 'افتح رابط التفعيل المرسل إلى بريدك لإكمال إنشاء حسابك.',
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <AuthShell
      title="فعّل بريدك الإلكتروني"
      description="أنشأنا حسابك، وبقي أن تؤكد بريدك حتى تتمكن من الشراء وشحن المحفظة."
      footer={
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm leading-relaxed text-muted-foreground">
          <MailCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            أرسلنا رابط التفعيل
            {email ? (
              <>
                {' إلى '}
                <span className="font-mono text-foreground" dir="ltr">
                  {email}
                </span>
              </>
            ) : (
              ' إلى بريدك'
            )}
            . افتح الرابط من نفس الجهاز، وتحقّق من مجلد الرسائل غير المرغوبة إن لم تجده.
          </span>
        </p>

        <ResendVerificationForm defaultEmail={email ?? ''} />
      </div>
    </AuthShell>
  )
}
