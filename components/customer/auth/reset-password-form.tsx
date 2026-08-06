/**
 * نموذج تعيين كلمة مرور جديدة — الجزء 4.
 * يعمل فقط بعد فتح رابط الاستعادة (الجلسة المؤقتة هي ما يثبت الهوية).
 */
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormAlert, PasswordField, SubmitButton } from '@/components/customer/auth/form-parts'
import { postJson } from '@/lib/api/client'
import { resetPasswordSchema } from '@/lib/validators/auth'

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const parsed = resetPasswordSchema.safeParse({
      password,
      confirm_password: confirmPassword,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'البيانات المُدخلة غير صحيحة.')
      return
    }

    setPending(true)
    const result = await postJson<{ updated: boolean }>('/api/auth/reset-password', parsed.data)

    if (!result.success) {
      setError(result.error)
      setPending(false)
      return
    }

    setMessage('تم تحديث كلمة المرور بنجاح. جارٍ تحويلك إلى الصفحة الرئيسية.')
    router.replace('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <PasswordField
        label="كلمة المرور الجديدة"
        name="password"
        autoComplete="new-password"
        dir="ltr"
        required
        hint="8 أحرف على الأقل، وتحتوي على حرف ورقم."
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <PasswordField
        label="تأكيد كلمة المرور الجديدة"
        name="confirm_password"
        autoComplete="new-password"
        dir="ltr"
        required
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />

      {error ? <FormAlert tone="error">{error}</FormAlert> : null}
      {message ? <FormAlert tone="success">{message}</FormAlert> : null}

      <SubmitButton pending={pending} pendingLabel="جارٍ الحفظ">
        حفظ كلمة المرور
      </SubmitButton>
    </form>
  )
}
