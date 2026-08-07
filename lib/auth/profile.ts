/**
 * تهيئة بروفايل المستخدم بعد التسجيل — الجزء 4.
 * المرجع: PROJECT_SPEC.md القسمان 3 و 4.
 *
 * يعمل بمفتاح service role (يتجاوز RLS) لأن صف users يُنشأ قبل تفعيل البريد،
 * أي قبل وجود جلسة تسمح للعميل بالكتابة. كل العمليات هنا آمنة للتكرار
 * (idempotent): لو كان هناك trigger في قاعدة البيانات أنشأ الصف مسبقاً،
 * لا نكرّره بل نكمل الحقول الناقصة فقط.
 *
 * ممنوع استيراد هذا الملف في أي كود يُنفَّذ في المتصفح.
 */
import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

/** حروف كود الإحالة — بدون أحرف/أرقام يسهل الخلط بينها (0/O، 1/I) */
const REFERRAL_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

/** توليد كود إحالة عشوائي بطول ثابت */
function randomReferralCode(length = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let code = ''
  for (const byte of bytes) code += REFERRAL_ALPHABET[byte % REFERRAL_ALPHABET.length]
  return code
}

/**
 * إيجاد صاحب كود الإحالة.
 * @returns معرّف المُحيل أو null لو الكود غير موجود.
 */
export async function resolveReferrer(referralCode: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('id')
    .eq('referral_code', referralCode)
    .maybeSingle()
  return data?.id ?? null
}

export type BootstrapArgs = {
  userId: string
  fullName: string
  phone: string
  /** معرّف المُحيل (مُحلّل مسبقاً من كود الإحالة) أو null */
  referredBy: string | null
}

/**
 * إنشاء صف users + المحفظة + قيد الإحالة إن وُجد، بشكل آمن للتكرار.
 * يُنادى مرة واحدة بعد نجاح signUp.
 */
export async function bootstrapUserProfile(args: BootstrapArgs): Promise<void> {
  const admin = createAdminClient()

  // 1) صف users — أنشئه إن لم يكن موجوداً، وإلا أكمل الحقول الناقصة فقط
  const { data: existing } = await admin
    .from('users')
    .select('id, full_name, phone, referred_by')
    .eq('id', args.userId)
    .maybeSingle()

  if (!existing) {
    // محاولات متعددة لتفادي تصادم نادر في referral_code الفريد
    let lastError: unknown = null
    for (let attempt = 0; attempt < 5; attempt++) {
      const { error } = await admin.from('users').insert({
        id: args.userId,
        full_name: args.fullName,
        phone: args.phone,
        referral_code: randomReferralCode(),
        referred_by: args.referredBy,
      })
      if (!error) {
        lastError = null
        break
      }
      lastError = error
      // 23505 = unique_violation؛ لو على referral_code نعيد المحاولة، غير ذلك نتوقف
      if (error.code === '23505' && error.message.includes('referral_code')) continue
      throw error
    }
    if (lastError) throw lastError
  } else {
    const patch: { full_name?: string; phone?: string; referred_by?: string } = {}
    if (!existing.full_name) patch.full_name = args.fullName
    if (!existing.phone) patch.phone = args.phone
    if (!existing.referred_by && args.referredBy) patch.referred_by = args.referredBy
    if (Object.keys(patch).length > 0) {
      await admin.from('users').update(patch).eq('id', args.userId)
    }
  }

  // 2) المحفظة — أنشئها برصيد صفر إن لم تكن موجودة
  const { data: wallet } = await admin
    .from('wallets')
    .select('id')
    .eq('user_id', args.userId)
    .maybeSingle()
  if (!wallet) {
    const { error } = await admin.from('wallets').insert({ user_id: args.userId, balance: 0 })
    // تجاهل تصادم الإنشاء المتزامن فقط
    if (error && error.code !== '23505') throw error
  }

  // 3) قيد الإحالة — مرة واحدة لكل مستخدم مُحال
  if (args.referredBy) {
    const { data: referral } = await admin
      .from('referrals')
      .select('id')
      .eq('referred_user_id', args.userId)
      .maybeSingle()
    if (!referral) {
      const { error } = await admin.from('referrals').insert({
        referrer_id: args.referredBy,
        referred_user_id: args.userId,
      })
      if (error && error.code !== '23505') throw error
    }
  }
}
