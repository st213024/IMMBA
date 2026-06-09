-- =============================================================================
-- imMBA 後台：Supabase 專案從零設定（新專案請依序執行）
-- =============================================================================
--
-- 【步驟 1】建立 Supabase 專案
--   至 https://supabase.com → New project → 記下 Database 密碼。
--
-- 【步驟 2】取得 API 金鑰
--   Dashboard → Project Settings → API
--   - Project URL → 貼到瀏覽器端 supabase-config.js 的 url
--   - anon public → 貼到 anonKey
--
-- 【步驟 3】網址與驗證信（Authentication → URL Configuration）
--   Site URL 例：http://127.0.0.1:8766
--   Redirect URLs 請加入（含萬用字元，免路徑打錯）：
--     http://127.0.0.1:8766/**
--     http://localhost:8766/**
--   （程式會依你實際開啟的 admin 網址自動帶入 auth-callback.html）
--
-- 【步驟 4】執行本檔
--   SQL Editor → New query → 全選貼上本檔 → Run（可重複執行）。
--
-- 【步驟 5】寄信（選用）
--   若驗證信收不到：Project Settings → Auth → Custom SMTP
--   或開發期：Authentication → Providers → Email → 關閉 Confirm email（僅測試用）
--
-- =============================================================================
-- 角色說明（public.admin_users.role）
--   super_admin：超級管理員，可改內容、可管理其他帳號權限
--   admin：一般管理者，可編輯公告／活動／師資等內容
--   viewer：僅能瀏覽後台（表單鎖定），新註冊者首次登入後預設為此角色
--
-- 【首位超級管理員】當 admin_users 尚無任何資料列時，「第一位完成信箱驗證並成功登入」
--   的使用者會由 RPC sync_admin_profile_after_login 自動寫入為 super_admin。
--   之後註冊登入者預設為 viewer，須由超級管理員在「管理員權限管理」升級為 admin。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) 舊版 admin_users（無 id 欄位）→ 改名
-- -----------------------------------------------------------------------------
do $do$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'admin_users'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'admin_users' and column_name = 'id'
  ) then
    execute 'alter table public.admin_users rename to admin_users_legacy_pre_uuid';
  end if;
end
$do$;

-- -----------------------------------------------------------------------------
-- 1) 資料表
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  email text not null unique,
  role text not null check (role in ('admin', 'super_admin', 'viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_email_lowercase check (email = lower(email))
);

-- 既有專案升級：確保 role 可為 viewer（可重複執行）
alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check
  check (role in ('admin', 'super_admin', 'viewer'));

comment on table public.admin_users is '後台權限：與 Auth 綁定；viewer=僅檢視，admin=可編輯內容，super_admin=可編輯內容並管理帳號';
comment on column public.admin_users.role is 'super_admin | admin | viewer';

alter table public.admin_users enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

-- -----------------------------------------------------------------------------
-- touch_updated_at
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_admin_users_touch_updated on public.admin_users;
create trigger trg_admin_users_touch_updated
before update on public.admin_users
for each row
execute function public.touch_updated_at();
-- 若上列報錯，請改為（擇一，與你的 PostgreSQL 版本相容即可）：
-- for each row execute procedure public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- 清除舊 RLS policies
-- -----------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'admin_users'
  loop
    execute format('drop policy if exists %I on public.admin_users', r.policyname);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 輔助：是否為啟用中的超級管理員
-- -----------------------------------------------------------------------------
create or replace function public.current_user_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
      and a.role = 'super_admin'
      and a.is_active = true
  );
$$;

-- -----------------------------------------------------------------------------
-- JWT email（多來源）
-- -----------------------------------------------------------------------------
create or replace function public.immba_jwt_email()
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select lower(trim(coalesce(
    nullif(trim(coalesce(auth.jwt() ->> 'email', '')), ''),
    nullif(trim(coalesce(auth.jwt() -> 'user_metadata' ->> 'email', '')), ''),
    nullif(trim(coalesce(auth.jwt() -> 'app_metadata' ->> 'email', '')), ''),
    ''
  )));
$$;

grant execute on function public.immba_jwt_email() to authenticated;

-- -----------------------------------------------------------------------------
-- admin_users 是否為空（顯示「首位將成為超級管理員」提示）
-- -----------------------------------------------------------------------------
create or replace function public.admin_users_is_empty()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select (select count(*)::bigint from public.admin_users) = 0;
$$;

grant execute on function public.admin_users_is_empty() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 登入後同步權限列：表空 → 第一位 super_admin；否則新帳號 → viewer
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

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'marketplace_members'
  ) and exists (
    select 1 from public.marketplace_members mm
    where mm.user_id = auth.uid() or lower(trim(mm.email)) = em
  ) then
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
-- RLS：讀取
-- -----------------------------------------------------------------------------
create policy "admin_users_select_self_or_super"
on public.admin_users
for select
to authenticated
using (
  user_id = auth.uid()
  or (
    email is not null
    and public.immba_jwt_email() <> ''
    and lower(trim(admin_users.email)) = public.immba_jwt_email()
  )
  or public.current_user_is_super_admin()
);

-- -----------------------------------------------------------------------------
-- RLS：首登入綁定 user_id
-- -----------------------------------------------------------------------------
create policy "admin_users_link_user_id"
on public.admin_users
for update
to authenticated
using (
  is_active = true
  and user_id is null
  and public.immba_jwt_email() <> ''
  and lower(trim(email)) = public.immba_jwt_email()
)
with check (
  user_id = auth.uid()
  and lower(trim(email)) = public.immba_jwt_email()
  and is_active = true
);

-- -----------------------------------------------------------------------------
-- RLS：僅超級管理員可 insert/update/delete（含調整他人角色）
-- -----------------------------------------------------------------------------
create policy "admin_users_super_admin_all"
on public.admin_users
for all
to authenticated
using (public.current_user_is_super_admin())
with check (public.current_user_is_super_admin());

-- -----------------------------------------------------------------------------
-- （選用）手動指定首位超級管理員 — 以 Auth 已存在使用者 Email 對齊
-- -----------------------------------------------------------------------------
-- insert into public.admin_users (user_id, email, role, is_active)
-- select id, lower(email), 'super_admin', true
-- from auth.users
-- where lower(email) = lower('you@example.com')
-- on conflict (email) do update set
--   user_id = excluded.user_id,
--   role = 'super_admin',
--   is_active = true,
--   updated_at = now();
