/**
 * قواعد التحقق المشتركة (Zod) — مصدر واحد للحقيقة.
 * المرجع: PROJECT_SPEC.md القسم 4 (لا ثقة بأي بيانات قادمة من المتصفح).
 *
 * كل رسائل الخطأ بالعربي لأنها تُعرض للمستخدم كما هي.
 */
import { z } from 'zod'

/** معرّف UUID */
export const uuid = z.string().uuid('معرّف غير صالح.')

/** نص مطلوب مع حد أقصى، ويُنظَّف من الفراغات الزائدة */
export function requiredText(field: string, max = 200) {
  return z
    .string({ message: `${field} مطلوب.` })
    .trim()
    .min(1, `${field} مطلوب.`)
    .max(max, `${field} يجب أن يكون ${max} حرفاً على الأكثر.`)
}

/** مبلغ مالي numeric(12,2): موجب، بمنزلتين عشريتين، وبحد أعلى منطقي */
export const money = z
  .number({ message: 'المبلغ يجب أن يكون رقماً.' })
  .finite('المبلغ غير صالح.')
  .positive('المبلغ يجب أن يكون أكبر من صفر.')
  .max(9_999_999.99, 'المبلغ أكبر من الحد المسموح.')
  .refine((value) => Math.round(value * 100) === value * 100, 'المبلغ يقبل منزلتين عشريتين فقط.')

/** كمية عناصر السلة — عدد صحيح بحد أقصى لمنع الطلبات الضخمة */
export const quantity = z
  .number({ message: 'الكمية يجب أن تكون رقماً.' })
  .int('الكمية يجب أن تكون عدداً صحيحاً.')
  .min(1, 'الكمية يجب أن تكون 1 على الأقل.')
  .max(100, 'الكمية أكبر من الحد المسموح لكل عنصر.')

/** رقم هاتف بصيغة دولية أو محلية بسيطة */
export const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{9,15}$/, 'رقم الهاتف غير صالح.')

export const email = z.string().trim().toLowerCase().email('البريد الإلكتروني غير صالح.')

/**
 * كلمة المرور: 8 أحرف على الأقل مع حرف ورقم.
 * التشفير نفسه تتولاه Supabase Auth (bcrypt) — ممنوع تخزين كلمات مرور بأنفسنا.
 */
export const password = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.')
  .max(72, 'كلمة المرور طويلة جداً.')
  .regex(/[A-Za-z\u0600-\u06FF]/, 'كلمة المرور يجب أن تحتوي على حرف واحد على الأقل.')
  .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.')

/** كود كوبون أو كارت هدية: حروف وأرقام وشرطة فقط */
export const redeemCode = z
  .string()
  .trim()
  .toUpperCase()
  .min(4, 'الكود قصير جداً.')
  .max(32, 'الكود طويل جداً.')
  .regex(/^[A-Z0-9-]+$/, 'الكود يحتوي على رموز غير مسموحة.')

/** slug للألعاب والتصنيفات */
export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'المعرّف قصير جداً.')
  .max(60, 'المعرّف طويل جداً.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'المعرّف يقبل حروفاً إنجليزية صغيرة وأرقاماً وشرطات فقط.')

/**
 * رابط داخلي للتخزين (صور الإيصالات والمنتجات).
 * يُرفض أي رابط خارجي لمنع تخزين محتوى غير موثوق أو تسريب بيانات.
 */
export const storageUrl = z
  .string()
  .trim()
  .url('الرابط غير صالح.')
  .max(500, 'الرابط طويل جداً.')
  .refine(
    (value) => /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\//.test(value),
    'يُسمح فقط بروابط التخزين الخاصة بالموقع.',
  )

/** ترقيم الصفحات لكل قوائم الأدمن والعميل */
export const pagination = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
})

/**
 * تنظيف نص حر قادم من المستخدم (تعليق تقييم، ملاحظات الطلب) من وسوم HTML.
 * الحماية الأساسية من XSS هي أن React يهرّب النصوص تلقائياً؛ هذا تنظيف إضافي
 * وممنوع استخدام dangerouslySetInnerHTML مع أي نص مستخدم في أي جزء.
 */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim()
}

export const freeText = (field: string, max = 1000) =>
  z
    .string({ message: `${field} مطلوب.` })
    .trim()
    .max(max, `${field} يجب أن يكون ${max} حرفاً على الأكثر.`)
    .transform(stripHtml)

/** بيانات اللاعب المطلوبة لتنفيذ الشحن — orders.player_id_info */
export const playerIdInfo = z.object({
  player_id: requiredText('معرّف اللاعب', 64),
  player_name: z.string().trim().max(64).optional(),
  server: z.string().trim().max(64).optional(),
  notes: freeText('الملاحظات', 300).optional(),
})
