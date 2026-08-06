/**
 * شكل استجابة الـ API الموحّد لكل المشروع.
 * المرجع: PROJECT_SPEC.md — القسم 5
 * ممنوع على أي وكيل تعريف شكل استجابة مختلف.
 */

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

/** مساعدات بناء الاستجابة داخل Route Handlers */
export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return { success: true, data }
}

export function apiError(error: string): ApiError {
  return { success: false, error }
}
