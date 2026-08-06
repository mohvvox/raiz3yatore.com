/**
 * إعادة إرسال رسالة تفعيل البريد — الجزء 4.
 */
'use client'

import { useState } from 'react'
import { FormAlert, Field, SubmitButton } from '@/components/customer/auth/form-parts'
import { postJson } from '@/lib/api/client'
import { resendVerificationSchema } from '@/lib/validators/auth'

export function ResendVerificationForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const parsed = resendVerificationSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'البريد الإلكتروني غير صالح.')
      return
    }

    setPending(true)
    const result = await postJson<{ message: string }>(
      '/api/auth/resend-verification',
      parsed.data,
    )
    setPending(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    setMessage(result.data.message)
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

      {error ? <FormAlert tone="error">{error}</FormAlert> : null}
      {message ? <FormAlert tone="success">{message}</FormAlert> : null}

      <SubmitButton pending={pending} pendingLabel="جارٍ الإرسال">
        إعادة إرسال رسالة التفعيل
      </SubmitButton>
    </form>
  )
}
