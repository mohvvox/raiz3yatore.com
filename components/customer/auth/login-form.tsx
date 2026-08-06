/**
 * نموذج تسجيل الدخول — الجزء 4.
 * لا ينادي Supabase مباشرة: كل شيء يمر على /api/auth/login حتى يُطبَّق
 * تحديد المعدل وفحص الحظر في السيرفر ولا تُكشف رسائل الخطأ الأصلية.
 */
'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FormAlert, Field, PasswordField, SubmitButton } from '@/components/customer/auth/form-parts'
import { postJson } from '@/lib/api/client'
import { loginSchema } from '@/lib/validators/auth'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = loginSchema.safeParse({ email, password, next })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'البيانات المُدخلة غير صحيحة.')
      return
    }

    setPending(true)
    const result = await postJson<{ redirectTo: string }>('/api/auth/login', parsed.data)

    if (!result.success) {
      setError(result.error)
      setPending(false)
      return
    }

    router.replace(result.data.redirectTo || '/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field
        label="البريد الإلكتروني"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        dir="ltr"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <div className="flex flex-col gap-2">
        <PasswordField
          label="كلمة المرور"
          name="password"
          autoComplete="current-password"
          dir="ltr"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Link
          href="/forgot-password"
          className="self-start text-xs text-primary underline-offset-4 hover:underline"
        >
          نسيت كلمة المرور؟
        </Link>
      </div>

      {error ? <FormAlert tone="error">{error}</FormAlert> : null}

      <SubmitButton pending={pending} pendingLabel="جارٍ الدخول">
        تسجيل الدخول
      </SubmitButton>
    </form>
  )
}
