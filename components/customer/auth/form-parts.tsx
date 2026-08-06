/**
 * حقول ورسائل نماذج المصادقة — الجزء 4.
 * ملاحظة للأجزاء التالية: نظام التصميم الكامل يُبنى في الجزء 5،
 * وهذه المكونات مبنية على components/ui فلا تتعارض معه.
 *
 * ممنوع استخدام أي إيموجي — كل الرموز أيقونات lucide-react.
 */
'use client'

import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useId, useState, type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function Field({
  label,
  hint,
  className,
  ...props
}: ComponentProps<'input'> & { label: string; hint?: string }) {
  const generatedId = useId()
  const id = props.id ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className={cn('h-11 rounded-lg', className)} {...props} />
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function PasswordField({
  label,
  hint,
  ...props
}: Omit<ComponentProps<'input'>, 'type'> & { label: string; hint?: string }) {
  const generatedId = useId()
  const id = props.id ?? generatedId
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          className="h-11 rounded-lg pl-11"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 left-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function FormAlert({ tone, children }: { tone: 'error' | 'success'; children: string }) {
  const isError = tone === 'error'
  const Icon = isError ? AlertCircle : CheckCircle2

  return (
    <p
      role={isError ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-lg border p-3 text-sm leading-relaxed',
        isError
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-primary/30 bg-primary/10 text-primary',
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

export function SubmitButton({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean
  pendingLabel: string
  children: string
}) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="h-11 w-full text-sm">
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
