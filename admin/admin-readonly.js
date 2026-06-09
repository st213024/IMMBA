/**
 * viewer 角色：鎖定主內容區表單與操作按鈕；側欄導覽仍可點。
 * 動態渲染的列表按鈕（編輯／刪除）亦會透過 MutationObserver 與事件攔截處理。
 */
(function () {
  var STYLE_ID = "immba-readonly-style";
  var ACTION_SELECTOR =
    ".edit-btn, .del-btn, .btn-edit, .btn-del, .js-edit, .js-del, #save-draft-btn, #publish-btn, #save-btn, #new-btn, #importBtn, #export-btn, #exportCsvBtn, #reset-bundled-btn, #reset-form-btn, #reset-form, #clear-btn, #import-btn, #export-btn";

  function isViewer() {
    if (window.AdminAuth && typeof window.AdminAuth.isContentReadOnly === "function") {
      return window.AdminAuth.isContentReadOnly();
    }
    var s = window.AdminAuth && window.AdminAuth.getLocalSession && window.AdminAuth.getLocalSession();
    return Boolean(s && s.role === "viewer");
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      ".immba-readonly-mode button{display:none!important;}" +
      ".immba-readonly-mode input:not([type='hidden'])," +
      ".immba-readonly-mode textarea," +
      ".immba-readonly-mode select," +
      ".immba-readonly-mode input[type='file']{pointer-events:none!important;opacity:.55!important;}" +
      ".immba-readonly-mode " +
      ACTION_SELECTOR.replace(/,/g, ",.immba-readonly-mode ") +
      "{display:none!important;}";
    document.head.appendChild(style);
  }

  function lockControl(el) {
    if (!el || el.closest(".admin-sidebar")) return;
    var tag = (el.tagName || "").toLowerCase();
    if (tag === "button" || tag === "textarea" || tag === "select") {
      el.disabled = true;
    } else if (tag === "input") {
      var type = String(el.type || "").toLowerCase();
      if (type !== "hidden") el.disabled = true;
    }
  }

  function hideActions(root) {
    root.querySelectorAll("button").forEach(function (el) {
      if (el.closest(".admin-sidebar")) return;
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
      el.disabled = true;
    });
    root.querySelectorAll(ACTION_SELECTOR).forEach(function (el) {
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
      if (el.tagName === "BUTTON") el.disabled = true;
    });
  }

  function lockTree(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll("button, textarea, input, select").forEach(lockControl);
    hideActions(root);
  }

  function attachClickBlocker(main) {
    if (!main || main._immbaReadonlyClickBlock) return;
    main._immbaReadonlyClickBlock = true;
    main.addEventListener(
      "click",
      function (ev) {
        if (!isViewer()) return;
        if (ev.target.closest(".admin-sidebar")) return;
        var blocked = ev.target.closest(
          "button, a.btn, input[type='file'], .edit-btn, .del-btn, .btn-edit, .btn-del, .js-edit, .js-del"
        );
        if (blocked) {
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
        }
      },
      true
    );
  }

  function attachObserver(main) {
    if (!main || main._immbaReadonlyObserver) return;
    var obs = new MutationObserver(function (mutations) {
      if (!isViewer()) return;
      mutations.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes || [], function (node) {
          if (!node || node.nodeType !== 1) return;
          lockTree(node);
        });
      });
    });
    obs.observe(main, { childList: true, subtree: true });
    main._immbaReadonlyObserver = obs;
  }

  function showBanner(main) {
    if (!main || main.querySelector(".immba-readonly-banner")) return;
    var bar = document.createElement("div");
    bar.className = "immba-readonly-banner";
    bar.setAttribute("role", "status");
    bar.textContent =
      "您目前為「僅檢視」權限。無法新增、修改或刪除內容；請聯絡超級管理員將您的角色調整為「一般管理者」。";
    bar.style.cssText =
      "margin-bottom:14px;padding:12px 14px;border-radius:10px;background:#fff8e6;border:1px solid #e8c96a;color:#5c4a1a;font-size:14px;line-height:1.55;";
    main.insertBefore(bar, main.firstChild);
  }

  function applyIfViewer(mainSelector) {
    if (!isViewer()) return;
    var main = document.querySelector(mainSelector);
    if (!main) return;
    ensureStyle();
    main.classList.add("immba-readonly-mode");
    showBanner(main);
    lockTree(main);
    attachClickBlocker(main);
    attachObserver(main);
  }

  function refresh(mainSelector) {
    if (!isViewer()) return;
    applyIfViewer(mainSelector);
  }

  function assertCanEdit() {
    if (isViewer()) {
      throw new Error("僅檢視權限，無法執行此操作。");
    }
  }

  window.ImmbaAdminReadonly = {
    isViewer: isViewer,
    applyIfViewer: applyIfViewer,
    refresh: refresh,
    assertCanEdit: assertCanEdit
  };
})();
