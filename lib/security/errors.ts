/**
 * أخطاء موحّدة للـ API — كل رسالة بالعربي وواضحة للمستخدم النهائي.
 * المرجع: PROJECT_SPEC.md القسم 5 (شكل الاستجابة عند الخطأ).
 *
 * قاعدة: ممنوع تسريب تفاصيل داخلية (SQL، أسماء أعمدة، stack) في رسالة الخطأ.
 */

export class HttpError extends Error {
  readonly status: number
  readonly headers?: Record<string, string>

  constructor(status: number, message: string, headers?: Record<string, string>) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.headers = headers
  }
}

export const errors = {
  badRequest: (message = 'طلب غير صالح.') => new HttpError(400, message),
  invalidInput: (message = 'البيانات المُرسلة غير صحيحة.') => new HttpError(422, message),
  unauthorized: (message = 'يجب تسجيل الدخول أولاً.') => new HttpError(401, message),
  forbidden: (message = 'لا تملك صلاحية تنفيذ هذه العملية.') => new HttpError(403, message),
  banned: () => new HttpError(403, 'هذا الحساب محظور. تواصل مع الدعم.'),
  notFound: (message = 'العنصر المطلوب غير موجود.') => new HttpError(404, message),
  conflict: (message = 'تعارض في البيانات، أعد المحاولة.') => new HttpError(409, message),
  tooManyRequests: (retryAfterSeconds: number) =>
    new HttpError(
      429,
      `عدد المحاولات كبير. أعد المحاولة بعد ${retryAfterSeconds} ثانية.`,
      { 'Retry-After': String(retryAfterSeconds) },
    ),
  internal: (message = 'حدث خطأ غير متوقع. أعد المحاولة لاحقاً.') => new HttpError(500, message),
}
