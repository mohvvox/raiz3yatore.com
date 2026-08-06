/**
 * تخطيط واجهة العميل.
 * الهيدر والفوتر وقائمة التنقل تُضاف في الجزء 6 (الهيكل العام للموقع)
 * داخل هذا الملف نفسه — لا تنشئ تخطيطاً موازياً.
 */
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-dvh bg-background text-foreground">{children}</div>
}
