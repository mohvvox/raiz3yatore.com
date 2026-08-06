/**
 * سجل التدقيق — كل عملية حساسة يقوم بها أدمن تُسجَّل ولا تُحذف أبداً.
 * المرجع: PROJECT_SPEC.md القسم 3 (audit_log) والقسم 4.
 *
 * الكتابة بمفتاح service role فقط، والجدول محجوب عن العميل في RLS،
 * وتريجر forbid_mutation يمنع التعديل أو الحذف بعد الإنشاء.
 */
import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'

/** أسماء العمليات الموثّقة — ممنوع اختراع أسماء جديدة خارج هذه القائمة */
export const AUDIT_ACTIONS = [
  'approved_topup',
  'rejected_topup',
  'adjusted_wallet',
  'updated_order_status',
  'refunded_order',
  'created_product',
  'edited_product',
  'deleted_product',
  'created_category',
  'edited_category',
  'banned_user',
  'unbanned_user',
  'created_coupon',
  'edited_coupon',
  'created_gift_card',
  'edited_payment_method',
  'granted_admin_role',
  'revoked_admin_role',
  'updated_site_settings',
] as const

export type AuditAction = (typeof AUDIT_ACTIONS)[number]

/**
 * تسجيل عملية إدارية. لا يرمي خطأ أبداً حتى لا تفشل العملية الأصلية
 * بسبب فشل التسجيل — الفشل يُطبع في السجلات فقط.
 */
export async function writeAuditLog(input: {
  adminId: string
  action: AuditAction
  targetId?: string | null
  details?: Record<string, Json> | null
}) {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('audit_log').insert({
      admin_id: input.adminId,
      action: input.action,
      target_id: input.targetId ?? null,
      details: (input.details ?? null) as Json,
    })
    if (error) {
      console.error('[v0] audit log insert failed:', error.message)
    }
  } catch (error) {
    console.error('[v0] audit log unexpected failure:', (error as Error).message)
  }
}
