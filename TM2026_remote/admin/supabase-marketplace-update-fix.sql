-- 修正「儲存賣場會員權限」錯誤：Could not find admin_update_marketplace_member(...)
-- 在 Supabase SQL Editor 執行本檔一次即可。

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

notify pgrst, 'reload schema';
