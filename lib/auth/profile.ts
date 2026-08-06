/**
 * إنشاء صف البروفايل في public.users بعد التسجيل — الجزء 4.
 *
 * ليه بمفتاح service role وليس من المتصفح؟
 *  - عند تفعيل تأكيد البريد لا توجد جلسة بعد التسجيل، فأي إدخال من العميل
 *    سترفضه سياسات RLS التي تعتمد على auth.uid().
 *  - الإدخال في public.users يُشغّل تريجر bootstrap_user_records الذي ينشئ
 *    المحفظة ويسجّل علاقة الإحالة، وتريجر generate_referral_code الذي يولّد
 *    كود إحالة فريد. لذلك لا نحتاج أي تعديل في قاعدة البيانات.
 *
 * الدالة idempotent: نداؤها أكثر من مرة لنفس المستخدم لا يكرر شيئاً.
 */
import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRow } from '@/types/database'

/** رمز خطأ PostgreSQL لتعارض قيد unique */
const UNIQUE_VIOLATION = '23505'

export type EnsureProfileInput = {
  userId: string
  fullName?: string | null
  phone?: string | null
  referredBy?: string | null
}

/**
 * يعيد البروفايل، وينشئه إن لم يوجد.
 * لا يرمي خطأ لو فشل الإنشاء لسبب غير متوقع — يُسجَّل فقط حتى لا نمنع
 * المستخدم من تسجيل الدخول، والحرّاس (guards) تتعامل مع البروفايل المفقود.
 */
export async function ensureUserProfile(input: EnsureProfileInput): Promise<UserRow | null> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('users')
    .select('*')
    .eq('id', input.userId)
    .maybeSingle()

  if (existing) return existing as UserRow

  const payload = {
    id: input.userId,
    full_name: input.fullName?.trim() || null,
    phone: input.phone?.trim() || null,
    referred_by: input.referredBy ?? null,
  }

  const { data, error } = await admin.from('users').insert(payload).select('*').maybeSingle()

  if (!error) return (data as UserRow | null) ?? null

  // رقم الهاتف مستخدم من حساب آخر: ننشئ البروفايل بدون الهاتف حتى لا يبقى
  // مستخدم Auth بلا بروفايل ولا محفظة.
  if (error.code === UNIQUE_VIOLATION && payload.phone) {
    const { data: retry, error: retryError } = await admin
      .from('users')
      .insert({ ...payload, phone: null })
      .select('*')
      .maybeSingle()

    if (!retryError) return (retry as UserRow | null) ?? null
    console.error('[v0] ensureUserProfile retry failed:', retryError.message)
    return null
  }

  console.error('[v0] ensureUserProfile failed:', error.message)
  return null
}

/** إنشاء البروفايل انطلاقاً من بيانات مستخدم Auth (شبكة أمان عند الدخول والتفعيل) */
export async function ensureProfileFromAuthUser(user: {
  id: string
  user_metadata?: Record<string, unknown> | null
}) {
  const metadata = user.user_metadata ?? {}
  return ensureUserProfile({
    userId: user.id,
    fullName: typeof metadata.full_name === 'string' ? metadata.full_name : null,
    phone: typeof metadata.phone === 'string' ? metadata.phone : null,
    referredBy: typeof metadata.referred_by === 'string' ? metadata.referred_by : null,
  })
}

/** true لو رقم الهاتف مستخدم بالفعل */
export async function isPhoneTaken(phone: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin.from('users').select('id').eq('phone', phone).maybeSingle()
  return Boolean(data)
}

/** يحوّل كود الإحالة إلى معرّف صاحبه، أو null لو الكود غير موجود */
export async function resolveReferrerId(referralCode: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('id')
    .eq('referral_code', referralCode.toUpperCase())
    .maybeSingle()
  return data?.id ?? null
}
