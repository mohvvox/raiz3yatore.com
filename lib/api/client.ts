/**
 * مساعد نداء الـ API من المتصفح — يفرض شكل الاستجابة الموحّد.
 * المرجع: PROJECT_SPEC.md القسم 5.
 *
 * ممنوع على أي جزء استخدام fetch مباشرة على /api ثم تفسير الاستجابة بطريقته.
 */
import type { ApiResponse } from '@/types/api'

export async function postJson<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })

    const payload = (await response.json()) as ApiResponse<T>
    if (typeof payload?.success !== 'boolean') {
      return { success: false, error: 'استجابة غير متوقعة من السيرفر.' }
    }
    return payload
  } catch {
    return { success: false, error: 'تعذّر الاتصال بالسيرفر. تحقّق من الإنترنت وأعد المحاولة.' }
  }
}

export async function getJson<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(path, { headers: { Accept: 'application/json' } })
    const payload = (await response.json()) as ApiResponse<T>
    if (typeof payload?.success !== 'boolean') {
      return { success: false, error: 'استجابة غير متوقعة من السيرفر.' }
    }
    return payload
  } catch {
    return { success: false, error: 'تعذّر الاتصال بالسيرفر. تحقّق من الإنترنت وأعد المحاولة.' }
  }
}
