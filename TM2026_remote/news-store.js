(() => {
  // Bump when replacing default catalog (sync with official first page).
  const STORAGE_KEY = "immba_news_items_v2";
  const AUTH_KEY = "immba_admin_auth_v1";

  // Source order & NIDs: https://www.management.fju.edu.tw/subweb/immba/news.php (2026-03)
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

  const OFFICIAL_DETAIL_BASE = "https://www.management.fju.edu.tw/subweb/immba/news-detail.php?NID=";

  const defaultNews = OFFICIAL_NEWS_PHP_ROWS.map(([nid, date, title], i) => ({
    id: `n-${nid}`,
    title,
    date,
    external_url: `${OFFICIAL_DETAIL_BASE}${nid}`,
    content:
      "完整公告內容請點選「外部連結」前往輔仁大學國際經管 imMBA 官方網站，或於首頁／公告列表開啟對應 news-detail 頁面。",
    image_url: "",
    sort_order: i + 1,
    status: "published",
    is_published: true,
    created_at: `${date}T00:00:00.000Z`,
    updated_at: `${date}T00:00:00.000Z`,
    image_name: ""
  }));

  function normalizeDate(value) {
    if (!value) return "";
    return String(value).trim().replace(/\//g, "-");
  }

  function isLikelyBase64Image(url) {
    return typeof url === "string" && url.startsWith("data:image/");
  }

  function sanitizeStoredItems(items) {
    // 避免 localStorage 被 base64 圖片吃爆 quota（舊資料可能已經塞了 data:...）
    return items.map((item) => {
      if (!item || typeof item !== "object") return item;
      const next = { ...item };
      if (isLikelyBase64Image(next.image_url)) next.image_url = "";
      if (isLikelyBase64Image(next.cover_image)) next.cover_image = "";
      if (isLikelyBase64Image(next.imageData)) next.imageData = "";
      return next;
    });
  }

  function normalizeItem(item) {
    const now = new Date().toISOString();
    const status = item.status === "published" ? "published" : "draft";
    const imageUrl = item.image_url || item.cover_image || "";
    return {
      id: item.id || `n-${Date.now()}`,
      title: item.title || "",
      date: normalizeDate(item.date),
      content: item.content || "",
      external_url: item.external_url || "",
      image_url: imageUrl,
      image_name: item.image_name || "",
      sort_order: Number(item.sort_order || 0),
      status,
      is_published: status === "published" || Boolean(item.is_published),
      created_at: item.created_at || now,
      updated_at: item.updated_at || now
    };
  }

  function read() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultNews.map(normalizeItem);
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return defaultNews.map(normalizeItem);
      const sanitized = sanitizeStoredItems(parsed);
      // 如果舊資料含 base64，嘗試寫回較小版本釋放 quota
      if (sanitized.some((x, i) => JSON.stringify(x) !== JSON.stringify(parsed[i]))) {
        try {
          write(sanitized);
        } catch (e) {
          // 釋放失敗也沒關係，至少 UI 用 sanitized 先跑起來
          console.warn("[news-store] sanitize write failed:", e?.message || e);
        }
      }
      return sanitized.map(normalizeItem);
    } catch {
      return defaultNews.map(normalizeItem);
    }
  }

  function write(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      if (err && (err.name === "QuotaExceededError" || String(err).toLowerCase().includes("quota"))) {
        throw new Error("儲存失敗：儲存空間不足（圖片可能過大）。");
      }
      throw err;
    }
  }

  function seedIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEY)) write(defaultNews.map(normalizeItem));
  }

  function listAll() {
    return read().sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  }

  function listPublished() {
    return listAll().filter((item) => item.status === "published" || Boolean(item.is_published));
  }

  function saveItem(item) {
    const items = read();
    const normalizedItem = normalizeItem(item);
    const idx = items.findIndex((x) => x.id === normalizedItem.id);
    normalizedItem.updated_at = new Date().toISOString();
    if (idx >= 0) {
      normalizedItem.created_at = items[idx].created_at || normalizedItem.created_at;
      items[idx] = normalizedItem;
    }
    else items.push(normalizedItem);
    write(items);
    return normalizedItem;
  }

  function getById(id) {
    return read().find((item) => item.id === id) || null;
  }

  function removeItem(id) {
    const items = read().filter((item) => item.id !== id);
    write(items);
  }

  function login(username, password) {
    const ok = username === "admin" && password === "immba1234";
    localStorage.setItem(AUTH_KEY, ok ? "1" : "0");
    return ok;
  }

  function logout() {
    localStorage.setItem(AUTH_KEY, "0");
  }

  function isAuthed() {
    return localStorage.getItem(AUTH_KEY) === "1";
  }

  seedIfEmpty();

  window.NewsStore = {
    STORAGE_KEY,
    seedIfEmpty,
    listAll,
    listPublished,
    getById,
    saveItem,
    removeItem,
    login,
    logout,
    isAuthed
  };
})();
