/**
 * حرّاس الهوية والصلاحيات — خط الدفاع في السيرفر.
 * المرجع: PROJECT_SPEC.md القسم 4:
 *   "أي API route يغيّر حالة طلب أو رصيد لازم يتحقق أولاً من admin_roles
 *    في السيرفر، وليس فقط من وجود توكن دخول."
 *
 * قاعدة إلزامية: لا يُستدعى createAdminClient (service role) في أي مسار
 * قبل المرور على requireUser أو requireAdmin من هذا الملف.
 */
import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { errors } from '@/lib/security/errors'
import type { AdminRole, UserRow } from '@/types/database'

export type Actor = {
  userId: string
  email: string | null
  profile: UserRow | null
  adminRole: AdminRole | null
}

export type AdminActor = Actor & { adminRole: AdminRole }

/** المستخدم الحالي من الجلسة، أو null. يتحقق من التوكن عند Supabase (getUser). */
export async function getSessionUser() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * الهوية الكاملة: الجلسة + البروفايل + الدور الإداري.
 * البروفايل والدور يُقرآن بمفتاح service role لأن admin_roles محجوب عن العميل في RLS.
 */
export async function getActor(): Promise<Actor | null> {
  const user = await getSessionUser()
  if (!user) return null

  const admin = createAdminClient()
  const [{ data: profile }, { data: role }] = await Promise.all([
    admin.from('users').select('*').eq('id', user.id).maybeSingle(),
    admin.from('admin_roles').select('role').eq('user_id', user.id).maybeSingle(),
  ])

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: (profile as UserRow | null) ?? null,
    adminRole: role?.role ?? null,
  }
}

/** يشترط مستخدماً مسجلاً وغير محظور */
export async function requireUser(): Promise<Actor> {
  const actor = await getActor()
  if (!actor) throw errors.unauthorized()
  if (actor.profile?.is_banned) throw errors.banned()
  return actor
}

/**
 * يشترط دوراً إدارياً. لو مُرِّرت قائمة أدوار، لازم يكون دور المستخدم داخلها
 * (super_admin يمر دائماً).
 */
export async function requireAdmin(allowed?: readonly AdminRole[]): Promise<AdminActor> {
  const actor = await requireUser()
  if (!actor.adminRole) throw errors.forbidden()

  if (allowed && allowed.length > 0 && actor.adminRole !== 'super_admin') {
    if (!allowed.includes(actor.adminRole)) throw errors.forbidden()
  }

  return actor as AdminActor
}

/** صلاحيات كل دور إداري — مصدر واحد للحقيقة تستخدمه الأجزاء 20-28 */
export const ROLE_PERMISSIONS = {
  /** مراجعة الطلبات وتغيير حالتها */
  manage_orders: ['super_admin', 'support'],
  /** مراجعة طلبات شحن المحافظ والموافقة عليها */
  manage_topups: ['super_admin', 'accountant'],
  /** تعديل الأرصدة يدوياً */
  adjust_wallets: ['super_admin', 'accountant'],
  /** إدارة المنتجات والتصنيفات والألعاب */
  manage_catalog: ['super_admin'],
  /** إدارة العملاء والحظر */
  manage_customers: ['super_admin', 'support'],
  /** إدارة وسائل الدفع */
  manage_payment_methods: ['super_admin', 'accountant'],
  /** إدارة الكوبونات وكروت الهدايا */
  manage_promotions: ['super_admin'],
  /** قراءة سجل التدقيق وإدارة المشرفين */
  manage_admins: ['super_admin'],
  /** قراءة إحصائيات لوحة التحكم */
  view_dashboard: ['super_admin', 'support', 'accountant'],
} as const satisfies Record<string, readonly AdminRole[]>

export type Permission = keyof typeof ROLE_PERMISSIONS

export function hasPermission(role: AdminRole | null, permission: Permission): boolean {
  if (!role) return false
  return (ROLE_PERMISSIONS[permission] as readonly AdminRole[]).includes(role)
}

/** يشترط صلاحية محددة بالاسم — أوضح من تمرير قوائم أدوار في كل مسار */
export async function requirePermission(permission: Permission): Promise<AdminActor> {
  const actor = await requireAdmin()
  if (!hasPermission(actor.adminRole, permission)) throw errors.forbidden()
  return actor
}
