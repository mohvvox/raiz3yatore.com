# PROJECT_SPEC.md — RAIZEY STORE

هذا الملف هو "العقد المشترك" للمشروع. **أي وكيل ذكاء اصطناعي يشتغل على أي جزء من المشروع لازم يقرأ هذا الملف كاملاً أولاً قبل ما يكتب أي كود.** الهدف: كل الأجزاء تتجمع مع بعض بدون تعارض في الأسماء أو الأنواع أو الشكل.

---

## 1. التقنيات المستخدمة (لا تتغير)

- **Frontend + Backend:** Next.js 14+ (App Router) + TypeScript
- **التنسيق:** Tailwind CSS
- **الأيقونات:** مكتبة **lucide-react** حصراً — أيقونات خطية (outline) قوية واحترافية. **ممنوع منعاً باتاً استخدام أي إيموجي 😀 في أي مكان بالموقع** (لا في الواجهة، ولا في رسائل النظام، ولا في الإشعارات). كل مكان محتاج رمز يُستخدم فيه أيقونة من lucide-react بنفس حجم ولون النص المحيط بها.
- **قاعدة البيانات:** Supabase (PostgreSQL + Auth + Storage)
- **مراقبة الأخطاء:** Sentry
- **النشر:** Vercel
- **اللغة:** العربية (RTL) هي اللغة الأساسية للموقع بالكامل

---

## 2. نظام الألوان (CSS Variables — استخدم هذه المتغيرات فقط، ممنوع كتابة hex مباشر في أي كومبوننت)

```css
:root {
  --bg-primary: #0D0D0D;
  --bg-secondary: #1B1B1D;
  --brand-gold: #FFB800;
  --brand-orange: #FC8E00;
  --alert-red: #FF2D3A;
  --text-primary: #F5F5F5;
  --text-muted: #9A9A9A;
  --border: #2A2A2C;
}
```

---

## 3. مخطط قاعدة البيانات الكامل (Supabase / PostgreSQL)

> ملاحظة: كل جدول فيه `id uuid primary key default gen_random_uuid()` و `created_at timestamptz default now()` ما لم يُذكر غير ذلك.

### `users` (يُدار تلقائياً بواسطة Supabase Auth، هذا جدول بروفايل إضافي)
| العمود | النوع | ملاحظات |
|---|---|---|
| id | uuid | يطابق `auth.users.id` |
| full_name | text | |
| phone | text | unique |
| referral_code | text | unique, يتولد تلقائياً |
| referred_by | uuid | nullable, foreign key → users.id |
| is_banned | boolean | default false |
| created_at | timestamptz | |

### `wallets`
| العمود | النوع |
|---|---|
| id | uuid |
| user_id | uuid → users.id, unique |
| balance | numeric(12,2) default 0 |
| updated_at | timestamptz |

### `wallet_transactions` (سجل كل حركة على المحفظة — لا تُحذف أبداً)
| العمود | النوع |
|---|---|
| id | uuid |
| wallet_id | uuid → wallets.id |
| amount | numeric(12,2) |
| type | enum: `topup`, `purchase`, `refund`, `referral_earning`, `admin_adjustment` |
| reference_id | uuid nullable (يشير لطلب الشحن أو الطلب المرتبط) |
| balance_after | numeric(12,2) |
| created_at | timestamptz |

### `topup_requests` (طلبات شحن الرصيد اليدوية)
| العمود | النوع |
|---|---|
| id | uuid |
| user_id | uuid → users.id |
| amount | numeric(12,2) |
| payment_method_id | uuid → payment_methods.id |
| transaction_reference | text (رقم العملية من رسالة التحويل) |
| receipt_image_url | text |
| status | enum: `pending`, `approved`, `rejected` |
| reviewed_by | uuid nullable → users.id (الأدمن) |
| reviewed_at | timestamptz nullable |

### `payment_methods` (حسابات التحويل البنكي المعروضة للعميل)
| العمود | النوع |
|---|---|
| id | uuid |
| name | text (مثال: بنكك، فوري) |
| account_details | text |
| is_active | boolean default true |

### `games` (الألعاب/الخدمات الرئيسية)
| العمود | النوع |
|---|---|
| id | uuid |
| name | text |
| slug | text unique |
| icon_key | text (اسم أيقونة lucide أو رابط صورة الغلاف) |
| is_active | boolean default true |
| sort_order | int |

### `categories`
| العمود | النوع |
|---|---|
| id | uuid |
| game_id | uuid → games.id |
| name | text |
| slug | text unique |
| sort_order | int |

### `products` (الباقات/المنتجات)
| العمود | النوع |
|---|---|
| id | uuid |
| category_id | uuid → categories.id |
| name | text |
| description | text |
| price | numeric(12,2) |
| stock | int nullable (null = غير محدود) |
| image_url | text |
| is_active | boolean default true |

### `orders`
| العمود | النوع |
|---|---|
| id | uuid |
| user_id | uuid → users.id |
| total_amount | numeric(12,2) |
| payment_source | enum: `wallet`, `bank_transfer` |
| coupon_id | uuid nullable → coupons.id |
| status | enum: `pending`, `processing`, `completed`, `rejected`, `refunded` |
| player_id_info | jsonb (بيانات اللاعب المطلوبة لتنفيذ الشحن) |

### `order_items`
| العمود | النوع |
|---|---|
| id | uuid |
| order_id | uuid → orders.id |
| product_id | uuid → products.id |
| quantity | int |
| unit_price | numeric(12,2) |

### `coupons`
| العمود | النوع |
|---|---|
| id | uuid |
| code | text unique |
| discount_type | enum: `percentage`, `fixed` |
| discount_value | numeric(12,2) |
| max_uses | int nullable |
| used_count | int default 0 |
| expires_at | timestamptz nullable |
| is_active | boolean default true |

### `gift_cards`
| العمود | النوع |
|---|---|
| id | uuid |
| code | text unique |
| amount | numeric(12,2) |
| is_redeemed | boolean default false |
| redeemed_by | uuid nullable → users.id |
| redeemed_at | timestamptz nullable |

### `referral_earnings`
| العمود | النوع |
|---|---|
| id | uuid |
| referrer_id | uuid → users.id |
| referred_user_id | uuid → users.id |
| order_id | uuid → orders.id |
| amount | numeric(12,2) |
| status | enum: `pending`, `credited` |

### `notifications`
| العمود | النوع |
|---|---|
| id | uuid |
| user_id | uuid → users.id nullable (null = إشعار عام لكل المستخدمين) |
| title | text |
| body | text |
| is_read | boolean default false |

### `admin_roles`
| العمود | النوع |
|---|---|
| id | uuid |
| user_id | uuid → users.id, unique |
| role | enum: `super_admin`, `support`, `accountant` |

### `audit_log` (لا يُحذف أبداً، لا يُعدَّل بعد الإنشاء)
| العمود | النوع |
|---|---|
| id | uuid |
| admin_id | uuid → users.id |
| action | text (مثال: `approved_topup`, `banned_user`, `edited_product`) |
| target_id | uuid nullable |
| details | jsonb |
| created_at | timestamptz |

### `reviews`
| العمود | النوع |
|---|---|
| id | uuid |
| product_id | uuid → products.id |
| user_id | uuid → users.id |
| rating | int (1-5) |
| comment | text |

---

### `referrals` (علاقة الإحالة — مضاف في الجزء 2 حسب خطة المشروع)
| العمود | النوع |
|---|---|
| id | uuid |
| referrer_id | uuid → users.id |
| referred_user_id | uuid → users.id, unique (كل مستخدم له محيل واحد فقط) |
| created_at | timestamptz |

### `gift_card_redemptions` (سجل استبدال كروت الهدايا — مضاف في الجزء 2 حسب خطة المشروع)
| العمود | النوع |
|---|---|
| id | uuid |
| gift_card_id | uuid → gift_cards.id, unique (الكارت يُستبدل مرة واحدة) |
| user_id | uuid → users.id |
| amount | numeric(12,2) |
| transaction_id | uuid nullable → wallet_transactions.id |
| created_at | timestamptz |

---

## 3.1 الدالة الوحيدة المسموح بها لتغيير الرصيد

```sql
apply_wallet_transaction(
  p_user_id uuid,
  p_amount numeric,        -- موجب = إضافة، سالب = خصم
  p_type public.wallet_txn_type,
  p_reference_id uuid default null
) returns table (transaction_id uuid, balance_after numeric)
```

- تقفل صف المحفظة (`for update`) وتحدّث الرصيد وتكتب سجل `wallet_transactions` في عملية ذرية واحدة.
- ترفض العملية إذا أصبح الرصيد سالباً أو كانت القيمة صفراً.
- صلاحية التنفيذ لـ `service_role` فقط — ممنوع ندائها من العميل.
- `wallet_transactions` و `audit_log` محميان بتريجر يمنع التعديل أو الحذف بعد الإنشاء.

ملفات المخطط: `scripts/001_schema.sql` (الجداول والقيود والفهارس) و `scripts/002_functions_triggers.sql` (الدوال والتريجرز).

---

## 4. قواعد أمان إلزامية (Row Level Security)

- كل جدول فيه بيانات مستخدم لازم RLS مفعّل، والقاعدة: المستخدم يشوف بس صفوفه (`user_id = auth.uid()`).
- التعديل على `wallets.balance` **ممنوع نهائياً من جهة العميل** — يتم فقط عبر دالة سيرفر (Postgres function / API route بصلاحية service role) تُنفذ كعملية واحدة ذرية مع `wallet_transactions`.
- جداول الأدمن (`admin_roles`, `audit_log`, `payment_methods`) غير مرئية للعميل نهائياً في RLS.
- أي API route يغيّر حالة طلب أو رصيد لازم يتحقق أولاً من `admin_roles` في السيرفر، وليس فقط من وجود توكن دخول.

---

## 5. تسمية API Routes (موحّدة لكل الوكلاء)

```
/api/auth/*
/api/wallet/topup-request      (POST)
/api/wallet/balance            (GET)
/api/orders                    (GET, POST)
/api/orders/[id]               (GET)
/api/products                  (GET)
/api/coupons/validate          (POST)
/api/giftcards/redeem          (POST)
/api/referrals/me              (GET)
/api/admin/orders              (GET, PATCH)
/api/admin/topups              (GET, PATCH)
/api/admin/products            (GET, POST, PATCH, DELETE)
/api/admin/customers           (GET, PATCH)
```

كل استجابة API بالشكل:
```json
{ "success": true, "data": {...} }
```
أو عند الخطأ:
```json
{ "success": false, "error": "رسالة واضحة بالعربي" }
```

---

## 6. هيكلة المجلدات

```
/app
  /(customer)/...
  /admin/...
  /api/...
/components
  /ui         ← مكونات أساسية مشتركة (زر، كارت، حقل إدخال...)
  /customer
  /admin
/lib
  /supabase
  /validators
/types        ← كل الـ TypeScript types لجداول قاعدة البيانات (مصدر واحد للحقيقة)
```

**قاعدة ذهبية:** أي وكيل يحتاج نوع بيانات لجدول معين، يستورده من `/types` ولا يعرّفه من جديد بنفسه.
