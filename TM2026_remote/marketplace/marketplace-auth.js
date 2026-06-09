/**
 * 商品交易平台 — 獨立會員 Auth（與 admin/supabase-auth.js 後台分離）
 * 使用獨立 Supabase auth storageKey，登入狀態不與後台互通。
 */
(function () {
  const CACHE_KEY = "immba_marketplace_session_v1";
  const LOCAL_MEMBERS_KEY = "immba_marketplace_members_v1";
  const AUTH_STORAGE_KEY = "sb-immba-marketplace-auth";

  function readConfig() {
    const cfg = window.SUPABASE_CONFIG || window.__IMMBA_SUPABASE_CONFIG__ || {};
    let url = String(cfg.url || "").trim().replace(/\/+$/, "");
    if (url && !/^https?:\/\//i.test(url) && /\.supabase\.co$/i.test(url)) {
      url = "https://" + url;
    }
    return {
      url,
      anonKey: String(cfg.anonKey || "").trim(),
      emailRedirectTo: String(cfg.emailRedirectTo || "").trim().replace(/\/+$/, ""),
    };
  }

  function mapSignUpError(err) {
    const code = String(err?.code || "");
    const msg = String(err?.message || "").toLowerCase();
    if (
      code === "user_already_registered" ||
      msg.includes("already registered") ||
      msg.includes("email address is already")
    ) {
      return new Error("此 Email 已註冊，請改為「登入」或使用「重寄驗證信」。");
    }
    if ((msg.includes("password") || msg.includes("weak")) && (msg.includes("short") || msg.includes("least"))) {
      return new Error("密碼不符合 Supabase 專案設定之長度或規則。");
    }
    if (msg && msg !== "[object object]") return new Error(String(err.message));
    return new Error("註冊失敗。");
  }

  function mapSignInError(err) {
    const code = String(err?.code || "");
    const msg = String(err?.message || "").toLowerCase();
    if (
      code === "email_not_confirmed" ||
      msg.includes("email not confirmed") ||
      msg.includes("not confirmed")
    ) {
      return new Error("信箱尚未驗證，請點選下方「重寄驗證信」後至信箱（含垃圾信）開啟連結。");
    }
    if (msg.includes("invalid login credentials") || code === "invalid_credentials") {
      return new Error("Email 或密碼錯誤，請再試一次。");
    }
    if (msg && msg !== "[object object]") return new Error(String(err.message));
    return new Error("登入失敗。");
  }

  function mapResendError(err) {
    const code = String(err?.code || "");
    const msg = String(err?.message || "").toLowerCase();
    if (code === "over_email_send_rate_limit" || msg.includes("rate limit")) {
      return new Error("寄信過於頻繁（Supabase 限制），請等待 1 小時後再試，或請管理員至 Supabase 後台手動確認信箱。");
    }
    if (msg.includes("already confirmed") || msg.includes("email already confirmed")) {
      return new Error("此信箱已驗證完成，請直接登入。");
    }
    if (msg.includes("redirect") || msg.includes("invalid url")) {
      return new Error("驗證信導向網址未在 Supabase 白名單，請聯繫管理員設定 Redirect URLs。");
    }
    if (msg && msg !== "[object object]") return new Error(String(err.message));
    return new Error("重寄失敗，請稍後再試或聯繫管理員。");
  }

  function diagnoseSupabaseEnv() {
    const { url, anonKey } = readConfig();
    if (!url || !anonKey) return "請在 supabase-config.js 填入 Supabase url 與 anonKey。";
    if (!window.supabase?.createClient) return "未載入 @supabase/supabase-js。";
    return null;
  }

  function getClient() {
    const why = diagnoseSupabaseEnv();
    if (why) return null;
    const { url, anonKey } = readConfig();
    const sig = url + "\0" + anonKey + "\0" + AUTH_STORAGE_KEY;
    if (window.__IMMBA_MP_SB_SIG__ !== sig) {
      window.__IMMBA_MP_SB_CLIENT__ = null;
      window.__IMMBA_MP_SB_SIG__ = sig;
    }
    if (!window.__IMMBA_MP_SB_CLIENT__) {
      window.__IMMBA_MP_SB_CLIENT__ = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: AUTH_STORAGE_KEY,
        },
      });
    }
    return window.__IMMBA_MP_SB_CLIENT__;
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function getAuthCallbackUrl() {
    try {
      if (typeof window !== "undefined") {
        const p = window.location?.protocol;
        if (p === "http:" || p === "https:") {
          return new URL("auth-callback.html", window.location.href).href;
        }
      }
    } catch (_) {}
    const configured = readConfig().emailRedirectTo;
    if (configured && /^https?:\/\//i.test(configured)) return configured;
    return undefined;
  }

  function setLocalSession(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  }

  function clearLocalSession() {
    localStorage.removeItem(CACHE_KEY);
  }

  function getLocalSession() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (!parsed?.userId || !parsed?.email) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function readLocalMembers() {
    try {
      const rows = JSON.parse(localStorage.getItem(LOCAL_MEMBERS_KEY) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  function writeLocalMembers(rows) {
    localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(rows));
  }

  function upsertLocalMember(user) {
    const em = normalizeEmail(user.email);
    const rows = readLocalMembers();
    let row = rows.find((r) => r.user_id === user.id || r.email === em);
    if (!row) {
      row = {
        user_id: user.id,
        email: em,
        status: "active",
        seller_enabled: true,
        created_at: new Date().toISOString(),
      };
      rows.push(row);
    } else {
      row.user_id = user.id;
      row.email = em;
    }
    writeLocalMembers(rows);
    return row;
  }

  function getLocalMember(userId, email) {
    const em = normalizeEmail(email);
    return readLocalMembers().find((r) => r.user_id === userId || r.email === em) || null;
  }

  function updateLocalMember(userId, fields) {
    const rows = readLocalMembers();
    let row = rows.find((r) => r.user_id === userId);
    if (!row) return null;
    if (fields.display_name !== undefined) row.display_name = fields.display_name;
    if (fields.phone !== undefined) row.phone = fields.phone;
    row.updated_at = new Date().toISOString();
    writeLocalMembers(rows);
    return row;
  }

  /** Supabase 尚未建立 marketplace_members 時，改以本機儲存會員資料 */
  function isMissingMembersTableError(e) {
    if (!e) return false;
    const code = String(e.code || "").toUpperCase();
    const msg = String(e.message || e.details || e.hint || "").toLowerCase();
    if (code === "42P01" || code === "PGRST205" || code === "PGRST204" || code === "PGRST106") {
      return true;
    }
    if (!msg.includes("marketplace_members") && !msg.includes("relation")) return false;
    return (
      msg.includes("does not exist") ||
      msg.includes("schema cache") ||
      msg.includes("could not find") ||
      msg.includes("not found")
    );
  }

  function localMemberFallback(user) {
    return upsertLocalMember(user);
  }

  async function fetchMemberRow(sb, user) {
    const em = normalizeEmail(user.email);
    try {
      let { data, error } = await sb
        .from("marketplace_members")
        .select("user_id,email,status,seller_enabled,display_name,phone")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        if (isMissingMembersTableError(error)) return localMemberFallback(user);
        throw error;
      }
      if (data) return data;
      ({ data, error } = await sb
        .from("marketplace_members")
        .select("user_id,email,status,seller_enabled,display_name,phone")
        .eq("email", em)
        .maybeSingle());
      if (error) {
        if (isMissingMembersTableError(error)) return localMemberFallback(user);
        throw error;
      }
      return data || null;
    } catch (e) {
      if (isMissingMembersTableError(e)) return localMemberFallback(user);
      throw e;
    }
  }

  async function ensureMemberRow(sb, user) {
    let row;
    try {
      row = await fetchMemberRow(sb, user);
    } catch (e) {
      if (isMissingMembersTableError(e)) return localMemberFallback(user);
      throw e;
    }
    if (row) {
      if (!row.user_id) {
        try {
          const { data, error } = await sb
            .from("marketplace_members")
            .update({ user_id: user.id })
            .eq("email", normalizeEmail(user.email))
            .select("user_id,email,status,seller_enabled,display_name,phone")
            .maybeSingle();
          if (!error && data) row = data;
          else if (error && isMissingMembersTableError(error)) row = localMemberFallback(user);
        } catch (e) {
          if (isMissingMembersTableError(e)) row = localMemberFallback(user);
        }
      }
      return row;
    }
    const payload = {
      user_id: user.id,
      email: normalizeEmail(user.email),
      status: "active",
      seller_enabled: true,
    };
    try {
      const { data, error } = await sb.from("marketplace_members").insert(payload).select().maybeSingle();
      if (error) {
        if (isMissingMembersTableError(error)) return localMemberFallback(user);
        throw error;
      }
      return data || payload;
    } catch (e) {
      if (isMissingMembersTableError(e)) return localMemberFallback(user);
      throw e;
    }
  }

  function buildSessionPayload(user, row) {
    return {
      userId: user.id,
      email: normalizeEmail(user.email),
      status: row?.status || "active",
      sellerEnabled: row?.seller_enabled !== false,
      displayName: String(row?.display_name || "").trim(),
      phone: String(row?.phone || "").trim(),
    };
  }

  async function bootstrapFromSupabase() {
    const sb = getClient();
    if (!sb) return null;
    const { data } = await sb.auth.getUser();
    const user = data?.user;
    if (!user) {
      clearLocalSession();
      return null;
    }
    let row;
    try {
      row = await ensureMemberRow(sb, user);
    } catch (e) {
      if (!isMissingMembersTableError(e)) throw e;
      row = localMemberFallback(user);
    }
    const session = buildSessionPayload(user, row);
    setLocalSession(session);
    return { user, profile: row, session };
  }

  async function signUp(email, password) {
    const sb = getClient();
    if (!sb) throw new Error(diagnoseSupabaseEnv() || "Supabase 未設定。");
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("請輸入 Email。");
    const redirectTo = getAuthCallbackUrl();
    const { data, error } = await sb.auth.signUp({
      email: normalizedEmail,
      password: String(password || ""),
      options: {
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
        data: { account_origin: "marketplace" },
      },
    });
    if (error) throw mapSignUpError(error);
    const identities = data?.user?.identities;
    if (Array.isArray(identities) && identities.length === 0) {
      throw new Error("此 Email 可能已註冊，請改為「登入」或使用「重寄驗證信」。");
    }
    if (data.user) {
      try {
        await ensureMemberRow(sb, data.user);
      } catch (e) {
        console.warn("[marketplace-auth] ensureMemberRow after signUp:", e);
      }
    }
    return {
      needsEmailVerification: !data.session,
      user: data.user,
      redirectTo: redirectTo || null,
    };
  }

  async function signIn(email, password) {
    const sb = getClient();
    if (!sb) throw new Error(diagnoseSupabaseEnv() || "Supabase 未設定。");
    const { data, error } = await sb.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) throw mapSignInError(error);
    const user = data.user;
    if (!user) throw new Error("登入失敗。");
    let row;
    try {
      row = await ensureMemberRow(sb, user);
    } catch (e) {
      if (!isMissingMembersTableError(e)) throw e;
      row = localMemberFallback(user);
    }
    if (row?.status === "suspended") {
      await sb.auth.signOut();
      clearLocalSession();
      throw new Error("此會員帳號已停權，無法登入賣場。");
    }
    const session = buildSessionPayload(user, row);
    setLocalSession(session);
    return { user, profile: row, session };
  }

  async function signOut() {
    const sb = getClient();
    if (sb) await sb.auth.signOut();
    clearLocalSession();
  }

  async function resendSignupEmail(email) {
    const sb = getClient();
    if (!sb) throw new Error(diagnoseSupabaseEnv() || "Supabase 未設定。");
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("請先輸入 Email。");
    const redirectTo = getAuthCallbackUrl();
    const { error } = await sb.auth.resend({
      type: "signup",
      email: normalizedEmail,
      ...(redirectTo ? { options: { emailRedirectTo: redirectTo } } : {}),
    });
    if (error) throw mapResendError(error);
  }

  async function resetPasswordForEmail(email) {
    const sb = getClient();
    if (!sb) throw new Error(diagnoseSupabaseEnv() || "Supabase 未設定。");
    const redirectTo = (function () {
      try {
        return new URL("login.html", window.location.href).href;
      } catch {
        return undefined;
      }
    })();
    const { error } = await sb.auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo });
    if (error) throw error;
  }

  async function getMemberProfile(userId) {
    const sb = getClient();
    if (!sb) return getLocalMember(userId);
    const { data: auth } = await sb.auth.getUser();
    const user = auth?.user;
    if (!user || user.id !== userId) return getLocalMember(userId);
    return fetchMemberRow(sb, user);
  }

  async function updateMemberProfile(fields) {
    const sb = getClient();
    if (!sb) throw new Error(diagnoseSupabaseEnv() || "Supabase 未設定。");
    const { data: auth } = await sb.auth.getUser();
    const user = auth?.user;
    if (!user) throw new Error("請先登入賣場會員。");

    const displayName = String(fields?.displayName ?? "").trim();
    const phone = String(fields?.phone ?? "").trim();
    if (!displayName) throw new Error("請填寫顯示名稱。");

    const payload = {
      display_name: displayName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    };

    await ensureMemberRow(sb, user);
    let row = updateLocalMember(user.id, payload);

    try {
      const { data, error } = await sb
        .from("marketplace_members")
        .update(payload)
        .eq("user_id", user.id)
        .select("user_id,email,status,seller_enabled,display_name,phone")
        .maybeSingle();
      if (!error && data) row = data;
      else if (error && !isMissingMembersTableError(error)) {
        const { data: nameOnly, error: nameErr } = await sb
          .from("marketplace_members")
          .update({ display_name: payload.display_name, updated_at: payload.updated_at })
          .eq("user_id", user.id)
          .select("user_id,email,status,seller_enabled,display_name,phone")
          .maybeSingle();
        if (!nameErr && nameOnly) row = { ...nameOnly, phone: payload.phone };
      }
    } catch (e) {
      if (!isMissingMembersTableError(e)) {
        row = updateLocalMember(user.id, payload) || row;
      }
    }

    if (!row) row = updateLocalMember(user.id, payload) || (await fetchMemberRow(sb, user));

    const session = buildSessionPayload(user, row);
    setLocalSession(session);
    return { user, profile: row, session };
  }

  window.MarketplaceAuth = {
    diagnoseSupabaseEnv,
    getClient,
    getAuthCallbackUrl,
    bootstrapFromSupabase,
    signUp,
    signIn,
    signOut,
    resendSignupEmail,
    resetPasswordForEmail,
    getMemberProfile,
    updateMemberProfile,
    getLocalSession,
    hasLocalSession: () => Boolean(getLocalSession()),
    normalizeEmail,
  };
})();
