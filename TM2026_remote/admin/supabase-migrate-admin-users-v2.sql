-- =============================================================================
-- 由「舊版 admin_users（無 id 欄位／email 主鍵）」遷移至新版
-- =============================================================================
-- 【建議】直接整份執行 supabase-schema.sql：內建第 0 節會自動改名舊表並建新表。
-- 若只想手動改名、再自行跑 schema，可單獨執行下方 DO 區塊。
-- =============================================================================

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

-- 接著請執行 supabase-schema.sql（從「1) 資料表」或整份皆可，整份可重複執行）。
