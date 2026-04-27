/**
 * Supabase 後台 Auth + admin_users（與 supabase-schema.sql 同步）
 *
 * 角色：super_admin、admin、viewer（viewer 僅能於前端檢視，無法儲存）
 */
(function () {
  const CACHE_KEY = "immba_admin_session_v4";
  const ADMIN_USERS_LIST_SELECT = "*";
  try {
    localStorage.removeItem("immba_admin_session_v3");
    localStorage.removeItem("immba_admin_session_v2");
  } catch (_) {}

  function normalizeSupabaseUrl(raw) {
    let u = String(raw || "").trim().replace(/\/+$/, "");
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (/^[a-z0-9.-]+\.supabase\.co$/i.test(u)) return "https://" + u.toLowerCase();
    if (/^[a-z0-9]+$/i.test(u) && u.length >= 12) {
      return "https://" + u.toLowerCase() + ".supabase.co";
    }
    return u;
  }

  function readConfig() {
    const cfg = window.__IMMBA_SUPABASE_CONFIG__ || {};
    const rawRedirect = String(cfg.emailRedirectTo || "").trim();
    return {
      url: normalizeSupabaseUrl(cfg.url),
      anonKey: String(cfg.anonKey || "").trim(),
      emailRedirectTo: rawRedirect.replace(/\/+$/, "")
    };
  }

  function getAuthEmailRedirectUrl() {
    try {
      if (typeof window !== "undefined") {
        const p = window.location?.protocol;
        if (p === "http:" || p === "https:") {
          return new URL("auth-callback.html", window.location.href).href;
        }
      }
    } catch (_) {}
    const configured = readConfig().emailRedirectTo;
    if (configured && /^https?:\/\//i.test(configured)) {
      return configured;
    }
    return undefined;
  }

  function diagnoseSupabaseEnv() {
    const { url, anonKey } = readConfig();
    if (url.includes("YOUR_PROJECT_REF") || anonKey.includes("YOUR_SUPABASE_ANON")) {
      return "請在 admin/supabase-config.js 填入 Supabase 專案的 url 與 anonKey（不要用預留字 YOUR_…）。";
    }
    const miss = [];
    if (!url) miss.push("url");
    if (!anonKey) miss.push("anonKey");
    if (miss.length) {
      return `supabase-config.js 缺少：${miss.join("、")}。`;
    }
    if (!/\.supabase\.co$/i.test(url) || !/^https:\/\//i.test(url)) {
      return "supabase-config.js 的 url 應為 https://<ref>.supabase.co。";
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      return "未載入 @supabase/supabase-js。";
    }
    return null;
  }

  function getClient() {
    const { url, anonKey } = readConfig();
    if (!url || !anonKey || !window.supabase?.createClient) return null;
    const sig = url + "\0" + anonKey;
    if (window.__IMMBA_SB_SIG__ !== sig) {
      window.__IMMBA_SB_CLIENT__ = null;
      window.__IMMBA_SB_SIG__ = sig;
    }
    if (!window.__IMMBA_SB_CLIENT__) {
      window.__IMMBA_SB_CLIENT__ = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
    return window.__IMMBA_SB_CLIENT__;
  }

  function getConfigDisplayHost() {
    try {
      const u = readConfig().url;
      return u ? new URL(u).host : "";
    } catch {
      return readConfig().url || "";
    }
  }

  function attachSupabaseAuthMeta(e, raw) {
    if (!raw || !e) return e;
    e.supabaseRaw = { code: raw.code, message: raw.message, status: raw.status };
    return e;
  }

  function mapAuthSignInError(err) {
    const code = String(err?.code || "");
    const msg = String(err?.message || "").toLowerCase();
    if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
      return attachSupabaseAuthMeta(
        new Error(
          "此帳號尚未完成信箱驗證，無法登入。\n請按「重寄驗證信」，或至 Dashboard → Authentication → Users 手動確認 Email。"
        ),
        err
      );
    }
    if (
      code === "over_request_rate_limit" ||
      code === "too_many_requests" ||
      msg.includes("rate limit")
    ) {
      return attachSupabaseAuthMeta(
        new Error("請求過於頻繁，請稍後再試。寄信／登入可能受 Supabase 限流影響。"),
        err
      );
    }
    if (
      code === "invalid_credentials" ||
      msg.includes("invalid login") ||
      msg.includes("invalid credential") ||
      msg.includes("email or password") ||
      msg.includes("wrong password")
    ) {
      return attachSupabaseAuthMeta(
        new Error(
          "無法登入。請確認信箱已驗證、密碼正確；若未驗證可能與「密碼錯誤」顯示相同。\n可試「重寄驗證信」。網址加 ?debug=1 可見錯誤碼。"
        ),
        err
      );
    }
    if (msg && msg !== "[object Object]") return attachSupabaseAuthMeta(new Error(String(err.message)), err);
    return attachSupabaseAuthMeta(new Error("登入失敗。"), err);
  }

  function mapSyncError(err) {
    const m = String(err?.message || err?.details || "");
    return attachSupabaseAuthMeta(new Error(m || "無法同步管理者權限，請確認已執行 supabase-schema.sql。"), err);
  }

  function mapSignUpError(err) {
    const code = String(err?.code || "");
    const msg = String(err?.message || "").toLowerCase();
    if (
      code === "user_already_registered" ||
      msg.includes("already registered") ||
      msg.includes("email address is already")
    ) {
      return new Error("此 Email 已註冊，請切到「登入」。");
    }
    if ((msg.includes("password") || msg.includes("weak")) && (msg.includes("short") || msg.includes("least"))) {
      return new Error("密碼不符合 Supabase 專案設定之長度或規則。");
    }
    if (msg && msg !== "[object Object]") return new Error(String(err.message));
    return new Error("註冊失敗。");
  }

  function mapResendError(err) {
    const code = String(err?.code || "");
    const msg = String(err?.message || "").toLowerCase();
    if (code === "over_email_send_rate_limit" || msg.includes("rate limit")) {
      return attachSupabaseAuthMeta(new Error("寄信過於頻繁，請稍後或至 Dashboard 手動確認信箱。"), err);
    }
    if (
      msg.includes("already confirmed") ||
      msg.includes("email already confirmed")
    ) {
      return attachSupabaseAuthMeta(new Error("信箱已驗證，請直接登入。"), err);
    }
    if (msg && msg !== "[object Object]") return attachSupabaseAuthMeta(new Error(String(err.message)), err);
    return attachSupabaseAuthMeta(new Error("重寄失敗。"), err);
  }

  function mapAdminTableError(err) {
    const msg = String(err?.message || "");
    const low = msg.toLowerCase();
    const code = String(err?.code || "");
    if ((low.includes("relation") && low.includes("does not exist")) || code === "42P01") {
      return new Error("尚未建立 admin_users。請在 SQL Editor 執行 supabase-schema.sql。");
    }
    if (code === "42501" || low.includes("permission denied") || low.includes("row-level security")) {
      return new Error("無法讀取權限表。請確認 RLS 與 immba_jwt_email 已依 schema 建立。");
    }
    if (msg && msg !== "[object Object]") return new Error(msg);
    return new Error("資料庫查詢失敗。");
  }

  async function checkConnection() {
    const why = diagnoseSupabaseEnv();
    if (why) throw new Error(why);
    const { url, anonKey } = readConfig();
    const sb = getClient();
    if (!sb) throw new Error(diagnoseSupabaseEnv() || "無法建立 client。");
    const health = await fetch(url.replace(/\/+$/, "") + "/auth/v1/health", {
      method: "GET",
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey }
    });
    if (!health.ok) {
      throw new Error("Auth health 回應 " + health.status + "。請檢查 url 與 anonKey。");
    }
    const { error } = await sb.auth.getSession();
    if (error) throw error;
    return true;
  }

  function setLocalSession(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  }

  function clearLocalSession() {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem("immba_admin_session_v3");
    localStorage.removeItem("immba_admin_session_v2");
  }

  function getLocalSession() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return null;
      if (!parsed.email || !parsed.role || !parsed.userId) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function hasLocalSession() {
    return Boolean(getLocalSession());
  }

  const LOCKED_SUPER_ADMIN_EMAIL = "st213024@gmail.com";

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function isLockedSuperAdminEmail(email) {
    return normalizeEmail(email) === LOCKED_SUPER_ADMIN_EMAIL;
  }

  /**
   * 儲存單一列的角色／啟用狀態（viewer | admin）。
   * 固定超級管理員信箱不可於此變更。
   * role 為 admin 且啟用時會併寫審核欄位（若存在）。
   */
  async function saveAdminRow(email, role, isActive) {
    const sb = getClient();
    if (!sb) throw new Error("Supabase 尚未設定。");
    const normalized = normalizeEmail(email);
    if (!normalized) throw new Error("請輸入 Email。");
    if (isLockedSuperAdminEmail(normalized)) {
      throw new Error("此帳號為固定超級管理員，無法於此處變更。");
    }
    if (!["admin", "viewer"].includes(role)) {
      throw new Error("僅可選擇一般管理者或僅檢視。");
    }
    const active = Boolean(isActive);
    if (role === "admin" && active) {
      await approveAsAdminEditor(normalized);
      return;
    }
    await upsertAdminUser(normalized, role, active);
  }

  function isContentReadOnly() {
    const s = getLocalSession();
    return Boolean(s && s.role === "viewer");
  }

  function canEditContent() {
    const s = getLocalSession();
    return Boolean(s && (s.role === "super_admin" || s.role === "admin"));
  }

  async function fetchAdminRow(sb, user) {
    const uid = user.id;
    const em = normalizeEmail(user.email);
    try {
      let { data, error } = await sb.from("admin_users").select("*").eq("user_id", uid).maybeSingle();
      if (error) throw error;
      if (data) return data;
      ({ data, error } = await sb.from("admin_users").select("*").eq("email", em).maybeSingle());
      if (error) throw error;
      return data || null;
    } catch (e) {
      throw mapAdminTableError(e);
    }
  }

  async function tryLinkUserId(sb, row, user) {
    if (!row || row.user_id != null) return row;
    const em = normalizeEmail(user.email);
    if (normalizeEmail(row.email) !== em) return row;
    const { error: upErr } = await sb
      .from("admin_users")
      .update({ user_id: user.id })
      .eq("id", row.id)
      .is("user_id", null);
    if (upErr) throw mapAdminTableError(upErr);
    const { data: fresh, error: rdErr } = await sb.from("admin_users").select("*").eq("id", row.id).maybeSingle();
    if (rdErr) throw mapAdminTableError(rdErr);
    if (!fresh?.user_id) throw new Error("無法綁定 user_id。");
    return fresh;
  }

  function buildSessionPayload(user, row) {
    return {
      userId: user.id,
      email: normalizeEmail(user.email),
      role: row.role,
      adminRowId: row.id,
      at: Date.now()
    };
  }

  async function authorizeAfterAuth(user) {
    const sb = getClient();
    if (!sb) throw new Error("Supabase 尚未設定。");
    if (!user?.email) throw new Error("登入狀態缺少 email。");

    let row = await fetchAdminRow(sb, user);
    if (!row) {
      const { error: rpcErr } = await sb.rpc("sync_admin_profile_after_login");
      if (rpcErr) {
        await sb.auth.signOut();
        clearLocalSession();
        throw mapSyncError(rpcErr);
      }
      row = await fetchAdminRow(sb, user);
    }

    if (!row) {
      await sb.auth.signOut();
      clearLocalSession();
      const e = new Error("無法建立或讀取管理者資料列。請確認已執行 supabase-schema.sql。");
      e.immbaCode = "NO_ADMIN_ROW";
      throw e;
    }

    if (row.user_id != null && row.user_id !== user.id) {
      await sb.auth.signOut();
      clearLocalSession();
      throw new Error("帳號與權限表綁定不一致。");
    }

    if (!row.is_active) {
      await sb.auth.signOut();
      clearLocalSession();
      throw new Error("此帳號已停用。");
    }

    if (!["admin", "super_admin", "viewer"].includes(row.role)) {
      await sb.auth.signOut();
      clearLocalSession();
      throw new Error("角色無效。");
    }

    if (row.user_id == null) {
      row = await tryLinkUserId(sb, row, user);
      if (!row.user_id) {
        await sb.auth.signOut();
        clearLocalSession();
        throw new Error("無法完成帳號綁定。");
      }
    }

    const payload = buildSessionPayload(user, row);
    setLocalSession(payload);
    return payload;
  }

  async function signInAdmin(email, password) {
    const why = diagnoseSupabaseEnv();
    if (why) throw new Error(why);
    const sb = getClient();
    if (!sb) throw new Error(diagnoseSupabaseEnv() || "無法建立 client。");
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("請輸入 Email。");

    const { data, error } = await sb.auth.signInWithPassword({
      email: normalizedEmail,
      password: String(password || "")
    });
    if (error) throw mapAuthSignInError(error);

    let user = data?.session?.user || data?.user;
    if (!user?.email) {
      const { data: gu, error: ge } = await sb.auth.getUser();
      if (ge) throw mapAuthSignInError(ge);
      user = gu?.user;
    }
    if (!user?.id) throw new Error("無法取得使用者資訊。");

    return authorizeAfterAuth(user);
  }

  async function adminUsersIsEmpty() {
    const sb = getClient();
    if (!sb) return false;
    try {
      const { data, error } = await sb.rpc("admin_users_is_empty");
      if (error) return false;
      return data === true;
    } catch {
      return false;
    }
  }

  async function signUp(email, password) {
    const why = diagnoseSupabaseEnv();
    if (why) throw new Error(why);
    const sb = getClient();
    if (!sb) throw new Error(diagnoseSupabaseEnv() || "無法建立 client。");
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("請輸入 Email。");
    const redirectTo = getAuthEmailRedirectUrl();
    const { data, error } = await sb.auth.signUp({
      email: normalizedEmail,
      password: String(password || ""),
      ...(redirectTo ? { options: { emailRedirectTo: redirectTo } } : {})
    });
    if (error) throw mapSignUpError(error);

    const identities = data?.user?.identities;
    if (Array.isArray(identities) && identities.length === 0) {
      throw new Error("此 Email 可能已註冊，請改為「登入」。");
    }

    return {
      ...data,
      email: normalizedEmail,
      needsEmailVerification: !data?.session
    };
  }

  async function resendSignupEmail(email) {
    const why = diagnoseSupabaseEnv();
    if (why) throw new Error(why);
    const sb = getClient();
    if (!sb) throw new Error(diagnoseSupabaseEnv() || "無法建立 client。");
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("請輸入 Email。");
    const redirectTo = getAuthEmailRedirectUrl();
    const { data, error } = await sb.auth.resend({
      type: "signup",
      email: normalizedEmail,
      ...(redirectTo ? { options: { emailRedirectTo: redirectTo } } : {})
    });
    if (error) throw mapResendError(error);
    return { ok: true, redirectTo: redirectTo || null, data: data ?? null };
  }

  async function signOutAdmin() {
    const sb = getClient();
    clearLocalSession();
    if (!sb) return;
    await sb.auth.signOut();
  }

  async function bootstrapFromSupabase() {
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb.auth.getSession();
    if (error) throw error;
    const user = data?.session?.user;
    if (!user?.id || !user?.email) {
      clearLocalSession();
      return null;
    }
    try {
      return await authorizeAfterAuth(user);
    } catch (_) {
      clearLocalSession();
      try {
        await sb.auth.signOut();
      } catch (_) {}
      return null;
    }
  }

  async function listAdminUsers() {
    const sb = getClient();
    if (!sb) throw new Error("Supabase 尚未設定。");
    const { data, error } = await sb
      .from("admin_users")
      .select(ADMIN_USERS_LIST_SELECT)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /** 是否為「已進入 admin_users、尚待核定管理／編輯身分」之列（與審核欄位或舊版 viewer 語意相容） */
  function isPendingManagementReview(row) {
    if (!row || row.is_active === false) return false;
    if (row.role === "super_admin") return false;
    const hasReviewFields =
      Object.prototype.hasOwnProperty.call(row, "status") ||
      Object.prototype.hasOwnProperty.call(row, "approved");
    if (hasReviewFields) {
      if (row.status === "rejected" || row.status === "disabled") return false;
      if (row.status === "approved" && row.approved === true) return false;
      return row.approved === false || row.status === "pending";
    }
    return row.role === "viewer" && row.user_id != null;
  }

  async function listPendingManagementReview() {
    const rows = await listAdminUsers();
    return rows
      .filter(isPendingManagementReview)
      .sort((a, b) => {
        const ta = new Date(a.created_at || 0).getTime();
        const tb = new Date(b.created_at || 0).getTime();
        return ta - tb;
      });
  }

  async function upsertAdminUser(email, role, isActive) {
    const sb = getClient();
    if (!sb) throw new Error("Supabase 尚未設定。");
    const normalized = normalizeEmail(email);
    if (!normalized) throw new Error("請輸入 Email。");
    if (!["admin", "super_admin", "viewer"].includes(role)) throw new Error("角色無效（請選 admin、super_admin 或 viewer）。");

    const { data: existing, error: selErr } = await sb
      .from("admin_users")
      .select("id, user_id")
      .eq("email", normalized)
      .maybeSingle();
    if (selErr) throw selErr;

    const active = Boolean(isActive);

    if (existing?.id) {
      const { error } = await sb
        .from("admin_users")
        .update({
          role,
          is_active: active
        })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("admin_users").insert({
        email: normalized,
        user_id: null,
        role,
        is_active: active
      });
      if (error) throw error;
    }
    return { email: normalized, role, is_active: active };
  }

  /** 將待審帳號核准為可編輯管理者；若資料表有審核欄位一併寫入。 */
  async function approveAsAdminEditor(email) {
    const sb = getClient();
    if (!sb) throw new Error("Supabase 尚未設定。");
    const normalized = normalizeEmail(email);
    if (!normalized) throw new Error("請輸入 Email。");
    const me = getLocalSession();
    const full = {
      role: "admin",
      is_active: true,
      status: "approved",
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: me?.email || null
    };
    let { error } = await sb.from("admin_users").update(full).eq("email", normalized);
    if (error) {
      ({ error } = await sb.from("admin_users").update({ role: "admin", is_active: true }).eq("email", normalized));
    }
    if (error) throw mapAdminTableError(error);
  }

  async function removeAdminUser(email) {
    const sb = getClient();
    if (!sb) throw new Error("Supabase 尚未設定。");
    const normalized = normalizeEmail(email);
    if (isLockedSuperAdminEmail(normalized)) {
      throw new Error("不可刪除此固定超級管理員帳號。");
    }
    const me = getLocalSession();
    if (me && normalized === me.email) {
      throw new Error("不可刪除目前登入中的自己。");
    }
    const { error } = await sb.from("admin_users").delete().eq("email", normalized);
    if (error) throw error;
  }

  function isSuperAdmin() {
    const s = getLocalSession();
    return Boolean(s && s.role === "super_admin");
  }

  window.AdminAuth = {
    getClient,
    normalizeSupabaseUrl,
    getConfigDisplayHost,
    getAuthEmailRedirectUrl,
    diagnoseSupabaseEnv,
    checkConnection,
    getLocalSession,
    hasLocalSession,
    isContentReadOnly,
    canEditContent,
    bootstrapFromSupabase,
    signInAdmin,
    adminUsersIsEmpty,
    signOutAdmin,
    signUp,
    resendSignupEmail,
    listAdminUsers,
    listPendingManagementReview,
    isPendingManagementReview,
    upsertAdminUser,
    approveAsAdminEditor,
    saveAdminRow,
    isLockedSuperAdminEmail,
    removeAdminUser,
    isSuperAdmin
  };
})();
