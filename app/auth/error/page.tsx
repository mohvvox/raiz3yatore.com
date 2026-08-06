import { ShieldAlert } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/customer/auth/auth-shell'

export const metadata: Metadata = {
  title: 'تعذّر إكمال العملية',
  description: 'انتهت صلاحية رابط المصادقة أو أنه غير صالح.',
}

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-5 py-12">
      <AuthShell
        title="تعذّر إكمال العملية"
        description="الرابط الذي فتحته غير صالح أو انتهت صلاحيته."
        footer={
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            العودة إلى تسجيل الدخول
          </Link>
        }
      >
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm leading-relaxed text-destructive">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            روابط التفعيل والاستعادة تُستخدم مرة واحدة ولها مدة صلاحية قصيرة. اطلب رابطاً جديداً ثم
            افتحه على نفس الجهاز والمتصفح.
          </span>
        </p>
      </AuthShell>
    </main>
  )
}
