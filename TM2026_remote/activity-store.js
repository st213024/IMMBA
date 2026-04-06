// Activity highlights data store (CRUD) for front-end sync.
// Persists to localStorage, and overwrites window.activityPages.activities after normalization.
//
// New / 編輯 writes always start from getItemsForMutation() (= merged: localStorage + bundled
// defaults). saveItem must never shrink the set of idx without going through removeItemByIdx.
(function () {
  const STORAGE_KEY = "immba_activity_items_v1";
  const REMOVED_DEFAULTS_KEY = "immba_activity_removed_defaults_v1";
  // Reuse the same auth flag as news-admin pages for consistency.
  const AUTH_KEY = "immba_admin_auth_v1";

  /** Immutable copy of activity-pages.js list, captured before any seed/mutation of window.activityPages. */
  let bundledDefaultsSnapshot = [];
  (function captureBundledSnapshot() {
    const a = window.activityPages?.activities;
    if (!Array.isArray(a)) {
      bundledDefaultsSnapshot = [];
      return;
    }
    try {
      bundledDefaultsSnapshot = JSON.parse(JSON.stringify(a));
    } catch {
      bundledDefaultsSnapshot = [];
    }
  })();

  function getBundledDefaults() {
    return bundledDefaultsSnapshot;
  }

  function readRemovedBundledIdxSet() {
    try {
      const raw = localStorage.getItem(REMOVED_DEFAULTS_KEY);
      if (!raw) return new Set();
      const a = JSON.parse(raw);
      if (!Array.isArray(a)) return new Set();
      return new Set(a.map(Number).filter((n) => Number.isFinite(n)));
    } catch {
      return new Set();
    }
  }

  function writeRemovedBundledIdxSet(set) {
    localStorage.setItem(REMOVED_DEFAULTS_KEY, JSON.stringify([...set].sort((x, y) => x - y)));
  }

  function normalizeText(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function normalizeParagraphs(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((x) => normalizeText(x)).filter(Boolean);
    if (typeof value !== "string") return [];

    const s = value.replace(/\r\n/g, "\n").trim();
    if (!s) return [];

    // Split by blank lines; if not present, fall back to single line splitting.
    const hasBlankLine = /\n\s*\n/.test(s);
    const parts = hasBlankLine ? s.split(/\n\s*\n+/) : s.split(/\n+/);
    return parts.map((x) => x.trim()).filter(Boolean);
  }

  function paragraphsToSummary(paragraphs, maxLen) {
    const text = (Array.isArray(paragraphs) ? paragraphs.join(" ") : "")
      .replace(/\s+/g, " ")
      .trim();
    if (maxLen && text.length > maxLen) return text.slice(0, maxLen).trim();
    return text;
  }

  function normalizeCaption(value) {
    // Store as HTML-safe string (simple line breaks -> <br/>)
    if (value === null || value === undefined) return "";
    const s = String(value);
    return s.replace(/\r\n/g, "\n").replace(/\n/g, "<br/>").trim();
  }

  function normalizeStatus(value) {
    const s = normalizeText(value).toLowerCase();
    if (s === "published") return "published";
    if (s === "draft") return "draft";
    // Backward compat: treat anything truthy as published
    return value === true || value === 1 || value === "1" ? "published" : "published";
  }

  function normalizeItem(item) {
    const now = new Date().toISOString();
    const idxNum = Number(item.idx);
    const idx = Number.isFinite(idxNum) ? idxNum : 0;

    // Support both new schema (titleZh/summaryZh/contentZh) and old schema (title/paragraphs).
    const titleZh = normalizeText(item.titleZh ?? item.title ?? "");
    const titleEn = normalizeText(item.titleEn ?? item.titleZh ?? item.title ?? "");

    const contentZh = normalizeParagraphs(item.contentZh ?? item.content ?? item.paragraphs ?? "");
    const contentEn = normalizeParagraphs(item.contentEn ?? item.paragraphsEn ?? "");

    // If admin didn't provide summaries, derive from full content.
    const summaryZhRaw = normalizeText(item.summaryZh ?? "");
    const summaryEnRaw = normalizeText(item.summaryEn ?? "");
    const summaryZh = summaryZhRaw || paragraphsToSummary(contentZh);
    const summaryEn = summaryEnRaw || paragraphsToSummary(contentEn);

    const dateZh = normalizeText(item.date ?? item.dateZh ?? "");
    const dateEn = normalizeText(item.dateEn ?? item.dateEnZh ?? item.dateEn ?? item.date ?? dateZh);

    const imageUrl = normalizeText(item.imageUrl ?? item.imageSrc ?? item.image ?? "");
    const imageCaptionZh = normalizeCaption(item.imageCaptionZh ?? item.caption ?? "");
    const imageCaptionEn = normalizeCaption(item.imageCaptionEn ?? item.captionEn ?? item.imageCaptionZh ?? item.caption ?? "");

    const status = normalizeStatus(item.status ?? item.is_published ?? item.published);

    const sortOrder = Number(item.sort_order ?? item.sortOrder ?? idx);

    // Compatibility fields for existing front-end renderers.
    return {
      idx,
      status,
      sort_order: sortOrder,
      date: dateZh,
      dateEn,
      titleZh,
      titleEn,
      summaryZh,
      summaryEn,
      contentZh,
      contentEn,
      imageUrl,
      imageCaptionZh,
      imageCaptionEn,

      // Old names (kept so existing scripts still work)
      title: titleZh,
      imageSrc: imageUrl,
      caption: imageCaptionZh,
      captionEn: imageCaptionEn,
      paragraphs: contentZh,
      paragraphsEn: contentEn,
      created_at: item.created_at || now,
      updated_at: item.updated_at || now
    };
  }

  function safeParseJson(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function readStoredRaw() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = safeParseJson(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  }

  function writeStored(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      // Usually quota exceeded.
      const msg = err?.message || "localStorage write failed";
      throw new Error("儲存活動失敗：" + msg);
    }
  }

  /**
   * Stored rows win on idx collision; any bundled idx missing from storage is re-filled from
   * activity-pages.js snapshot (unless user removed that bundled row in admin).
   */
  function readMergedRaw() {
    const stored = readStoredRaw();
    const defaults = getBundledDefaults();
    const skipBundled = readRemovedBundledIdxSet();
    const byIdx = new Map();

    for (const item of stored) {
      const idx = Number(item?.idx);
      if (Number.isFinite(idx)) byIdx.set(idx, item);
    }

    if (Array.isArray(defaults)) {
      for (const def of defaults) {
        const idx = Number(def.idx);
        if (!Number.isFinite(idx) || skipBundled.has(idx)) continue;
        if (!byIdx.has(idx)) {
          try {
            byIdx.set(idx, JSON.parse(JSON.stringify(def)));
          } catch {
            byIdx.set(idx, { ...def });
          }
        }
      }
    }

    return Array.from(byIdx.values());
  }

  function cloneMergedForMutation() {
    const arr = readMergedRaw();
    try {
      return JSON.parse(JSON.stringify(arr));
    } catch {
      return [];
    }
  }

  function getItemsForMutation() {
    return cloneMergedForMutation();
  }

  function listAll() {
    return readMergedRaw()
      .map(normalizeItem)
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order) || Number(a.idx) - Number(b.idx));
  }

  function listRawAll() {
    return readMergedRaw()
      .slice()
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || Number(a.idx) - Number(b.idx));
  }

  function listPublished() {
    return listAll().filter((x) => x.status === "published");
  }

  function getByIdx(idx) {
    const idxNum = Number(idx);
    if (!Number.isFinite(idxNum)) return null;
    return listAll().find((x) => Number(x.idx) === idxNum) || null;
  }

  function saveItem(partial) {
    const items = getItemsForMutation();
    const keysBefore = new Set(
      items.map((x) => Number(x.idx)).filter((n) => Number.isFinite(n))
    );

    const normalized = normalizeItem(partial);
    const idx = normalized.idx;
    if (!Number.isFinite(idx)) {
      throw new Error("活動編號無效，請重新整理頁面後再試。");
    }

    const pos = items.findIndex((x) => Number(x.idx) === idx);
    const now = new Date().toISOString();
    normalized.updated_at = now;
    if (pos >= 0) {
      normalized.created_at = items[pos].created_at || normalized.created_at;
      items[pos] = normalized;
    } else {
      normalized.created_at = normalized.created_at || now;
      items.push(normalized);
    }

    const keysAfter = new Set(
      items.map((x) => Number(x.idx)).filter((n) => Number.isFinite(n))
    );
    for (const k of keysBefore) {
      if (!keysAfter.has(k)) {
        throw new Error("儲存異常：偵測到可能遺失既有活動，已中止寫入以避免資料被覆蓋。請重新整理後再試。");
      }
    }

    writeStored(items.map(normalizeItem));
    // Keep window.activityPages synced.
    if (window.activityPages) window.activityPages.activities = listAll();
    return normalized;
  }

  function removeItemByIdx(idx) {
    const idxNum = Number(idx);
    const defaults = getBundledDefaults();
    const wasBundled = Array.isArray(defaults) && defaults.some((d) => Number(d.idx) === idxNum);

    const items = getItemsForMutation();
    const next = items.filter((x) => Number(x.idx) !== idxNum);
    writeStored(next.map(normalizeItem));

    if (wasBundled) {
      const skip = readRemovedBundledIdxSet();
      skip.add(idxNum);
      writeRemovedBundledIdxSet(skip);
    }

    if (window.activityPages) window.activityPages.activities = listAll();
  }

  function login(username, password) {
    const ok = String(username ?? "").trim() === "admin" && String(password ?? "") === "immba1234";
    localStorage.setItem(AUTH_KEY, ok ? "1" : "0");
    return ok;
  }

  function logout() {
    localStorage.setItem(AUTH_KEY, "0");
  }

  function isAuthed() {
    return localStorage.getItem(AUTH_KEY) === "1";
  }

  function seedOverrideToPages() {
    const base = readMergedRaw();
    if (!window.activityPages) window.activityPages = { activities: [] };
    window.activityPages.activities = base.map(normalizeItem);
  }

  /** Remove saved overrides so list falls back to bundled 活動集錦 (activity-pages.js). */
  function resetToBundledActivities() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(REMOVED_DEFAULTS_KEY);
    } catch (e) {
      /* ignore */
    }
    seedOverrideToPages();
  }

  // Apply override before any rendering scripts execute.
  seedOverrideToPages();

  window.ActivityStore = {
    STORAGE_KEY,
    listAll,
    listPublished,
    listRawAll,
    getByIdx,
    saveItem,
    removeItemByIdx,
    resetToBundledActivities,
    login,
    logout,
    isAuthed
  };
})();
