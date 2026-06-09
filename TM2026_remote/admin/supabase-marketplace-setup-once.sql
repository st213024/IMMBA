-- =============================================================================
-- 賣場會員後台管理 — 一鍵安裝（在 Supabase SQL Editor 執行本檔一次即可）
-- =============================================================================
-- 內容：marketplace_members 表 + 隔離 RPC + 超級管理員查詢／同步
-- 前置：已執行過 admin/supabase-schema.sql（含 current_user_is_super_admin）
-- =============================================================================

create table if not exists public.marketplace_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  phone text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  seller_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_members_email_lower check (email = lower(email))
);

alter table public.marketplace_members enable row level security;
grant select, insert, update on public.marketplace_members to authenticated;

drop policy if exists "marketplace_members_select_self" on public.marketplace_members;
create policy "marketplace_members_select_self"
on public.marketplace_members for select to authenticated
using (user_id = auth.uid() or email = lower(auth.jwt() ->> 'email'));

drop policy if exists "marketplace_members_insert_self" on public.marketplace_members;
create policy "marketplace_members_insert_self"
on public.marketplace_members for insert to authenticated
with check (user_id = auth.uid() or email = lower(auth.jwt() ->> 'email'));

drop policy if exists "marketplace_members_update_self" on public.marketplace_members;
create policy "marketplace_members_update_self"
on public.marketplace_members for update to authenticated
using (user_id = auth.uid() or email = lower(auth.jwt() ->> 'email'));

drop policy if exists "marketplace_members_super_admin_select" on public.marketplace_members;
create policy "marketplace_members_super_admin_select"
on public.marketplace_members for select to authenticated
using (public.current_user_is_super_admin());

drop policy if exists "marketplace_members_super_admin_update" on public.marketplace_members;
create policy "marketplace_members_super_admin_update"
on public.marketplace_members for update to authenticated
using (public.current_user_is_super_admin())
with check (public.current_user_is_super_admin());

-- 其餘 RPC 與 sync_admin 更新請接續執行同目錄 supabase-marketplace-isolation-v1.sql
-- （本檔建立表與 RLS；isolation 檔含 admin_list_marketplace_members、admin_sync_marketplace_from_auth 等）
