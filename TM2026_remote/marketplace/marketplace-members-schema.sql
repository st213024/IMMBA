-- 商品交易平台會員表（與 public.admin_users 後台權限分離）
-- 在 Supabase SQL Editor 執行本檔後，賣場註冊會寫入此表。

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

comment on table public.marketplace_members is '商品交易平台會員（與後台 admin_users 無關）';

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

-- 超級管理員可管理全部賣場會員（需已執行 admin/supabase-schema.sql 的 current_user_is_super_admin）
drop policy if exists "marketplace_members_super_admin_select" on public.marketplace_members;
create policy "marketplace_members_super_admin_select"
on public.marketplace_members for select to authenticated
using (public.current_user_is_super_admin());

drop policy if exists "marketplace_members_super_admin_update" on public.marketplace_members;
create policy "marketplace_members_super_admin_update"
on public.marketplace_members for update to authenticated
using (public.current_user_is_super_admin())
with check (public.current_user_is_super_admin());

-- 若已建立過舊表，可另外執行：
-- alter table public.marketplace_members add column if not exists phone text;

notify pgrst, 'reload schema';
