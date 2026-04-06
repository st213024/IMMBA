-- =============================================================================
-- 僅補上「首次超級管理者」RPC（若已整份執行 supabase-schema.sql 則不必重跑）
-- Supabase → SQL Editor → Run
-- =============================================================================

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

create or replace function public.bootstrap_first_super_admin()
returns json
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  n bigint;
  em text;
begin
  select count(*) into n from public.admin_users;
  if n > 0 then
    raise exception '已有管理者，無法使用首次建立。請使用一般登入，或請超級管理者於後台新增帳號。'
      using errcode = 'P0001';
  end if;
  if auth.uid() is null then
    raise exception '請先完成 Supabase Auth 登入後再試。'
      using errcode = 'P0001';
  end if;
  em := public.immba_jwt_email();
  if em is null or em = '' then
    raise exception '無法從登入工作階段取得 Email，請確認 Auth 帳號已設定信箱。'
      using errcode = 'P0001';
  end if;
  insert into public.admin_users (user_id, email, role, is_active)
  values (auth.uid(), em, 'super_admin', true);
  return json_build_object('ok', true, 'email', em, 'role', 'super_admin');
exception
  when unique_violation then
    raise exception '此 Email 或帳號已存在於管理者表，請改為一般登入。'
      using errcode = 'P0001';
end;
$$;

grant execute on function public.bootstrap_first_super_admin() to authenticated;
