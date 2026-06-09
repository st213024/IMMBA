// Activity highlights data store (CRUD) for front-end sync.
// Persists to localStorage, and overwrites window.activityPages.activities after normalization.
//
// New / 編輯 writes always start from getItemsForMutation() (= merged: localStorage + bundled
// defaults). saveItem must never shrink the set of idx without going through removeItemByIdx.
(function () {
  const STORAGE_KEY = "immba_activity_items_v1";
  const REMOVED_DEFAULTS_KEY = "immba_activity_removed_defaults_v1";
  const IMAGES_KEY = "immba_activity_images_v1";
  const IMAGE_REF_PREFIX = "activityimg:";
  const DEFAULT_ACTIVITY_FALLBACK =
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80";

  function isLikelyBase64Image(url) {
    return typeof url === "string" && url.startsWith("data:image/");
  }

  function readImageMap() {
    try {
      const parsed = JSON.parse(localStorage.getItem(IMAGES_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeImageMap(map) {
    try {
      localStorage.setItem(IMAGES_KEY, JSON.stringify(map));
    } catch (err) {
      if (err && (err.name === "QuotaExceededError" || String(err).toLowerCase().includes("quota"))) {
        throw new Error("圖片儲存空間不足，請改用較小的圖片後再試。");
      }
      throw err;
    }
  }

  function attachImage(activityIdx, dataUrl) {
    const id = String(activityIdx ?? "").trim();
    if (!id || !Number.isFinite(Number(id)) || !isLikelyBase64Image(dataUrl)) return "";
    const map = readImageMap();
    map[id] = dataUrl;
    writeImageMap(map);
    return `${IMAGE_REF_PREFIX}${id}`;
  }

  function imageRefExists(ref) {
    const url = String(ref || "").trim();
    if (!url.startsWith(IMAGE_REF_PREFIX)) return false;
    const id = url.slice(IMAGE_REF_PREFIX.length);
    return Boolean(readImageMap()[id]);
  }

  function resolveImageUrl(raw) {
    const url = String(raw || "").trim();
    if (!url) return "";
    if (url.startsWith(IMAGE_REF_PREFIX)) {
      const id = url.slice(IMAGE_REF_PREFIX.length);
      return readImageMap()[id] || "";
    }
    if (url.startsWith("blob:")) return "";
    if (isLikelyBase64Image(url)) return url;
    return url;
  }

  function getDisplayImageUrl(raw, fallback) {
    const resolved = resolveImageUrl(raw);
    if (resolved) return resolved;
    return fallback || DEFAULT_ACTIVITY_FALLBACK;
  }

  function applyActivityImage(img, raw, fallback) {
    if (!img) return;
    const fb = fallback || DEFAULT_ACTIVITY_FALLBACK;
    const resolved = resolveImageUrl(raw);
    const chain = resolved ? [resolved, fb] : [fb];
    let step = 0;
    const loadNext = () => {
      if (step >= chain.length) {
        img.onerror = null;
        return;
      }
      img.src = chain[step++];
    };
    img.onload = () => {
      img.onerror = null;
    };
    img.onerror = () => loadNext();
    loadNext();
  }

  function persistImageUrl(activityIdx, imageUrl, prevUrl) {
    const id = String(activityIdx ?? "").trim();
    const incoming = String(imageUrl || "").trim();
    const prev = String(prevUrl || "").trim();
    if (incoming) {
      if (incoming.startsWith(IMAGE_REF_PREFIX)) {
        const refId = incoming.slice(IMAGE_REF_PREFIX.length);
        const map = readImageMap();
        if (refId !== id && map[refId] && id) {
          return attachImage(id, map[refId]);
        }
        if (refId === id && map[refId]) return incoming;
        return imageRefExists(incoming) ? incoming : prev || "";
      }
      if (isLikelyBase64Image(incoming)) {
        const ref = attachImage(id, incoming);
        if (!ref) throw new Error("圖片儲存失敗，請重新上傳。");
        return ref;
      }
      if (incoming.startsWith("blob:")) return prev || "";
      if (/^https?:\/\//i.test(incoming) || incoming.startsWith("images/")) return incoming;
      return prev || "";
    }
    if (prev) return prev;
    return "";
  }

  function removeImage(activityIdx) {
    const map = readImageMap();
    const key = String(activityIdx ?? "").trim();
    if (!map[key]) return;
    delete map[key];
    writeImageMap(map);
  }

  function sanitizeActivityImages(items) {
    const map = readImageMap();
    let mapChanged = false;
    const next = items.map((item) => {
      if (!item || typeof item !== "object") return item;
      const row = { ...item };
      const raw = String(row.imageUrl ?? row.imageSrc ?? row.image ?? "").trim();
      const idx = String(row.idx ?? "").trim();
      if (isLikelyBase64Image(raw) && idx) {
        if (!map[idx]) {
          map[idx] = raw;
          mapChanged = true;
        }
        row.imageUrl = `${IMAGE_REF_PREFIX}${idx}`;
        row.imageSrc = row.imageUrl;
      } else if (raw.startsWith("blob:")) {
        row.imageUrl = "";
        row.imageSrc = "";
      }
      return row;
    });
    if (mapChanged) {
      try {
        writeImageMap(map);
      } catch (e) {
        console.warn("ActivityStore image map write failed", e);
      }
    }
    return next;
  }
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

  function asPinnedFlag(value) {
    if (value === true || value === 1 || value === "1" || value === "true" || value === "on") return true;
    if (value === false || value === 0 || value === "0" || value === "false" || value === "" || value == null) {
      return false;
    }
    return Boolean(value);
  }

  function isPublishedItem(item) {
    return item?.status === "published";
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
      pinned: asPinnedFlag(item.pinned),
      pinned_at: item.pinned_at || "",
      pinned_order: Number(item.pinned_order || 0),
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
    return sanitizeActivityImages(parsed);
  }

  function bundledIdxSet() {
    return new Set(
      getBundledDefaults()
        .map((d) => Number(d.idx))
        .filter((n) => Number.isFinite(n))
    );
  }

  function itemDiffersFromBundled(item) {
    const idx = Number(item?.idx);
    if (!Number.isFinite(idx)) return false;
    const def = getBundledDefaults().find((d) => Number(d.idx) === idx);
    if (!def) return true;
    const a = normalizeItem(item);
    const b = normalizeItem(def);
    return (
      a.status !== b.status ||
      Number(a.sort_order) !== Number(b.sort_order) ||
      a.pinned !== b.pinned ||
      Number(a.pinned_order) !== Number(b.pinned_order) ||
      a.titleZh !== b.titleZh ||
      a.titleEn !== b.titleEn ||
      a.date !== b.date ||
      a.imageUrl !== b.imageUrl ||
      JSON.stringify(a.contentZh) !== JSON.stringify(b.contentZh) ||
      JSON.stringify(a.contentEn) !== JSON.stringify(b.contentEn)
    );
  }

  /** Persist only overrides (custom rows + modified bundled rows), not the full bundled catalog. */
  function persistOverrides(merged) {
    const removed = readRemovedBundledIdxSet();
    const bundled = bundledIdxSet();
    const toStore = [];
    for (const item of merged) {
      const idx = Number(item?.idx);
      if (!Number.isFinite(idx) || removed.has(idx)) continue;
      if (!bundled.has(idx) || itemDiffersFromBundled(item)) {
        toStore.push(normalizeItem(item));
      }
    }
    writeStored(toStore);
  }

  function allocateActivityIdx() {
    const used = new Set();
    readMergedRaw().forEach((item) => {
      const n = Number(item?.idx);
      if (Number.isFinite(n)) used.add(n);
    });
    let candidate = 0;
    while (used.has(candidate)) candidate += 1;
    return candidate;
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

  function compareForDisplay(a, b) {
    const aPub = a.status === "published";
    const bPub = b.status === "published";
    if (aPub && bPub) {
      const orderDiff = Number(a.sort_order) - Number(b.sort_order);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.updated_at || b.date || 0) - new Date(a.updated_at || a.date || 0);
    }
    if (aPub !== bPub) return aPub ? -1 : 1;
    return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
  }

  function promotePinnedToTop(items, pinnedIdx) {
    const now = new Date().toISOString();
    const target = items.find((it) => Number(it.idx) === Number(pinnedIdx));
    if (!target || !isPublishedItem(target)) return;
    target.pinned = true;
    target.pinned_at = now;

    const otherPinned = items
      .filter((it) => isPublishedItem(it) && asPinnedFlag(it.pinned) && Number(it.idx) !== Number(pinnedIdx))
      .sort((a, b) => {
        const orderDiff = Number(a.pinned_order) - Number(b.pinned_order);
        if (orderDiff !== 0) return orderDiff;
        return new Date(b.pinned_at || b.updated_at || 0) - new Date(a.pinned_at || a.updated_at || 0);
      });

    target.pinned_order = 1;
    otherPinned.forEach((it, i) => {
      it.pinned_order = i + 2;
    });
  }

  function reindexPublishedOrder(items) {
    const published = items.filter(isPublishedItem);
    const pinned = published.filter((it) => asPinnedFlag(it.pinned));
    const unpinned = published.filter((it) => !asPinnedFlag(it.pinned));

    pinned.sort((a, b) => {
      const orderDiff = Number(a.pinned_order) - Number(b.pinned_order);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.pinned_at || b.updated_at || 0) - new Date(a.pinned_at || a.updated_at || 0);
    });

    unpinned.sort((a, b) => {
      const byDate = new Date(b.date || 0) - new Date(a.date || 0);
      if (byDate !== 0) return byDate;
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });

    pinned.forEach((it, i) => {
      it.pinned_order = i + 1;
      it.sort_order = i + 1;
    });
    unpinned.forEach((it, i) => {
      it.pinned_order = 0;
      it.sort_order = pinned.length + i + 1;
    });
  }

  function listAll() {
    const items = readMergedRaw().map(normalizeItem);
    reindexPublishedOrder(items);
    const sorted = items.slice().sort(compareForDisplay);
    if (window.activityPages) window.activityPages.activities = sorted;
    return sorted;
  }

  function listRawAll() {
    return readMergedRaw()
      .slice()
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || Number(a.idx) - Number(b.idx));
  }

  function listPublished() {
    return listAll()
      .filter(isPublishedItem)
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
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

    const wantPinned = asPinnedFlag(partial.pinned);
    const normalized = normalizeItem(partial);
    const idx = normalized.idx;
    if (!Number.isFinite(idx)) {
      throw new Error("活動編號無效，請重新整理頁面後再試。");
    }

    const pos = items.findIndex((x) => Number(x.idx) === idx);
    const now = new Date().toISOString();
    normalized.updated_at = now;
    normalized.pinned = wantPinned;
    if (pos >= 0) {
      normalized.created_at = items[pos].created_at || normalized.created_at;
      items[pos] = normalized;
    } else {
      normalized.created_at = normalized.created_at || now;
      items.push(normalized);
    }

    const target = items.find((x) => Number(x.idx) === idx);
    const nowPublished = isPublishedItem(normalized);
    if (target) {
      target.pinned = wantPinned;
      if (nowPublished) {
        if (wantPinned) {
          promotePinnedToTop(items, idx);
        } else {
          target.pinned_order = 0;
          target.pinned_at = "";
        }
        reindexPublishedOrder(items);
      } else {
        target.pinned_order = 0;
        target.pinned_at = "";
      }
    }

    const keysAfter = new Set(
      items.map((x) => Number(x.idx)).filter((n) => Number.isFinite(n))
    );
    for (const k of keysBefore) {
      if (!keysAfter.has(k)) {
        throw new Error("儲存異常：偵測到可能遺失既有活動，已中止寫入以避免資料被覆蓋。請重新整理後再試。");
      }
    }

    persistOverrides(items);
    return listAll().find((x) => Number(x.idx) === idx) || normalized;
  }

  function removeItemByIdx(idx) {
    const idxNum = Number(idx);
    const defaults = getBundledDefaults();
    const wasBundled = Array.isArray(defaults) && defaults.some((d) => Number(d.idx) === idxNum);

    const items = getItemsForMutation();
    const next = items.filter((x) => Number(x.idx) !== idxNum);
    persistOverrides(next);
    removeImage(idxNum);

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
    if (!window.activityPages) window.activityPages = { activities: [] };
    window.activityPages.activities = listAll();
  }

  /** Remove saved overrides so list falls back to bundled 活動集錦 (activity-pages.js). */
  function resetToBundledActivities() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(REMOVED_DEFAULTS_KEY);
      localStorage.removeItem(IMAGES_KEY);
    } catch (e) {
      /* ignore */
    }
    seedOverrideToPages();
  }

  // Apply override before any rendering scripts execute.
  seedOverrideToPages();

  window.ActivityStore = {
    STORAGE_KEY,
    DEFAULT_ACTIVITY_FALLBACK,
    listAll,
    listPublished,
    listRawAll,
    getByIdx,
    allocateActivityIdx,
    saveItem,
    removeItemByIdx,
    resetToBundledActivities,
    persistImageUrl,
    resolveImageUrl,
    getDisplayImageUrl,
    applyActivityImage,
    attachImage,
    removeImage,
    login,
    logout,
    isAuthed
  };
})();
