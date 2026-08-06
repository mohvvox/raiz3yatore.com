-- =====================================================================
-- RAIZEY STORE — الجزء 2: مخطط قاعدة البيانات الكامل
-- المرجع: PROJECT_SPEC.md القسم 3 (أسماء الجداول والأعمدة كما هي حرفياً)
--
-- هذا السكربت idempotent: يمكن تشغيله أكثر من مرة بأمان على نفس القاعدة.
-- طريقة التشغيل: Supabase Dashboard > SQL Editor > New query > لصق الملف > Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) الأنواع المعدودة (enums)
-- ---------------------------------------------------------------------
do $$ begin
  create type public.wallet_txn_type as enum
    ('topup', 'purchase', 'refund', 'referral_earning', 'admin_adjustment');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.topup_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_payment_source as enum ('wallet', 'bank_transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum
    ('pending', 'processing', 'completed', 'rejected', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.coupon_discount_type as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.referral_status as enum ('pending', 'credited');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.admin_role_type as enum ('super_admin', 'support', 'accountant');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2) الجداول
-- ---------------------------------------------------------------------

-- users: جدول بروفايل مرتبط 1:1 بـ auth.users
create table if not exists public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  phone         text,
  referral_code text        not null default substr(md5(random()::text), 1, 8),
  referred_by   uuid        references public.users (id) on delete set null,
  is_banned     boolean     not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.wallets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid           not null references public.users (id) on delete cascade,
  balance    numeric(12, 2) not null default 0,
  updated_at timestamptz    not null default now()
);

create table if not exists public.payment_methods (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  account_details text        not null,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id            uuid primary key default gen_random_uuid(),
  wallet_id     uuid                   not null references public.wallets (id) on delete restrict,
  amount        numeric(12, 2)         not null,
  type          public.wallet_txn_type not null,
  reference_id  uuid,
  balance_after numeric(12, 2)         not null,
  created_at    timestamptz            not null default now()
);

create table if not exists public.topup_requests (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid                not null references public.users (id) on delete cascade,
  amount                numeric(12, 2)      not null,
  payment_method_id     uuid                not null references public.payment_methods (id) on delete restrict,
  transaction_reference text,
  receipt_image_url     text,
  status                public.topup_status not null default 'pending',
  reviewed_by           uuid                references public.users (id) on delete set null,
  reviewed_at           timestamptz,
  created_at            timestamptz         not null default now()
);

create table if not exists public.games (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  slug       text        not null,
  icon_key   text,
  is_active  boolean     not null default true,
  sort_order int         not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  game_id    uuid        not null references public.games (id) on delete cascade,
  name       text        not null,
  slug       text        not null,
  sort_order int         not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid           not null references public.categories (id) on delete cascade,
  name        text           not null,
  description text,
  price       numeric(12, 2) not null,
  stock       int,
  image_url   text,
  is_active   boolean        not null default true,
  created_at  timestamptz    not null default now()
);

create table if not exists public.coupons (
  id             uuid primary key default gen_random_uuid(),
  code           text                        not null,
  discount_type  public.coupon_discount_type not null,
  discount_value numeric(12, 2)              not null,
  max_uses       int,
  used_count     int                         not null default 0,
  expires_at     timestamptz,
  is_active      boolean                     not null default true,
  created_at     timestamptz                 not null default now()
);

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid                         not null references public.users (id) on delete restrict,
  total_amount   numeric(12, 2)               not null,
  payment_source public.order_payment_source  not null,
  coupon_id      uuid                         references public.coupons (id) on delete set null,
  status         public.order_status          not null default 'pending',
  player_id_info jsonb,
  created_at     timestamptz                  not null default now()
);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid           not null references public.orders (id) on delete cascade,
  product_id uuid           not null references public.products (id) on delete restrict,
  quantity   int            not null default 1,
  unit_price numeric(12, 2) not null,
  created_at timestamptz    not null default now()
);

create table if not exists public.gift_cards (
  id          uuid primary key default gen_random_uuid(),
  code        text           not null,
  amount      numeric(12, 2) not null,
  is_redeemed boolean        not null default false,
  redeemed_by uuid           references public.users (id) on delete set null,
  redeemed_at timestamptz,
  created_at  timestamptz    not null default now()
);

-- gift_card_redemptions: سجل استبدال كروت الهدايا (خطة المشروع — الجزء 2)
create table if not exists public.gift_card_redemptions (
  id            uuid primary key default gen_random_uuid(),
  gift_card_id  uuid           not null references public.gift_cards (id) on delete restrict,
  user_id       uuid           not null references public.users (id) on delete cascade,
  amount        numeric(12, 2) not null,
  transaction_id uuid          references public.wallet_transactions (id) on delete set null,
  created_at    timestamptz    not null default now()
);

-- referrals: علاقة الإحالة بين مستخدم ومن أحاله (خطة المشروع — الجزء 2)
create table if not exists public.referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_id      uuid        not null references public.users (id) on delete cascade,
  referred_user_id uuid        not null references public.users (id) on delete cascade,
  created_at       timestamptz not null default now()
);

create table if not exists public.referral_earnings (
  id               uuid primary key default gen_random_uuid(),
  referrer_id      uuid                   not null references public.users (id) on delete cascade,
  referred_user_id uuid                   not null references public.users (id) on delete cascade,
  order_id         uuid                   references public.orders (id) on delete set null,
  amount           numeric(12, 2)         not null,
  status           public.referral_status not null default 'pending',
  created_at       timestamptz            not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        references public.users (id) on delete cascade,
  title      text        not null,
  body       text,
  is_read    boolean     not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid                   not null references public.users (id) on delete cascade,
  role       public.admin_role_type not null,
  created_at timestamptz            not null default now()
);

create table if not exists public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  admin_id   uuid        not null references public.users (id) on delete restrict,
  action     text        not null,
  target_id  uuid,
  details    jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid        not null references public.products (id) on delete cascade,
  user_id    uuid        not null references public.users (id) on delete cascade,
  rating     int         not null,
  comment    text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3) القيود (unique + check) — تُضاف فقط إن لم تكن موجودة
-- ---------------------------------------------------------------------
create or replace function public.add_constraint_if_absent(
  p_table text,
  p_name text,
  p_definition text
) returns void
language plpgsql
as $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public' and t.relname = p_table and c.conname = p_name
  ) then
    execute format('alter table public.%I add constraint %I %s', p_table, p_name, p_definition);
  end if;
end $$;

select public.add_constraint_if_absent('users', 'users_phone_key', 'unique (phone)');
select public.add_constraint_if_absent('users', 'users_referral_code_key', 'unique (referral_code)');
select public.add_constraint_if_absent('users', 'users_no_self_referral', 'check (referred_by is null or referred_by <> id)');

select public.add_constraint_if_absent('wallets', 'wallets_user_id_key', 'unique (user_id)');
select public.add_constraint_if_absent('wallets', 'wallets_balance_non_negative', 'check (balance >= 0)');

select public.add_constraint_if_absent('wallet_transactions', 'wallet_transactions_amount_not_zero', 'check (amount <> 0)');
select public.add_constraint_if_absent('wallet_transactions', 'wallet_transactions_balance_after_non_negative', 'check (balance_after >= 0)');

select public.add_constraint_if_absent('topup_requests', 'topup_requests_amount_positive', 'check (amount > 0)');
select public.add_constraint_if_absent('topup_requests', 'topup_requests_review_consistency',
  'check ((status = ''pending'' and reviewed_by is null and reviewed_at is null) or (status <> ''pending''))');

select public.add_constraint_if_absent('games', 'games_slug_key', 'unique (slug)');
select public.add_constraint_if_absent('categories', 'categories_slug_key', 'unique (slug)');
select public.add_constraint_if_absent('categories', 'categories_game_name_key', 'unique (game_id, name)');

select public.add_constraint_if_absent('products', 'products_price_non_negative', 'check (price >= 0)');
select public.add_constraint_if_absent('products', 'products_stock_non_negative', 'check (stock is null or stock >= 0)');

select public.add_constraint_if_absent('coupons', 'coupons_code_key', 'unique (code)');
select public.add_constraint_if_absent('coupons', 'coupons_discount_value_positive', 'check (discount_value > 0)');
select public.add_constraint_if_absent('coupons', 'coupons_percentage_range',
  'check (discount_type <> ''percentage'' or discount_value <= 100)');
select public.add_constraint_if_absent('coupons', 'coupons_used_count_non_negative', 'check (used_count >= 0)');
select public.add_constraint_if_absent('coupons', 'coupons_max_uses_positive', 'check (max_uses is null or max_uses > 0)');

select public.add_constraint_if_absent('orders', 'orders_total_amount_non_negative', 'check (total_amount >= 0)');

select public.add_constraint_if_absent('order_items', 'order_items_quantity_positive', 'check (quantity > 0)');
select public.add_constraint_if_absent('order_items', 'order_items_unit_price_non_negative', 'check (unit_price >= 0)');

select public.add_constraint_if_absent('gift_cards', 'gift_cards_code_key', 'unique (code)');
select public.add_constraint_if_absent('gift_cards', 'gift_cards_amount_positive', 'check (amount > 0)');
select public.add_constraint_if_absent('gift_cards', 'gift_cards_redeem_consistency',
  'check ((is_redeemed = false and redeemed_by is null and redeemed_at is null) or (is_redeemed = true and redeemed_by is not null))');

select public.add_constraint_if_absent('gift_card_redemptions', 'gift_card_redemptions_card_key', 'unique (gift_card_id)');
select public.add_constraint_if_absent('gift_card_redemptions', 'gift_card_redemptions_amount_positive', 'check (amount > 0)');

select public.add_constraint_if_absent('referrals', 'referrals_referred_user_key', 'unique (referred_user_id)');
select public.add_constraint_if_absent('referrals', 'referrals_no_self', 'check (referrer_id <> referred_user_id)');

select public.add_constraint_if_absent('referral_earnings', 'referral_earnings_amount_positive', 'check (amount > 0)');
select public.add_constraint_if_absent('referral_earnings', 'referral_earnings_no_self', 'check (referrer_id <> referred_user_id)');

select public.add_constraint_if_absent('admin_roles', 'admin_roles_user_id_key', 'unique (user_id)');

select public.add_constraint_if_absent('reviews', 'reviews_rating_range', 'check (rating between 1 and 5)');
select public.add_constraint_if_absent('reviews', 'reviews_product_user_key', 'unique (product_id, user_id)');

drop function if exists public.add_constraint_if_absent(text, text, text);

-- ---------------------------------------------------------------------
-- 4) الفهارس (للاستعلامات المتكررة في الواجهة ولوحة الأدمن)
-- ---------------------------------------------------------------------
create index if not exists idx_users_referred_by            on public.users (referred_by);
create index if not exists idx_wallet_txn_wallet_created    on public.wallet_transactions (wallet_id, created_at desc);
create index if not exists idx_wallet_txn_reference         on public.wallet_transactions (reference_id);
create index if not exists idx_topup_user_created           on public.topup_requests (user_id, created_at desc);
create index if not exists idx_topup_status_created         on public.topup_requests (status, created_at desc);
create index if not exists idx_categories_game              on public.categories (game_id, sort_order);
create index if not exists idx_products_category            on public.products (category_id) where is_active;
create index if not exists idx_orders_user_created          on public.orders (user_id, created_at desc);
create index if not exists idx_orders_status_created        on public.orders (status, created_at desc);
create index if not exists idx_order_items_order            on public.order_items (order_id);
create index if not exists idx_order_items_product          on public.order_items (product_id);
create index if not exists idx_gift_card_redemptions_user   on public.gift_card_redemptions (user_id, created_at desc);
create index if not exists idx_referrals_referrer           on public.referrals (referrer_id);
create index if not exists idx_referral_earnings_referrer   on public.referral_earnings (referrer_id, status);
create index if not exists idx_notifications_user_unread    on public.notifications (user_id, is_read, created_at desc);
create index if not exists idx_audit_log_admin_created      on public.audit_log (admin_id, created_at desc);
create index if not exists idx_reviews_product              on public.reviews (product_id, created_at desc);
