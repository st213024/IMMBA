// 後台側欄 v7：不含商品交易平台（賣場為官網 marketplace.html 獨立入口）
(function () {
  function mount() {
    var mountEl = document.getElementById("admin-sidebar-mount");
    if (!mountEl || !window.AdminRequireAuth) return;

    var H = window.AdminRequireAuth.adminResolve.bind(window.AdminRequireAuth);
    var active = document.body.getAttribute("data-admin-page") || "";
    var isSuper = window.AdminAuth && window.AdminAuth.isSuperAdmin && window.AdminAuth.isSuperAdmin();

    var allItems = [
      { id: "dashboard", label: "後台首頁", href: H("dashboard.html"), superOnly: false },
      { id: "news", label: "最新公告管理", href: H("news/index.html"), superOnly: false },
      { id: "teachers", label: "師資介紹管理", href: H("teachers/index.html"), superOnly: false },
      { id: "activities", label: "活動集錦管理", href: H("activities/index.html"), superOnly: false },
      { id: "alumni", label: "校友資料庫", href: H("alumni/index.html"), superOnly: false },
      { id: "admin-users", label: "管理員權限管理", href: H("admin-users.html"), superOnly: true }
    ];

    var items = allItems.filter(function (it) {
      if (it.id === "marketplace") return false;
      return !it.superOnly || isSuper;
    });

    var navHtml = items
      .map(function (it) {
        return (
          '<a href="' +
          it.href +
          '" data-nav="' +
          it.id +
          '"' +
          (it.id === active ? ' aria-current="page"' : "") +
          ">" +
          it.label +
          "</a>"
        );
      })
      .join("");

    var sess = window.AdminAuth && window.AdminAuth.getLocalSession && window.AdminAuth.getLocalSession();
    var roleLabel = "—";
    if (sess && sess.role === "super_admin") roleLabel = "超級管理員";
    else if (sess && sess.role === "admin") roleLabel = "一般管理者";
    else if (sess && sess.role === "viewer") roleLabel = "僅檢視";

    mountEl.innerHTML =
      '<div class="admin-sidebar__brand">' +
      '<div class="admin-sidebar__brand-title">imMBA 網站後台</div>' +
      '<div class="admin-sidebar__brand-sub">' +
      (sess && sess.email ? sess.email + " · " + roleLabel : "統一登入") +
      "</div></div>" +
      '<nav class="admin-sidebar__nav" aria-label="後台選單">' +
      navHtml +
      "</nav>" +
      '<div class="admin-sidebar__footer">' +
      '<a class="admin-sidebar__site" href="' +
      H("../index.html") +
      '">返回官網首頁</a>' +
      '<button type="button" class="admin-sidebar__logout" id="admin-shell-logout">登出</button>' +
      "</div>";

    var logoutBtn = document.getElementById("admin-shell-logout");
    if (logoutBtn && window.AdminAuth) {
      logoutBtn.addEventListener("click", async function () {
        await window.AdminAuth.signOutAdmin();
        location.href = H("login.html");
      });
    }
  }

  window.addEventListener("immba-admin-ready", mount);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
