-- =============================================================================
-- 快速修正：admin_users 讀取 RLS 與 JWT email 來源（與 supabase-schema.sql 同步）
-- 若 admin_users 無法讀取、或「只預建 email 首登」失敗，在 SQL Editor 執行本檔即可。
-- 前置：已存在 public.admin_users、public.current_user_is_super_admin()
-- =============================================================================

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

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

drop policy if exists "admin_users_select_self_or_super" on public.admin_users;
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

drop policy if exists "admin_users_link_user_id" on public.admin_users;
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
