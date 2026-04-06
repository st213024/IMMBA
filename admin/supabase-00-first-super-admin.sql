-- =============================================================================
-- 寫入「第一位超級管理者」到 public.admin_users
-- =============================================================================
-- 預設信箱：st213024@gmail.com（可整份搜尋取代成其他 Email）
-- 前置條件（請先做）：
-- 1) 已在 Supabase Dashboard → Authentication → Users 建立該 Email 的帳號
--    （或使用後台登入頁「註冊」功能／邀請）
-- 2) 若該帳號需信箱驗證，請先完成驗證或於 Users 標記為已確認
-- 3) 已執行過 supabase-schema.sql，確保存在表 admin_users 與 RLS
--
-- 使用方式：Supabase → SQL Editor → 貼上本檔 → Run
-- 若回傳 INSERT 0 0：代表 auth.users 裡尚無此 Email，請先註冊或於後台建立使用者。
-- =============================================================================

insert into public.admin_users (user_id, email, role, is_active)
select id, lower(email), 'super_admin', true
from auth.users
where lower(email) = lower('st213024@gmail.com')
on conflict (email) do update set
  user_id = excluded.user_id,
  role = excluded.role,
  is_active = excluded.is_active,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 驗證：應看到一列 role = super_admin
-- -----------------------------------------------------------------------------
select id, user_id, email, role, is_active, created_at, updated_at
from public.admin_users
where lower(email) = lower('st213024@gmail.com');
