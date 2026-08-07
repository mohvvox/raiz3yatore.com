/**
 * مساعد fetch لجهة العميل — يفهم شكل الاستجابة الموحّد { success, data|error }.
 * المرجع: types/api.ts + PROJECT_SPEC.md القسم 5.
 *
 * يرمي ApiRequestError عند فشل الطلب حتى تتعامل النماذج مع رسالة واحدة واضحة.
 */
'use client'

import type { ApiResponse } from '@/types/api'

export class ApiRequestError extends Error {
  readonly status: number
  readonly retryAfterSeconds: number | null

  constructor(message: string, status: number, retryAfterSeconds: number | null = null) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

const GENERIC_ERROR = 'تعذّر إتمام الطلب. تحقّق من اتصالك وأعد المحاولة.'

/**
 * POST JSON إلى مسار داخلي ويعيد data عند النجاح.
 * @param path مسار يبدأ بـ /api
 * @param payload جسم الطلب
 */
export async function postJson<TData, TBody extends object = object>(
  path: string,
  payload: TBody,
): Promise<TData> {
  let response: Response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ApiRequestError(GENERIC_ERROR, 0)
  }

  let json: ApiResponse<TData> | null = null
  try {
    json = (await response.json()) as ApiResponse<TData>
  } catch {
    json = null
  }

  if (!response.ok || !json || json.success === false) {
    const message = json && json.success === false ? json.error : GENERIC_ERROR
    const retryAfterHeader = response.headers.get('Retry-After')
    const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : null
    throw new ApiRequestError(
      message,
      response.status,
      Number.isFinite(retryAfter) ? retryAfter : null,
    )
  }

  return json.data
}
