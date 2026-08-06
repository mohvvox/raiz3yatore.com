/**
 * تخطيط صفحات المصادقة — الجزء 4.
 * صفحات هذه المجموعة: /login و /signup و /forgot-password و /reset-password
 * و /verify-email. حماية الوصول إليها ومنع دخولها للمسجّل بالفعل في proxy.ts.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-5 py-12">
      {children}
    </main>
  )
}
