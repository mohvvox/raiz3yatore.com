import { TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'تعذّر إتمام العملية',
  robots: { index: false, follow: false },
}

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive"
        aria-hidden="true"
      >
        <TriangleAlert className="size-7" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">انتهت صلاحية الرابط</h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          الرابط غير صالح أو انتهت صلاحيته. جرّب تسجيل الدخول من جديد، وإن لزم اطلب رابطاً جديداً.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Button render={<Link href="/login" />} className="h-11 w-full">
          العودة لتسجيل الدخول
        </Button>
        <Button render={<Link href="/forgot-password" />} variant="ghost" className="h-11 w-full">
          طلب رابط جديد
        </Button>
      </div>
    </div>
  )
}
