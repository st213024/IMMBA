(function () {
  const DEFAULT_NEXT = "dashboard.html";

  function pathNormalize(p) {
    return String(p || "").replace(/\\/g, "/");
  }

  function pathAfterAdmin(pathname) {
    const p = pathNormalize(pathname);
    const low = p.toLowerCase();
    const needle = "/admin/";
    const i = low.lastIndexOf(needle);
    if (i === -1) return null;
    return p.slice(i + needle.length) || "";
  }

  function getNextParam() {
    let rel = pathAfterAdmin(location.pathname);
    if (!rel) return DEFAULT_NEXT;
    const low = rel.toLowerCase();
    if (
      low === "login.html" ||
      low === "auth.html" ||
      low === "auth-callback.html" ||
      low === "index.html"
    ) {
      return DEFAULT_NEXT;
    }
    return rel;
  }

  function depthBelowAdmin() {
    const rel = pathAfterAdmin(location.pathname);
    if (!rel) return 0;
    return Math.max(0, rel.split("/").filter(Boolean).length - 1);
  }

  function getLoginHref() {
    const d = depthBelowAdmin();
    return (d ? "../".repeat(d) : "./") + "login.html";
  }

  function adminResolve(targetFile) {
    const d = depthBelowAdmin();
    return (d ? "../".repeat(d) : "./") + targetFile;
  }

  function safeNext(next) {
    const n = String(next || "").trim();
    if (!n || n.includes("..")) return DEFAULT_NEXT;
    const low = n.toLowerCase();
    if (low === "login.html" || low === "auth.html" || low === "auth-callback.html") return DEFAULT_NEXT;
    return n;
  }

  /**
   * @param {{ requireSuperAdmin?: boolean }} [options]
   */
  async function ensureSession(options) {
    const opts = options || {};
    if (!window.AdminAuth) {
      console.error("[require-auth] AdminAuth not loaded");
      return false;
    }
    try {
      await window.AdminAuth.bootstrapFromSupabase();
    } catch (e) {
      console.warn("[require-auth] bootstrap", e);
    }
    if (!window.AdminAuth.hasLocalSession()) {
      const login = getLoginHref();
      const next = getNextParam();
      location.replace(`${login}?next=${encodeURIComponent(next)}`);
      return false;
    }
    if (opts.requireSuperAdmin) {
      const me = window.AdminAuth.getLocalSession();
      if (!me || me.role !== "super_admin") {
        alert("僅限超級管理員。");
        location.replace(adminResolve("dashboard.html"));
        return false;
      }
    }
    window.dispatchEvent(new CustomEvent("immba-admin-ready"));
    return true;
  }

  window.AdminRequireAuth = {
    ensureSession,
    getLoginHref,
    getNextParam,
    adminResolve,
    safeNext,
    DEFAULT_NEXT
  };
})();
