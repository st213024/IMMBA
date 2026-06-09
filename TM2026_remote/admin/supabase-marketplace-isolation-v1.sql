-- =============================================================================
-- 賣場會員與後台管理者隔離（既有 Supabase 專案請在 SQL Editor 執行本檔）
-- =============================================================================
-- 修正：
--   1) 僅在 marketplace_members 的帳號，無法透過後台登入自動寫入 admin_users
--   2) 超級管理員可於後台查詢／管理賣場會員（marketplace_members）
--   3) 註冊衝突時可依 Email 回傳明確提示（賣場會員 vs 後台）
-- =============================================================================

-- 需已存在 marketplace_members（執行 marketplace/marketplace-members-schema.sql）
-- 需已存在 current_user_is_super_admin()（執行 supabase-schema.sql）

-- -----------------------------------------------------------------------------
-- 賣場會員：超級管理員可讀寫全部
-- -----------------------------------------------------------------------------
drop policy if exists "marketplace_members_super_admin_select" on public.marketplace_members;
create policy "marketplace_members_super_admin_select"
on public.marketplace_members for select to authenticated
using (public.current_user_is_super_admin());

drop policy if exists "marketplace_members_super_admin_update" on public.marketplace_members;
create policy "marketplace_members_super_admin_update"
on public.marketplace_members for update to authenticated
using (public.current_user_is_super_admin())
with check (public.current_user_is_super_admin());

-- -----------------------------------------------------------------------------
-- 登入後同步：阻擋「僅賣場會員」自動成為後台 viewer
-- -----------------------------------------------------------------------------
create or replace function public.sync_admin_profile_after_login()
returns json
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  n bigint;
  em text;
  existing_id uuid;
  mp_only boolean;
begin
  if auth.uid() is null then
    raise exception '請先完成登入。' using errcode = 'P0001';
  end if;

  em := public.immba_jwt_email();
  if em is null or em = '' then
    raise exception '無法從登入工作階段取得 Email。' using errcode = 'P0001';
  end if;

  select id into existing_id
  from public.admin_users
  where user_id = auth.uid()
     or (lower(trim(email)) = em)
  limit 1;

  if existing_id is not null then
    update public.admin_users
    set
      user_id = coalesce(user_id, auth.uid()),
      updated_at = now()
    where id = existing_id
      and user_id is null
      and lower(trim(email)) = em;
    return json_build_object('ok', true, 'existed', true);
  end if;

  -- 僅賣場會員、且未被超級管理員預先加入 admin_users → 拒絕登入後台
  select exists (
    select 1 from public.marketplace_members mm
    where mm.user_id = auth.uid() or lower(trim(mm.email)) = em
  ) into mp_only;

  if mp_only then
    raise exception
      '此帳號為商品交易平台會員，無法登入後台管理。如需後台權限，請聯絡超級管理員在「管理員權限管理」預先新增您的 Email，再使用「登入」（請勿在後台重複註冊）。'
      using errcode = 'P0001';
  end if;

  select count(*) into n from public.admin_users;

  if n = 0 then
    insert into public.admin_users (user_id, email, role, is_active)
    values (auth.uid(), em, 'super_admin', true);
    return json_build_object('ok', true, 'existed', false, 'role', 'super_admin');
  end if;

  insert into public.admin_users (user_id, email, role, is_active)
  values (auth.uid(), em, 'viewer', true);
  return json_build_object('ok', true, 'existed', false, 'role', 'viewer');

exception
  when unique_violation then
    raise exception '此 Email 已在管理者表中，請改以一般方式登入或聯絡管理員。' using errcode = 'P0001';
end;
$$;

grant execute on function public.sync_admin_profile_after_login() to authenticated;

-- -----------------------------------------------------------------------------
-- 註冊／衝突提示（anon 可呼叫，僅回傳提示不含敏感資料）
-- -----------------------------------------------------------------------------
create or replace function public.check_email_registration_hint(p_email text)
returns json
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  em text := lower(trim(p_email));
  in_mp boolean := false;
  in_admin boolean := false;
begin
  if em is null or em = '' then
    return json_build_object('hint', 'invalid');
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'marketplace_members'
  ) then
    select exists(select 1 from public.marketplace_members where email = em) into in_mp;
  end if;

  select exists(select 1 from public.admin_users where lower(trim(email)) = em) into in_admin;

  if in_mp and not in_admin then
    return json_build_object(
      'hint', 'marketplace_only',
      'message',
      '此 Email 已註冊為「商品交易平台」會員，與後台帳號分離。無法於後台重複註冊；超級管理員可在「管理員權限管理 → 賣場會員」查看。若需後台權限，請聯絡超級管理員預先新增您的 Email 後再「登入」。'
    );
  end if;

  if in_admin then
    return json_build_object(
      'hint', 'admin_invited',
      'message',
      '此 Email 已在後台管理者名單中，請改為「登入」（若尚未驗證信箱請先完成驗證）。'
    );
  end if;

  return json_build_object(
    'hint', 'auth_exists',
    'message',
    '此 Email 已在 Supabase 註冊過。若為賣場會員請至商品交易平台登入；若需後台請聯絡超級管理員。'
  );
end;
$$;

grant execute on function public.check_email_registration_hint(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 超級管理員：列出賣場會員
-- -----------------------------------------------------------------------------
create or replace function public.admin_list_marketplace_members()
returns table (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  phone text,
  status text,
  seller_enabled boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if not public.current_user_is_super_admin() then
    raise exception '僅超級管理員可檢視賣場會員。' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'marketplace_members'
  ) then
    return;
  end if;

  return query
  select
    mm.id,
    mm.user_id,
    mm.email,
    mm.display_name,
    mm.phone,
    mm.status,
    mm.seller_enabled,
    mm.created_at,
    mm.updated_at
  from public.marketplace_members mm
  order by mm.created_at desc;
end;
$$;

grant execute on function public.admin_list_marketplace_members() to authenticated;

-- -----------------------------------------------------------------------------
-- 超級管理員：更新賣場會員狀態
-- 參數順序須為 p_email, p_seller_enabled, p_status（PostgREST 依名稱字母序比對）
-- -----------------------------------------------------------------------------
drop function if exists public.admin_update_marketplace_member(text, text, boolean);

create or replace function public.admin_update_marketplace_member(
  p_email text,
  p_seller_enabled boolean default null,
  p_status text default null
)
returns json
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  em text := lower(trim(p_email));
  row_id uuid;
begin
  if not public.current_user_is_super_admin() then
    raise exception '僅超級管理員可管理賣場會員。' using errcode = 'P0001';
  end if;

  if em is null or em = '' then
    raise exception '請提供 Email。' using errcode = 'P0001';
  end if;

  select id into row_id from public.marketplace_members where email = em limit 1;
  if row_id is null then
    raise exception '找不到此賣場會員。' using errcode = 'P0001';
  end if;

  if p_status is not null and p_status not in ('active', 'suspended') then
    raise exception '狀態僅可為 active 或 suspended。' using errcode = 'P0001';
  end if;

  update public.marketplace_members
  set
    status = coalesce(p_status, status),
    seller_enabled = coalesce(p_seller_enabled, seller_enabled),
    updated_at = now()
  where id = row_id;

  return json_build_object('ok', true, 'email', em);
end;
$$;

grant execute on function public.admin_update_marketplace_member(text, boolean, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 超級管理員：從 Auth 同步賣場會員（補登表建立前已註冊、僅寫入本機的帳號）
-- 規則：auth.users 有、admin_users 無 → 寫入 marketplace_members
-- -----------------------------------------------------------------------------
create or replace function public.admin_sync_marketplace_from_auth()
returns json
language plpgsql
security definer
set search_path = public, auth
set row_security = off
as $$
declare
  n int := 0;
  r record;
begin
  if not public.current_user_is_super_admin() then
    raise exception '僅超級管理員可執行同步。' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'marketplace_members'
  ) then
    raise exception '請先執行 marketplace/marketplace-members-schema.sql 建立 marketplace_members 表。' using errcode = 'P0001';
  end if;

  for r in
    select u.id as uid, lower(trim(u.email)) as em
    from auth.users u
    where u.email is not null
      and trim(u.email) <> ''
      and not exists (
        select 1 from public.admin_users a
        where lower(trim(a.email)) = lower(trim(u.email))
      )
      and not exists (
        select 1 from public.marketplace_members m
        where m.email = lower(trim(u.email))
      )
  loop
    insert into public.marketplace_members (user_id, email, status, seller_enabled)
    values (r.uid, r.em, 'active', true)
    on conflict (email) do update
      set user_id = excluded.user_id, updated_at = now();
    n := n + 1;
  end loop;

  return json_build_object('ok', true, 'synced', n);
end;
$$;

grant execute on function public.admin_sync_marketplace_from_auth() to authenticated;

-- -----------------------------------------------------------------------------
-- 補登既有賣場會員（僅在 marketplace_members 缺列、但 Auth 已有帳號時）
-- 至 Dashboard → Authentication → Users 複製 user_id 後執行，例如：
-- insert into public.marketplace_members (user_id, email)
-- values ('<auth-users-uuid>', 'seayall.200601@gmail.com')
-- on conflict (email) do update set user_id = excluded.user_id, updated_at = now();

-- 讓 Supabase API 立刻認得新建的 RPC（執行後無需等快取）
notify pgrst, 'reload schema';
