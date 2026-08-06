/**
 * غلاف صفحات المصادقة — الجزء 4.
 * كل صفحات الدخول والتسجيل والاستعادة تستخدم هذا الغلاف حتى تبدو واحدة.
 * الألوان كلها من توكنات PROJECT_SPEC (ممنوع hex مباشر).
 */
import Link from 'next/link'
import type { ReactNode } from 'react'

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Link href="/" className="flex items-center gap-2 self-center">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-primary">RAIZEY</span> STORE
        </span>
      </Link>

      <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 md:p-7">
        <header className="flex flex-col gap-2 border-b border-border pb-5">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </header>
        {children}
      </section>

      {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  )
}
