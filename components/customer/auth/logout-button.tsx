/**
 * زر تسجيل الخروج — الجزء 4.
 * يُستخدم في الهيدر (الجزء 6) وفي إعدادات الحساب (الجزء 16).
 * الخروج عبر POST وليس رابط GET حتى لا يُخرج المستخدم بطلب مدسوس (CSRF).
 */
'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { postJson } from '@/lib/api/client'

export function LogoutButton({
  variant = 'ghost',
  withLabel = true,
}: {
  variant?: 'ghost' | 'outline' | 'secondary'
  withLabel?: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
    await postJson('/api/auth/logout')
    router.replace('/')
    router.refresh()
    setPending(false)
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleLogout}
      disabled={pending}
      aria-label="تسجيل الخروج"
    >
      <LogOut className="size-4" aria-hidden="true" />
      {withLabel ? <span>تسجيل الخروج</span> : null}
    </Button>
  )
}
