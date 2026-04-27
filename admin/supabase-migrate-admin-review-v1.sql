-- =============================================================================
-- 遷移：admin_users 審核欄位 + sync / super_admin 判斷（v1）
-- 請在 Supabase SQL Editor 執行一次（可安全重複執行）。
-- =============================================================================

alter table public.admin_users add column if not exists status text;
alter table public.admin_users add column if not exists approved boolean;
alter table public.admin_users add column if not exists approved_by text;
alter table public.admin_users add column if not exists approved_at timestamptz;

update public.admin_users set approved = true where approved is null;
update public.admin_users set status = 'approved' where status is null or trim(status) = '';

alter table public.admin_users alter column approved set default false;
alter table public.admin_users alter column status set default 'pending';

alter table public.admin_users alter column approved set not null;
alter table public.admin_users alter column status set not null;

alter table public.admin_users drop constraint if exists admin_users_status_check;
alter table public.admin_users add constraint admin_users_status_check
  check (status in ('pending', 'approved', 'rejected', 'disabled'));

comment on column public.admin_users.status is 'pending | approved | rejected | disabled';
comment on column public.admin_users.approved is '是否已核准可使用後台（與 status 搭配）';
comment on column public.admin_users.approved_by is '核准者 email（文字）';
comment on column public.admin_users.approved_at is '核准時間';

-- -----------------------------------------------------------------------------
-- 僅「已核准且啟用」的超級管理員（供 RLS / 審核頁）
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
      and a.approved = true
      and a.status = 'approved'
  );
$$;

-- -----------------------------------------------------------------------------
-- 登入後同步：表空 → 首位 super_admin 已核准；其餘新帳 → viewer 待審核
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

  select count(*) into n from public.admin_users;

  if n = 0 then
    insert into public.admin_users (
      user_id, email, role, is_active, status, approved, approved_at, approved_by
    )
    values (
      auth.uid(), em, 'super_admin', true, 'approved', true, now(), null
    );
    return json_build_object('ok', true, 'existed', false, 'role', 'super_admin');
  end if;

  insert into public.admin_users (
    user_id, email, role, is_active, status, approved
  )
  values (
    auth.uid(), em, 'viewer', true, 'pending', false
  );
  return json_build_object('ok', true, 'existed', false, 'role', 'viewer', 'status', 'pending');

exception
  when unique_violation then
    raise exception '此 Email 已在管理者表中，請改以一般方式登入或聯絡管理員。' using errcode = 'P0001';
end;
$$;

grant execute on function public.sync_admin_profile_after_login() to authenticated;
