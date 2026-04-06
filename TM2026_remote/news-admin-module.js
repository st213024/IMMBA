(() => {
  // 資料 schema:
  // {
  //   id: string,
  //   date: string,              // YYYY-MM-DD
  //   titleZh: string,
  //   titleEn: string,
  //   url: string,
  //   status: "draft" | "published",
  //   sortOrder: number,
  //   createdAt: string,
  //   updatedAt: string
  // }

  const STORAGE_KEY = "immba_news_admin_module_v2";

  // Same first-page catalog as https://www.management.fju.edu.tw/subweb/immba/news.php
  const OFFICIAL_NEWS_PHP_ROWS = [
    [3261, "2026-02-09", "TOP (外國學生申請入學) Fall 2026, apply NOW!! (May 1 - May 31) - the second round"],
    [3288, "2026-03-27", "【在巴塞隆納 BGS 領導論壇，預見未來影響力】"],
    [3278, "2026-03-18", "【用同樣的學費，走一段法國的學習歷程】"],
    [3267, "2026-03-11", "【上週末的輔大開箱日，你也來逛校園了嗎？】"],
    [3262, "2026-03-09", "(國際經管-全英MBA) 115碩士招生口試通知"],
    [3256, "2026-03-04", "【為什麼我們能與海外名校展開合作對話？】"],
    [3249, "2026-02-25", "【國際合作版圖再拓展｜即將迎來第一所來自英國的大學】"],
    [3241, "2026-02-11", "【走出去之後，開始用不一樣的角度看世界】"],
    [3237, "2026-02-04", "【在國際經管上課，是什麼感覺？】"],
    [3236, "2026-01-28", "【一個下午在超市：學生的海外學習初體驗】"],
    [2636, "2025-11-18", "(國際經管-全英MBA) 115碩士招生報名：2026/1/6-1/15"],
    [2735, "2025-10-29", "(國際經管-全英MBA) 115甄試招生口試通知"],
    [2689, "2025-09-09", "(國際經管-全英MBA) 115甄試招生報名：2025/10/03-10/20"],
    [3186, "2025-09-08", "你的未來從國際經管imMBA開始-在美國任教的白居諺學長分享"],
    [2985, "2025-08-01", "1+1跨國雙碩士分享：世界很大 給自己生命添加一點養分"],
    [2397, "2025-06-30", "國際經管imMBA跨國雙碩士 在地學習國際化多元體驗"],
    [2192, "2025-04-15", "五年一貫、1+1雙聯碩士，你也可以!!"],
    [2905, "2025-01-30", "管理學院職涯平台-工作職缺"],
    [2147, "2024-12-30", "《踏出舒適圈，探索更多的可能》imMBA跨國雙碩士體驗分享"],
    [2678, "2024-10-29", "(國際經管-全英MBA) 114甄試招生口試通知"]
  ];

  const mockNews = OFFICIAL_NEWS_PHP_ROWS.map(([nid, date, titleZh], i) => ({
    id: `news-${nid}`,
    date,
    titleZh,
    titleEn: "",
    url: `https://www.management.fju.edu.tw/subweb/immba/news-detail.php?NID=${nid}`,
    status: "published",
    sortOrder: i + 1,
    createdAt: `${date}T00:00:00.000Z`,
    updatedAt: `${date}T00:00:00.000Z`
  }));

  const els = {
    tbody: document.getElementById("news-tbody"),
    btnAdd: document.getElementById("btn-add-row"),
    btnSave: document.getElementById("btn-save"),
    errorBox: document.getElementById("error-box"),
    successBox: document.getElementById("success-box"),
    previewList: document.getElementById("preview-list"),
    langZh: document.getElementById("lang-zh"),
    langEn: document.getElementById("lang-en"),
    // html export 已移除
  };

  const state = {
    items: [],
    lang: "zh" // zh | en
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function uid(prefix = "news") {
    return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
  }

  function normalizeUrl(url) {
    return (url || "").trim();
  }

  function isValidUrl(url) {
    const u = normalizeUrl(url);
    if (!u) return false;
    // 基本檢查：http(s) URL
    return /^https?:\/\/.+/i.test(u);
  }

  function validateItems(items) {
    const errors = [];
    items.forEach((item, idx) => {
      const rowPrefix = `第 ${idx + 1} 列：`;
      if (!item.date) errors.push(`${rowPrefix}日期不得為空`);
      const hasZh = (item.titleZh || "").trim().length > 0;
      const hasEn = (item.titleEn || "").trim().length > 0;
      if (!hasZh && !hasEn) errors.push(`${rowPrefix}至少要有中文或英文標題`);
      if (!isValidUrl(item.url)) errors.push(`${rowPrefix}連結網址格式需為有效的 http(s) 連結`);
      if (typeof item.sortOrder !== "number" || Number.isNaN(item.sortOrder)) {
        errors.push(`${rowPrefix}排序必須為數字`);
      }
      if (!item.status || (item.status !== "draft" && item.status !== "published")) {
        errors.push(`${rowPrefix}狀態必須為 draft 或 published`);
      }
    });
    return errors;
  }

  function loadItems() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...mockNews].sort((a, b) => a.sortOrder - b.sortOrder);
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [...mockNews].sort((a, b) => a.sortOrder - b.sortOrder);
      return parsed
        .map((x) => ({
          id: String(x.id || uid("news")),
          date: x.date || "",
          titleZh: x.titleZh || "",
          titleEn: x.titleEn || "",
          url: x.url || "",
          status: x.status === "published" ? "published" : "draft",
          sortOrder: Number(x.sortOrder || 0),
          createdAt: x.createdAt || nowIso(),
          updatedAt: x.updatedAt || nowIso()
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
    } catch {
      return [...mockNews].sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }

  function persistItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function normalizeSortOrders(items) {
    // 讓 sortOrder 與陣列排序保持一致，避免顯示/預覽不一致
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    items.forEach((it, i) => {
      it.sortOrder = i + 1;
    });
    return items;
  }

  function showError(message) {
    els.errorBox.style.display = "block";
    els.errorBox.innerHTML = message;
    els.successBox.style.display = "none";
  }

  function showSuccess(message) {
    els.successBox.style.display = "block";
    els.successBox.textContent = message;
    els.errorBox.style.display = "none";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function NewsAdminTable() {
    function renderRow(item) {
      const statusText = item.status === "published" ? "published" : "draft";
      return `
        <tr data-id="${escapeHtml(item.id)}">
          <td>
            <input class="cell-input" type="date" data-field="date" data-id="${escapeHtml(item.id)}" value="${escapeHtml(item.date)}" />
          </td>
          <td>
            <input class="cell-input" type="text" data-field="titleZh" data-id="${escapeHtml(item.id)}" value="${escapeHtml(item.titleZh)}" placeholder="中文標題" />
          </td>
          <td>
            <input class="cell-input" type="text" data-field="titleEn" data-id="${escapeHtml(item.id)}" value="${escapeHtml(item.titleEn)}" placeholder="英文標題" />
          </td>
          <td>
            <input class="cell-input" type="text" data-field="url" data-id="${escapeHtml(item.id)}" value="${escapeHtml(item.url)}" placeholder="https://..." />
          </td>
          <td>
            <select class="cell-input" data-field="status" data-id="${escapeHtml(item.id)}">
              <option value="draft" ${statusText === "draft" ? "selected" : ""}>draft</option>
              <option value="published" ${statusText === "published" ? "selected" : ""}>published</option>
            </select>
          </td>
          <td>
            <input class="cell-input" type="number" data-field="sortOrder" data-id="${escapeHtml(item.id)}" value="${escapeHtml(item.sortOrder)}" />
          </td>
          <td>
            <div class="op-row">
              <button class="op-btn" type="button" data-action="moveUp" data-id="${escapeHtml(item.id)}">上移</button>
              <button class="op-btn" type="button" data-action="moveDown" data-id="${escapeHtml(item.id)}">下移</button>
              <button class="op-btn danger" type="button" data-action="delete" data-id="${escapeHtml(item.id)}">刪除</button>
            </div>
          </td>
        </tr>
      `;
    }

    function render() {
      if (!els.tbody) return;
      els.tbody.innerHTML = state.items
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((it) => renderRow(it))
        .join("");
      // 預覽也跟著更新
      NewsPreviewList();
    }

    // input 直接更新 state（不儲存到 localStorage，等按「儲存」才寫入）
    els.tbody.addEventListener("input", (e) => {
      const target = e.target;
      if (!target || !(target instanceof HTMLElement)) return;
      const field = target.getAttribute("data-field");
      const id = target.getAttribute("data-id");
      if (!field || !id) return;
      const item = state.items.find((x) => x.id === id);
      if (!item) return;

      if (field === "sortOrder") {
        item.sortOrder = Number(target.value);
      } else if (field === "status") {
        item.status = target.value === "published" ? "published" : "draft";
      } else {
        item[field] = target.value;
      }
      NewsPreviewList();
    });

    els.tbody.addEventListener("change", (e) => {
      const target = e.target;
      if (!target || !(target instanceof HTMLElement)) return;
      const field = target.getAttribute("data-field");
      const id = target.getAttribute("data-id");
      if (!field || !id) return;
      const item = state.items.find((x) => x.id === id);
      if (!item) return;

      if (field === "status") item.status = target.value === "published" ? "published" : "draft";
      NewsPreviewList();
    });

    // 操作按鈕
    els.tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      const idx = state.items.findIndex((x) => x.id === id);
      if (idx < 0) return;

      // 以 sortOrder 排序後的索引為準做交換
      const sorted = [...state.items].sort((a, b) => a.sortOrder - b.sortOrder);
      const sortedIdx = sorted.findIndex((x) => x.id === id);
      if (sortedIdx < 0) return;

      if (action === "delete") {
        if (!confirm("確定刪除此公告？")) return;
        state.items = state.items.filter((x) => x.id !== id);
        NewsAdminTable_render();
        return;
      }

      if (action === "moveUp") {
        if (sortedIdx <= 0) return;
        const tmp = sorted[sortedIdx - 1];
        sorted[sortedIdx - 1] = sorted[sortedIdx];
        sorted[sortedIdx] = tmp;
        state.items = normalizeSortOrders(sorted);
        NewsAdminTable_render();
      }

      if (action === "moveDown") {
        if (sortedIdx >= sorted.length - 1) return;
        const tmp = sorted[sortedIdx + 1];
        sorted[sortedIdx + 1] = sorted[sortedIdx];
        sorted[sortedIdx] = tmp;
        state.items = normalizeSortOrders(sorted);
        NewsAdminTable_render();
      }
    });

    function NewsAdminTable_render() {
      render();
    }

    return {
      render: NewsAdminTable_render
    };
  }

  function NewsPreviewList() {
    if (!els.previewList) return;
    const published = [...state.items]
      .filter((x) => x.status === "published")
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (!published.length) {
      els.previewList.innerHTML = `<div style="padding:14px;color:var(--muted);font-size:14px;">目前沒有已發布的公告。</div>`;
      return;
    }

    const langField = state.lang === "en" ? "titleEn" : "titleZh";
    els.previewList.innerHTML = published
      .map((it) => {
        const title = it[langField] || it.titleZh || it.titleEn || "";
        const url = normalizeUrl(it.url);
        const safeTitle = escapeHtml(title);
        const safeDate = escapeHtml(it.date);
        const safeUrl = escapeHtml(url);
        const link = safeUrl ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>` : safeTitle;
        return `
          <div class="preview-item">
            <div class="preview-date">${safeDate}</div>
            <div class="preview-title">${link}</div>
          </div>
        `;
      })
      .join("");
  }

  function NewsPreviewInit() {
    els.langZh?.addEventListener("click", () => {
      state.lang = "zh";
      els.langZh.classList.remove("secondary");
      els.langEn.classList.add("secondary");
      NewsPreviewList();
    });
    els.langEn?.addEventListener("click", () => {
      state.lang = "en";
      els.langEn.classList.remove("secondary");
      els.langZh.classList.add("secondary");
      NewsPreviewList();
    });

    // 初始按鈕樣式
    els.langZh?.classList.remove("secondary");
  }

  function init() {
    state.items = loadItems();

    console.log("[news-admin-module] loaded items:", state.items);

    if (!els.tbody) return;

    const table = NewsAdminTable();
    table.render();
    NewsPreviewInit();

    els.btnAdd?.addEventListener("click", () => {
      const maxOrder = state.items.reduce((m, x) => Math.max(m, Number(x.sortOrder) || 0), 0);
      const item = {
        id: uid("news"),
        date: "",
        titleZh: "",
        titleEn: "",
        url: "",
        status: "draft",
        sortOrder: maxOrder + 1,
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      state.items.push(item);
      state.items = normalizeSortOrders(state.items);
      showSuccess("");
      showError("");
      table.render();
    });

    els.btnSave?.addEventListener("click", async () => {
      try {
        console.log("[news-admin-module] save clicked, items:", state.items);

        // 先做驗證
        const errors = validateItems(state.items);
        if (errors.length) {
          showError(
            `<div style="font-weight:900;margin-bottom:6px;">儲存失敗，請修正以下問題：</div>` +
            `<ul style="margin-left:18px;line-height:1.6;">${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>`
          );
          console.warn("[news-admin-module] validation errors:", errors);
          return;
        }

        // 更新 updatedAt 並寫入 localStorage
        const ts = nowIso();
        state.items = state.items.map((x) => ({
          ...x,
          updatedAt: ts,
          // sortOrder 與陣列保持一致
          sortOrder: Number(x.sortOrder)
        }));

        state.items = normalizeSortOrders(state.items);
        persistItems(state.items);

        console.log("[news-admin-module] saved items persisted:", state.items);
        showError("");
        showSuccess("公告已儲存，預覽已更新。");
        NewsPreviewList();
      } catch (err) {
        console.error("[news-admin-module] save error:", err);
        showError(`儲存失敗：${err?.message || "未知錯誤"}`);
      }
    });
  }

  init();
})();

