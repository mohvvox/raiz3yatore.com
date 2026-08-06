/**
 * أنواع جداول قاعدة البيانات — المصدر الوحيد للحقيقة.
 * المرجع: PROJECT_SPEC.md — القسم 3
 *
 * الجزء 1 (تهيئة المشروع) يعرّف فقط الـ enums المتفق عليها في العقد المشترك،
 * لأنها تُستخدم في التحقق والواجهة معاً. أنواع الجداول الكاملة تُكتب في الجزء 2
 * (تصميم قاعدة البيانات) داخل هذا الملف نفسه — لا تنشئ ملف أنواع جديد.
 */

/** wallet_transactions.type */
export const WALLET_TRANSACTION_TYPES = [
  'topup',
  'purchase',
  'refund',
  'referral_earning',
  'admin_adjustment',
] as const
export type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPES)[number]

/** topup_requests.status */
export const TOPUP_STATUSES = ['pending', 'approved', 'rejected'] as const
export type TopupStatus = (typeof TOPUP_STATUSES)[number]

/** orders.payment_source */
export const PAYMENT_SOURCES = ['wallet', 'bank_transfer'] as const
export type PaymentSource = (typeof PAYMENT_SOURCES)[number]

/** orders.status */
export const ORDER_STATUSES = [
  'pending',
  'processing',
  'completed',
  'rejected',
  'refunded',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** coupons.discount_type */
export const DISCOUNT_TYPES = ['percentage', 'fixed'] as const
export type DiscountType = (typeof DISCOUNT_TYPES)[number]

/** referral_earnings.status */
export const REFERRAL_EARNING_STATUSES = ['pending', 'credited'] as const
export type ReferralEarningStatus = (typeof REFERRAL_EARNING_STATUSES)[number]

/** admin_roles.role */
export const ADMIN_ROLES = ['super_admin', 'support', 'accountant'] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]
