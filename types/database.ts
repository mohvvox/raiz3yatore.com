/**
 * أنواع جداول قاعدة البيانات — المصدر الوحيد للحقيقة.
 * المرجع: PROJECT_SPEC.md — القسم 3
 *
 * قاعدة ذهبية: أي وكيل يحتاج نوع بيانات لجدول معين يستورده من هنا
 * ولا يعرّفه من جديد في مكان آخر.
 *
 * لكل جدول ثلاثة أنواع:
 *   XRow    — الصف كما يعود من قاعدة البيانات
 *   XInsert — ما يُرسل عند الإنشاء (الأعمدة ذات القيم الافتراضية اختيارية)
 *   XUpdate — ما يُرسل عند التعديل (كل الحقول اختيارية)
 */

// =====================================================================
// الأنواع المعدودة (enums) — مطابقة لأنواع PostgreSQL
// =====================================================================

/** wallet_transactions.type — public.wallet_txn_type */
export const WALLET_TRANSACTION_TYPES = [
  'topup',
  'purchase',
  'refund',
  'referral_earning',
  'admin_adjustment',
] as const
export type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPES)[number]

/** topup_requests.status — public.topup_status */
export const TOPUP_STATUSES = ['pending', 'approved', 'rejected'] as const
export type TopupStatus = (typeof TOPUP_STATUSES)[number]

/** orders.payment_source — public.order_payment_source */
export const PAYMENT_SOURCES = ['wallet', 'bank_transfer'] as const
export type PaymentSource = (typeof PAYMENT_SOURCES)[number]

/** orders.status — public.order_status */
export const ORDER_STATUSES = [
  'pending',
  'processing',
  'completed',
  'rejected',
  'refunded',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** coupons.discount_type — public.coupon_discount_type */
export const DISCOUNT_TYPES = ['percentage', 'fixed'] as const
export type DiscountType = (typeof DISCOUNT_TYPES)[number]

/** referral_earnings.status — public.referral_status */
export const REFERRAL_EARNING_STATUSES = ['pending', 'credited'] as const
export type ReferralEarningStatus = (typeof REFERRAL_EARNING_STATUSES)[number]

/** admin_roles.role — public.admin_role_type */
export const ADMIN_ROLES = ['super_admin', 'support', 'accountant'] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

// =====================================================================
// أنواع مساعدة
// =====================================================================

/** نص ISO للتاريخ والوقت (timestamptz) */
export type Timestamp = string

/**
 * numeric(12,2) يعود من Supabase كرقم JavaScript.
 * ممنوع حساب أي مبلغ نهائي في المتصفح — الحساب في السيرفر فقط.
 */
export type Money = number

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

// =====================================================================
// users
// =====================================================================
export type UserRow = {
  id: string
  full_name: string | null
  phone: string | null
  referral_code: string
  referred_by: string | null
  is_banned: boolean
  created_at: Timestamp
}
export type UserInsert = {
  id: string
  full_name?: string | null
  phone?: string | null
  referral_code?: string
  referred_by?: string | null
  is_banned?: boolean
}
export type UserUpdate = Partial<Omit<UserInsert, 'id'>>

// =====================================================================
// wallets
// =====================================================================
export type WalletRow = {
  id: string
  user_id: string
  balance: Money
  updated_at: Timestamp
}
export type WalletInsert = { user_id: string; balance?: Money }
/** ممنوع تعديل balance من العميل — يتم فقط عبر apply_wallet_transaction */
export type WalletUpdate = { balance?: Money }

// =====================================================================
// wallet_transactions
// =====================================================================
export type WalletTransactionRow = {
  id: string
  wallet_id: string
  amount: Money
  type: WalletTransactionType
  reference_id: string | null
  balance_after: Money
  created_at: Timestamp
}
export type WalletTransactionInsert = {
  wallet_id: string
  amount: Money
  type: WalletTransactionType
  reference_id?: string | null
  balance_after: Money
}
/** السجل غير قابل للتعديل أو الحذف بعد الإنشاء */
export type WalletTransactionUpdate = never

// =====================================================================
// payment_methods
// =====================================================================
export type PaymentMethodRow = {
  id: string
  name: string
  account_details: string
  is_active: boolean
  created_at: Timestamp
}
export type PaymentMethodInsert = {
  name: string
  account_details: string
  is_active?: boolean
}
export type PaymentMethodUpdate = Partial<PaymentMethodInsert>

// =====================================================================
// topup_requests
// =====================================================================
export type TopupRequestRow = {
  id: string
  user_id: string
  amount: Money
  payment_method_id: string
  transaction_reference: string | null
  receipt_image_url: string | null
  status: TopupStatus
  reviewed_by: string | null
  reviewed_at: Timestamp | null
  created_at: Timestamp
}
export type TopupRequestInsert = {
  user_id: string
  amount: Money
  payment_method_id: string
  transaction_reference?: string | null
  receipt_image_url?: string | null
  status?: TopupStatus
}
export type TopupRequestUpdate = {
  status?: TopupStatus
  reviewed_by?: string | null
  reviewed_at?: Timestamp | null
}

// =====================================================================
// games
// =====================================================================
export type GameRow = {
  id: string
  name: string
  slug: string
  icon_key: string | null
  is_active: boolean
  sort_order: number
  created_at: Timestamp
}
export type GameInsert = {
  name: string
  slug: string
  icon_key?: string | null
  is_active?: boolean
  sort_order?: number
}
export type GameUpdate = Partial<GameInsert>

// =====================================================================
// categories
// =====================================================================
export type CategoryRow = {
  id: string
  game_id: string
  name: string
  slug: string
  sort_order: number
  created_at: Timestamp
}
export type CategoryInsert = {
  game_id: string
  name: string
  slug: string
  sort_order?: number
}
export type CategoryUpdate = Partial<CategoryInsert>

// =====================================================================
// products
// =====================================================================
export type ProductRow = {
  id: string
  category_id: string
  name: string
  description: string | null
  price: Money
  /** null = مخزون غير محدود */
  stock: number | null
  image_url: string | null
  is_active: boolean
  created_at: Timestamp
}
export type ProductInsert = {
  category_id: string
  name: string
  price: Money
  description?: string | null
  stock?: number | null
  image_url?: string | null
  is_active?: boolean
}
export type ProductUpdate = Partial<ProductInsert>

// =====================================================================
// coupons
// =====================================================================
export type CouponRow = {
  id: string
  code: string
  discount_type: DiscountType
  discount_value: Money
  max_uses: number | null
  used_count: number
  expires_at: Timestamp | null
  is_active: boolean
  created_at: Timestamp
}
export type CouponInsert = {
  code: string
  discount_type: DiscountType
  discount_value: Money
  max_uses?: number | null
  used_count?: number
  expires_at?: Timestamp | null
  is_active?: boolean
}
export type CouponUpdate = Partial<CouponInsert>

// =====================================================================
// orders
// =====================================================================
/** بيانات اللاعب المطلوبة لتنفيذ الشحن — orders.player_id_info */
export type PlayerIdInfo = {
  player_id?: string
  player_name?: string
  server?: string
  notes?: string
  [key: string]: Json | undefined
}

export type OrderRow = {
  id: string
  user_id: string
  total_amount: Money
  payment_source: PaymentSource
  coupon_id: string | null
  status: OrderStatus
  player_id_info: PlayerIdInfo | null
  created_at: Timestamp
}
export type OrderInsert = {
  user_id: string
  total_amount: Money
  payment_source: PaymentSource
  coupon_id?: string | null
  status?: OrderStatus
  player_id_info?: PlayerIdInfo | null
}
export type OrderUpdate = { status?: OrderStatus }

// =====================================================================
// order_items
// =====================================================================
export type OrderItemRow = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: Money
  created_at: Timestamp
}
export type OrderItemInsert = {
  order_id: string
  product_id: string
  unit_price: Money
  quantity?: number
}
export type OrderItemUpdate = Partial<Pick<OrderItemInsert, 'quantity'>>

// =====================================================================
// gift_cards
// =====================================================================
export type GiftCardRow = {
  id: string
  code: string
  amount: Money
  is_redeemed: boolean
  redeemed_by: string | null
  redeemed_at: Timestamp | null
  created_at: Timestamp
}
export type GiftCardInsert = { code: string; amount: Money }
export type GiftCardUpdate = {
  is_redeemed?: boolean
  redeemed_by?: string | null
  redeemed_at?: Timestamp | null
}

// =====================================================================
// gift_card_redemptions
// =====================================================================
export type GiftCardRedemptionRow = {
  id: string
  gift_card_id: string
  user_id: string
  amount: Money
  transaction_id: string | null
  created_at: Timestamp
}
export type GiftCardRedemptionInsert = {
  gift_card_id: string
  user_id: string
  amount: Money
  transaction_id?: string | null
}
export type GiftCardRedemptionUpdate = never

// =====================================================================
// referrals
// =====================================================================
export type ReferralRow = {
  id: string
  referrer_id: string
  referred_user_id: string
  created_at: Timestamp
}
export type ReferralInsert = { referrer_id: string; referred_user_id: string }
export type ReferralUpdate = never

// =====================================================================
// referral_earnings
// =====================================================================
export type ReferralEarningRow = {
  id: string
  referrer_id: string
  referred_user_id: string
  order_id: string | null
  amount: Money
  status: ReferralEarningStatus
  created_at: Timestamp
}
export type ReferralEarningInsert = {
  referrer_id: string
  referred_user_id: string
  amount: Money
  order_id?: string | null
  status?: ReferralEarningStatus
}
export type ReferralEarningUpdate = { status?: ReferralEarningStatus }

// =====================================================================
// notifications
// =====================================================================
export type NotificationRow = {
  id: string
  /** null = إشعار عام لكل المستخدمين */
  user_id: string | null
  title: string
  body: string | null
  is_read: boolean
  created_at: Timestamp
}
export type NotificationInsert = {
  title: string
  user_id?: string | null
  body?: string | null
  is_read?: boolean
}
export type NotificationUpdate = { is_read?: boolean }

// =====================================================================
// admin_roles
// =====================================================================
export type AdminRoleRow = {
  id: string
  user_id: string
  role: AdminRole
  created_at: Timestamp
}
export type AdminRoleInsert = { user_id: string; role: AdminRole }
export type AdminRoleUpdate = { role?: AdminRole }

// =====================================================================
// audit_log
// =====================================================================
export type AuditLogRow = {
  id: string
  admin_id: string
  action: string
  target_id: string | null
  details: Json | null
  created_at: Timestamp
}
export type AuditLogInsert = {
  admin_id: string
  action: string
  target_id?: string | null
  details?: Json | null
}
/** السجل غير قابل للتعديل أو الحذف بعد الإنشاء */
export type AuditLogUpdate = never

// =====================================================================
// reviews
// =====================================================================
export type ReviewRow = {
  id: string
  product_id: string
  user_id: string
  /** من 1 إلى 5 */
  rating: number
  comment: string | null
  created_at: Timestamp
}
export type ReviewInsert = {
  product_id: string
  user_id: string
  rating: number
  comment?: string | null
}
export type ReviewUpdate = Partial<Pick<ReviewInsert, 'rating' | 'comment'>>

// =====================================================================
// مخطط قاعدة البيانات لعميل Supabase المُنمَّط
// الاستخدام: createClient<Database>(...)
// =====================================================================
type TableDef<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update extends never ? Record<string, never> : Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      users: TableDef<UserRow, UserInsert, UserUpdate>
      wallets: TableDef<WalletRow, WalletInsert, WalletUpdate>
      wallet_transactions: TableDef<
        WalletTransactionRow,
        WalletTransactionInsert,
        WalletTransactionUpdate
      >
      payment_methods: TableDef<PaymentMethodRow, PaymentMethodInsert, PaymentMethodUpdate>
      topup_requests: TableDef<TopupRequestRow, TopupRequestInsert, TopupRequestUpdate>
      games: TableDef<GameRow, GameInsert, GameUpdate>
      categories: TableDef<CategoryRow, CategoryInsert, CategoryUpdate>
      products: TableDef<ProductRow, ProductInsert, ProductUpdate>
      coupons: TableDef<CouponRow, CouponInsert, CouponUpdate>
      orders: TableDef<OrderRow, OrderInsert, OrderUpdate>
      order_items: TableDef<OrderItemRow, OrderItemInsert, OrderItemUpdate>
      gift_cards: TableDef<GiftCardRow, GiftCardInsert, GiftCardUpdate>
      gift_card_redemptions: TableDef<
        GiftCardRedemptionRow,
        GiftCardRedemptionInsert,
        GiftCardRedemptionUpdate
      >
      referrals: TableDef<ReferralRow, ReferralInsert, ReferralUpdate>
      referral_earnings: TableDef<ReferralEarningRow, ReferralEarningInsert, ReferralEarningUpdate>
      notifications: TableDef<NotificationRow, NotificationInsert, NotificationUpdate>
      admin_roles: TableDef<AdminRoleRow, AdminRoleInsert, AdminRoleUpdate>
      audit_log: TableDef<AuditLogRow, AuditLogInsert, AuditLogUpdate>
      reviews: TableDef<ReviewRow, ReviewInsert, ReviewUpdate>
    }
    Views: Record<string, never>
    Functions: {
      apply_wallet_transaction: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: WalletTransactionType
          p_reference_id?: string | null
        }
        Returns: { transaction_id: string; balance_after: Money }[]
      }
      /** يُرجع دور المستخدم الحالي الإداري أو null — بديل آمن عن قراءة admin_roles */
      current_admin_role: {
        Args: Record<string, never>
        Returns: AdminRole | null
      }
      /** true لو المستخدم الحالي أدمن (أي دور) وغير محظور */
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      wallet_txn_type: WalletTransactionType
      topup_status: TopupStatus
      order_payment_source: PaymentSource
      order_status: OrderStatus
      coupon_discount_type: DiscountType
      referral_status: ReferralEarningStatus
      admin_role_type: AdminRole
    }
  }
}

/** أسماء الجداول — للاستخدام في الاستعلامات المُنمَّطة */
export type TableName = keyof Database['public']['Tables']
