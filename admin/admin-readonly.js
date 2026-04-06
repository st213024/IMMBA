/**
 * viewer 角色：鎖定主內容區表單，側欄導覽仍可點。
 */
(function () {
  window.ImmbaAdminReadonly = {
    applyIfViewer(mainSelector) {
      var s = window.AdminAuth && window.AdminAuth.getLocalSession && window.AdminAuth.getLocalSession();
      if (!s || s.role !== "viewer") return;
      var main = document.querySelector(mainSelector);
      if (!main) return;
      var bar = document.createElement("div");
      bar.className = "immba-readonly-banner";
      bar.setAttribute("role", "status");
      bar.textContent =
        "您目前為「僅檢視」權限。無法新增、修改或刪除內容；請聯絡超級管理員將您的角色調整為「一般管理者」。";
      bar.style.cssText =
        "margin-bottom:14px;padding:12px 14px;border-radius:10px;background:#fff8e6;border:1px solid #e8c96a;color:#5c4a1a;font-size:14px;line-height:1.55;";
      main.insertBefore(bar, main.firstChild);
      main.querySelectorAll("button, textarea, input, select").forEach(function (el) {
        el.disabled = true;
      });
    }
  };
})();
