/**
 * نموذج إنشاء حساب — الجزء 4.
 * كود الإحالة اختياري ويُتحقق منه في السيرفر فقط (لا يُكشف صاحبه للمتصفح).
 */
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FormAlert, Field, PasswordField, SubmitButton } from '@/components/customer/auth/form-parts'
import { postJson } from '@/lib/api/client'
import { signupSchema } from '@/lib/validators/auth'

type SignupResult = { needsEmailConfirmation: boolean; email: string }

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [values, setValues] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    referral_code: searchParams.get('ref') ?? '',
  })
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function update(key: keyof typeof values) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, [key]: event.target.value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = signupSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'البيانات المُدخلة غير صحيحة.')
      return
    }

    setPending(true)
    const result = await postJson<SignupResult>('/api/auth/signup', parsed.data)

    if (!result.success) {
      setError(result.error)
      setPending(false)
      return
    }

    if (result.data.needsEmailConfirmation) {
      router.replace(`/verify-email?email=${encodeURIComponent(result.data.email)}`)
      return
    }

    router.replace('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field
        label="الاسم الكامل"
        name="full_name"
        autoComplete="name"
        required
        value={values.full_name}
        onChange={update('full_name')}
      />

      <Field
        label="البريد الإلكتروني"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        dir="ltr"
        required
        value={values.email}
        onChange={update('email')}
      />

      <Field
        label="رقم الهاتف (اختياري)"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        dir="ltr"
        hint="بصيغة دولية أو محلية، أرقام فقط. يُستخدم للتواصل بخصوص طلباتك."
        value={values.phone}
        onChange={update('phone')}
      />

      <PasswordField
        label="كلمة المرور"
        name="password"
        autoComplete="new-password"
        dir="ltr"
        required
        hint="8 أحرف على الأقل، وتحتوي على حرف ورقم."
        value={values.password}
        onChange={update('password')}
      />

      <PasswordField
        label="تأكيد كلمة المرور"
        name="confirm_password"
        autoComplete="new-password"
        dir="ltr"
        required
        value={values.confirm_password}
        onChange={update('confirm_password')}
      />

      <Field
        label="كود الإحالة (اختياري)"
        name="referral_code"
        dir="ltr"
        className="font-mono uppercase"
        hint="لو وصلك كود من صديق، أدخله هنا."
        value={values.referral_code}
        onChange={update('referral_code')}
      />

      {error ? <FormAlert tone="error">{error}</FormAlert> : null}

      <SubmitButton pending={pending} pendingLabel="جارٍ إنشاء الحساب">
        إنشاء الحساب
      </SubmitButton>
    </form>
  )
}
