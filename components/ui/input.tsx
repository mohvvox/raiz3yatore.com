/**
 * حقل إدخال أساسي مشترك.
 * جزء من نظام التصميم (يوسَّع في الجزء 5). يعتمد توكنات الألوان في globals.css فقط.
 *
 * ملاحظة RTL: الموقع بالكامل dir="rtl"، فالمحاذاة تتبع الاتجاه تلقائياً.
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none',
        'placeholder:text-muted-foreground',
        'selection:bg-primary selection:text-primary-foreground',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40',
        'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/25',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
