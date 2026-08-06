-- =====================================================================
-- RAIZEY STORE — الجزء 2: الدوال والتريجرز على مستوى قاعدة البيانات
-- المرجع: PROJECT_SPEC.md القسم 4 (تعديل الرصيد يتم فقط عبر دالة سيرفر ذرية)
--
-- يُشغَّل بعد 001_schema.sql. السكربت idempotent.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) تحديث updated_at تلقائياً على المحفظة
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_wallets_touch_updated_at on public.wallets;
create trigger trg_wallets_touch_updated_at
  before update on public.wallets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 2) توليد كود إحالة فريد لكل مستخدم جديد
-- ---------------------------------------------------------------------
create or replace function public.generate_referral_code()
returns trigger
language plpgsql
as $$
declare
  candidate text;
  attempts  int := 0;
begin
  if new.referral_code is not null and new.referral_code <> '' then
    return new;
  end if;

  loop
    candidate := upper(substr(md5(gen_random_uuid()::text), 1, 8));
    exit when not exists (select 1 from public.users where referral_code = candidate);
    attempts := attempts + 1;
    if attempts > 10 then
      raise exception 'تعذر توليد كود إحالة فريد. حاول مرة أخرى.';
    end if;
  end loop;

  new.referral_code := candidate;
  return new;
end $$;

drop trigger if exists trg_users_referral_code on public.users;
create trigger trg_users_referral_code
  before insert on public.users
  for each row execute function public.generate_referral_code();

-- ---------------------------------------------------------------------
-- 3) إنشاء محفظة تلقائياً لكل بروفايل جديد + تسجيل علاقة الإحالة
-- ---------------------------------------------------------------------
create or replace function public.bootstrap_user_records()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  if new.referred_by is not null and new.referred_by <> new.id then
    insert into public.referrals (referrer_id, referred_user_id)
    values (new.referred_by, new.id)
    on conflict (referred_user_id) do nothing;
  end if;

  return new;
end $$;

drop trigger if exists trg_users_bootstrap on public.users;
create trigger trg_users_bootstrap
  after insert on public.users
  for each row execute function public.bootstrap_user_records();

-- ---------------------------------------------------------------------
-- 4) منع الحذف أو التعديل على السجلات المالية والتدقيقية
--    (PROJECT_SPEC القسم 3: wallet_transactions و audit_log لا تُحذف ولا تُعدَّل)
-- ---------------------------------------------------------------------
create or replace function public.forbid_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'السجل % محمي: لا يمكن تعديله أو حذفه بعد الإنشاء.', tg_table_name;
end $$;

drop trigger if exists trg_wallet_transactions_immutable on public.wallet_transactions;
create trigger trg_wallet_transactions_immutable
  before update or delete on public.wallet_transactions
  for each row execute function public.forbid_mutation();

drop trigger if exists trg_audit_log_immutable on public.audit_log;
create trigger trg_audit_log_immutable
  before update or delete on public.audit_log
  for each row execute function public.forbid_mutation();

-- ---------------------------------------------------------------------
-- 5) الدالة الذرية الوحيدة المسموح بها لتغيير رصيد المحفظة
--    تُنادى من السيرفر فقط (service role) — ممنوع من العميل.
--    amount: موجب = إضافة، سالب = خصم.
-- ---------------------------------------------------------------------
create or replace function public.apply_wallet_transaction(
  p_user_id      uuid,
  p_amount       numeric,
  p_type         public.wallet_txn_type,
  p_reference_id uuid default null
)
returns table (transaction_id uuid, balance_after numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet_id   uuid;
  v_new_balance numeric(12, 2);
  v_txn_id      uuid;
begin
  if p_amount = 0 then
    raise exception 'قيمة العملية لا يمكن أن تكون صفراً.';
  end if;

  -- قفل صف المحفظة لمنع الخصم المزدوج عند الطلبات المتزامنة
  select w.id, w.balance
  into v_wallet_id, v_new_balance
  from public.wallets w
  where w.user_id = p_user_id
  for update;

  if v_wallet_id is null then
    raise exception 'لا توجد محفظة لهذا المستخدم.';
  end if;

  v_new_balance := v_new_balance + p_amount;

  if v_new_balance < 0 then
    raise exception 'الرصيد غير كافٍ لإتمام العملية.';
  end if;

  update public.wallets
  set balance = v_new_balance
  where id = v_wallet_id;

  insert into public.wallet_transactions (wallet_id, amount, type, reference_id, balance_after)
  values (v_wallet_id, p_amount, p_type, p_reference_id, v_new_balance)
  returning id into v_txn_id;

  return query select v_txn_id, v_new_balance;
end $$;

-- ممنوع نداء الدالة من العميل: الصلاحية للسيرفر فقط
revoke all on function public.apply_wallet_transaction(uuid, numeric, public.wallet_txn_type, uuid) from public;
revoke all on function public.apply_wallet_transaction(uuid, numeric, public.wallet_txn_type, uuid) from anon;
revoke all on function public.apply_wallet_transaction(uuid, numeric, public.wallet_txn_type, uuid) from authenticated;
grant execute on function public.apply_wallet_transaction(uuid, numeric, public.wallet_txn_type, uuid) to service_role;
