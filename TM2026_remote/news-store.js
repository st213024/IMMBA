(() => {
  // Bump when replacing default catalog (sync with official first page).
  const STORAGE_KEY = "immba_news_items_v2";
  const IMAGES_KEY = "immba_news_images_v1";
  const IMAGE_REF_PREFIX = "newsimg:";
  const AUTH_KEY = "immba_admin_auth_v1";
  const DEFAULT_NEWS_FALLBACK_SVG =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86 60"><rect width="86" height="60" rx="8" fill="#e3ebf7"/><circle cx="43" cy="24" r="10" fill="#b4cef0"/><path d="M20 52c4-12 14-18 23-18s19 6 23 18" fill="#b4cef0"/></svg>'
    );
  const DEFAULT_NEWS_FALLBACK =
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=70";

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

  function asPinnedFlag(value) {
    if (value === true || value === 1 || value === "1" || value === "true" || value === "on") return true;
    if (value === false || value === 0 || value === "0" || value === "false" || value === "" || value == null) {
      return false;
    }
    return Boolean(value);
  }

  let savingNews = false;

  function isEphemeralImageUrl(url) {
    return typeof url === "string" && (url.startsWith("blob:") || url.startsWith("data:"));
  }

  function readImageMap() {
    try {
      const parsed = JSON.parse(localStorage.getItem(IMAGES_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeImageMap(map, options) {
    try {
      localStorage.setItem(IMAGES_KEY, JSON.stringify(map));
      if (!options?.silent) notifyChanged();
    } catch (err) {
      if (err && (err.name === "QuotaExceededError" || String(err).toLowerCase().includes("quota"))) {
        throw new Error("圖片儲存空間不足，請改用較小的圖片後再試。");
      }
      throw err;
    }
  }

  function isDisplayableImageUrl(url) {
    const u = String(url || "").trim();
    if (!u) return false;
    if (u.startsWith(IMAGE_REF_PREFIX) || u.startsWith("blob:")) return false;
    if (isLikelyBase64Image(u)) {
      const comma = u.indexOf(",");
      if (comma < 12) return false;
      return u.slice(comma + 1).length >= 80;
    }
    if (u.startsWith("data:image/svg+xml")) return true;
    if (/^https?:\/\//i.test(u)) return true;
    if (/^(?:\.\/)?images\//i.test(u)) return true;
    return false;
  }

  function repairImageMap(options) {
    const map = readImageMap();
    let changed = false;
    Object.keys(map).forEach((key) => {
      if (!isDisplayableImageUrl(map[key])) {
        delete map[key];
        changed = true;
      }
    });
    if (changed) writeImageMap(map, options);
  }

  function pruneOrphanImages(items, options) {
    const usedIds = new Set(items.map((it) => String(it?.id || "").trim()).filter(Boolean));
    const map = readImageMap();
    let changed = false;
    Object.keys(map).forEach((key) => {
      if (!usedIds.has(key)) {
        delete map[key];
        changed = true;
      }
    });
    if (changed) writeImageMap(map, options);
  }

  function attachImage(newsId, dataUrl, options) {
    const id = String(newsId || "").trim();
    if (!id || !isLikelyBase64Image(dataUrl)) return "";
    const map = readImageMap();
    map[id] = dataUrl;
    try {
      writeImageMap(map, options);
    } catch (err) {
      if (err && (err.name === "QuotaExceededError" || String(err).toLowerCase().includes("quota"))) {
        throw new Error("圖片儲存空間不足，請改用較小的圖片後再試。");
      }
      throw err;
    }
    const verify = readImageMap()[id];
    if (!isDisplayableImageUrl(verify)) {
      throw new Error("圖片寫入驗證失敗，請重新上傳。");
    }
    return `${IMAGE_REF_PREFIX}${id}`;
  }

  function resolveImageUrl(raw) {
    const url = String(raw || "").trim();
    if (!url) return "";
    if (url.startsWith(IMAGE_REF_PREFIX)) {
      const id = url.slice(IMAGE_REF_PREFIX.length);
      const fromMap = readImageMap()[id] || "";
      return isDisplayableImageUrl(fromMap) ? fromMap : "";
    }
    if (url.startsWith("blob:")) return "";
    if (isLikelyBase64Image(url)) return isDisplayableImageUrl(url) ? url : "";
    return isDisplayableImageUrl(url) ? url : "";
  }

  function getDisplayImageUrl(raw, fallback) {
    const resolved = resolveImageUrl(raw);
    if (resolved) return resolved;
    return fallback || DEFAULT_NEWS_FALLBACK;
  }

  function applyNewsImage(img, raw, fallback) {
    if (!img) return;
    const photoFb = fallback || DEFAULT_NEWS_FALLBACK;
    const svgFb = DEFAULT_NEWS_FALLBACK_SVG;
    const resolved = resolveImageUrl(raw);
    const chain = resolved ? [resolved, photoFb, svgFb] : [photoFb, svgFb];
    let step = 0;

    const loadNext = () => {
      if (step >= chain.length) {
        img.onerror = null;
        return;
      }
      img.src = chain[step];
      step += 1;
    };

    img.onload = () => {
      img.onerror = null;
    };
    img.onerror = () => loadNext();
    loadNext();
  }

  function imageRefExists(ref) {
    const url = String(ref || "").trim();
    if (!url.startsWith(IMAGE_REF_PREFIX)) return false;
    const id = url.slice(IMAGE_REF_PREFIX.length);
    return Boolean(readImageMap()[id]);
  }

  function persistImageUrl(newsId, imageUrl, options) {
    const url = String(imageUrl || "").trim();
    if (!url) return "";
    if (url.startsWith(IMAGE_REF_PREFIX)) return imageRefExists(url) ? url : "";
    if (isLikelyBase64Image(url)) return attachImage(newsId, url, options);
    if (url.startsWith("blob:")) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return "";
  }

  function removeImage(newsId) {
    const map = readImageMap();
    if (!map[newsId]) return;
    delete map[newsId];
    writeImageMap(map);
  }

  function sanitizeStoredItems(items) {
    const map = readImageMap();
    let mapChanged = false;
    const nextItems = items.map((item) => {
      if (!item || typeof item !== "object") return item;
      const next = { ...item };
      const raw = next.image_url || next.cover_image || "";
      if (isLikelyBase64Image(raw)) {
        if (!map[next.id]) {
          map[next.id] = raw;
          mapChanged = true;
        }
        next.image_url = `${IMAGE_REF_PREFIX}${next.id}`;
      } else if (String(raw).startsWith("blob:")) {
        next.image_url = "";
      } else if (raw) {
        const r = String(raw).trim();
        if (r.startsWith(IMAGE_REF_PREFIX)) {
          next.image_url = r;
        } else if (isDisplayableImageUrl(r) || /^https?:\/\//i.test(r)) {
          next.image_url = r;
        } else {
          next.image_url = "";
        }
      }
      if (String(next.image_url || "").startsWith(IMAGE_REF_PREFIX) && !imageRefExists(next.image_url)) {
        next.image_url = "";
      }
      delete next.cover_image;
      delete next.imageData;
      return next;
    });
    if (mapChanged) {
      try {
        writeImageMap(map);
      } catch (e) {
        console.warn("[news-store] image map write failed:", e?.message || e);
      }
    }
    return nextItems;
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
      pinned: asPinnedFlag(item.pinned),
      pinned_at: item.pinned_at || "",
      pinned_order: Number(item.pinned_order || 0),
      status,
      is_published: status === "published" || Boolean(item.is_published),
      created_at: item.created_at || now,
      updated_at: item.updated_at || now
    };
  }

  function loadItemsRaw() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultNews.map((item) => ({ ...item }));
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return defaultNews.map((item) => ({ ...item }));
      return sanitizeStoredItems(parsed);
    } catch {
      return defaultNews.map((item) => ({ ...item }));
    }
  }

  function read() {
    if (!savingNews) repairImageMap({ silent: true });
    let items = loadItemsRaw();
    const normalized = items.map(normalizeItem);
    if (savingNews) return normalized;
    const orderBefore = normalized.map((x) => `${x.id}:${x.sort_order}:${x.pinned}:${x.pinned_order}`).join("|");
    reindexPublishedOrder(normalized);
    const orderAfter = normalized.map((x) => `${x.id}:${x.sort_order}:${x.pinned}:${x.pinned_order}`).join("|");
    if (orderBefore !== orderAfter) {
      try {
        write(normalized, { silent: false });
      } catch (e) {
        console.warn("[news-store] reindex write failed:", e?.message || e);
      }
    }
    return normalized;
  }

  function write(items, options) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      if (!options?.silent) notifyChanged();
    } catch (err) {
      if (err && (err.name === "QuotaExceededError" || String(err).toLowerCase().includes("quota"))) {
        throw new Error("儲存失敗：儲存空間不足（圖片可能過大）。");
      }
      throw err;
    }
  }

  function notifyChanged() {
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("immba-news-updated"));
      }
    } catch (_) {
      /* ignore */
    }
  }

  function seedIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEY)) write(defaultNews.map(normalizeItem));
  }

  function isPublishedItem(item) {
    return item?.status === "published" || Boolean(item?.is_published);
  }

  function compareForDisplay(a, b) {
    const aPub = isPublishedItem(a);
    const bPub = isPublishedItem(b);
    if (aPub && bPub) {
      const orderDiff = Number(a.sort_order) - Number(b.sort_order);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.updated_at || b.date || 0) - new Date(a.updated_at || a.date || 0);
    }
    if (aPub !== bPub) return aPub ? -1 : 1;
    return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
  }

  function promotePinnedToTop(items, pinnedId) {
    const now = new Date().toISOString();
    const target = items.find((it) => it.id === pinnedId);
    if (!target || !isPublishedItem(target)) return;
    target.pinned = true;
    target.pinned_at = now;

    const otherPinned = items
      .filter((it) => isPublishedItem(it) && it.pinned && it.id !== pinnedId)
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
    const pinned = published.filter((it) => it.pinned);
    const unpinned = published.filter((it) => !it.pinned);

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
    return read().sort(compareForDisplay);
  }

  function listPublished() {
    return read()
      .filter((item) => isPublishedItem(item))
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  }

  function saveItem(item) {
    savingNews = true;
    try {
      const silent = { silent: true };
      const items = loadItemsRaw().map(normalizeItem);
      const normalizedItem = normalizeItem(item);
      const wantPinned = asPinnedFlag(item.pinned);
      const idx = items.findIndex((x) => x.id === normalizedItem.id);
      const prev = idx >= 0 ? items[idx] : null;

      normalizedItem.updated_at = new Date().toISOString();
      normalizedItem.pinned = wantPinned;

      if (idx >= 0) {
        normalizedItem.created_at = prev.created_at || normalizedItem.created_at;
        items[idx] = normalizedItem;
      } else {
        items.push(normalizedItem);
      }

      const target = items.find((x) => x.id === normalizedItem.id);
      const nowPublished = isPublishedItem(normalizedItem);

      if (target) {
        target.pinned = wantPinned;
        if (nowPublished) {
          if (wantPinned) {
            promotePinnedToTop(items, normalizedItem.id);
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

      pruneOrphanImages(items, silent);

      const incomingImage = String(item.image_url || item.cover_image || "").trim();
      let nextImageUrl = "";
      if (incomingImage) {
        if (isLikelyBase64Image(incomingImage)) {
          nextImageUrl = attachImage(normalizedItem.id, incomingImage, silent);
          if (!nextImageUrl) {
            throw new Error("圖片儲存失敗，請重新上傳後再儲存。");
          }
        } else {
          nextImageUrl = persistImageUrl(normalizedItem.id, incomingImage, silent);
        }
      }
      if (!nextImageUrl && idx >= 0) {
        const prevUrl = String(prev.image_url || "").trim();
        if (prevUrl && !isEphemeralImageUrl(prevUrl)) {
          nextImageUrl =
            persistImageUrl(normalizedItem.id, prevUrl, silent) || (imageRefExists(prevUrl) ? prevUrl : "");
        }
      }
      if (incomingImage && isLikelyBase64Image(incomingImage) && !nextImageUrl) {
        throw new Error("圖片儲存失敗，請重新上傳後再儲存。");
      }
      if (target) target.image_url = nextImageUrl;

      write(items, silent);
      const saved = items.find((x) => x.id === normalizedItem.id) || normalizedItem;
      return normalizeItem(saved);
    } finally {
      savingNews = false;
      notifyChanged();
    }
  }

  function getById(id) {
    return read().find((item) => item.id === id) || null;
  }

  function removeItem(id) {
    const items = read().filter((item) => item.id !== id);
    write(items);
    removeImage(id);
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

  function allocateNewsId() {
    const items = loadItemsRaw();
    const existing = new Set(items.map((it) => String(it?.id || "").trim()).filter(Boolean));
    let maxNum = 0;
    existing.forEach((id) => {
      const match = id.match(/^n-(\d+)$/i);
      if (match) maxNum = Math.max(maxNum, Number(match[1]));
    });
    let next = maxNum + 1;
    while (existing.has(`n-${next}`)) next += 1;
    return `n-${next}`;
  }

  seedIfEmpty();

  window.NewsStore = {
    STORAGE_KEY,
    IMAGES_KEY,
    IMAGE_REF_PREFIX,
    seedIfEmpty,
    listAll,
    listPublished,
    getById,
    allocateNewsId,
    saveItem,
    removeItem,
    resolveImageUrl,
    getDisplayImageUrl,
    applyNewsImage,
    DEFAULT_NEWS_FALLBACK,
    DEFAULT_NEWS_FALLBACK_SVG,
    attachImage,
    login,
    logout,
    isAuthed
  };
})();
