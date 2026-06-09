(() => {
  const authApi = window.MarketplaceAuth;
  const canInitSupabase = authApi && !authApi.diagnoseSupabaseEnv();
  const MARKET_PRODUCTS_KEY = "marketplace_products_v2";
  const MARKET_ORDERS_KEY = "marketplace_orders_v2";
  const MARKET_FEE_KEY = "marketplace_platform_fee_v1";
  const DEFAULT_FEE = 4;
  const SHIPPING_FEE = 80;

  const guestActions = document.getElementById("marketplace-guest-actions");
  const loginNote = document.getElementById("marketplace-login-note");
  const memberPanel = document.getElementById("member-center-panel");
  const memberModeNote = document.getElementById("member-mode-note");
  const roleBadge = document.getElementById("marketplace-role-badge");
  const userEmail = document.getElementById("marketplace-user-email");
  const logoutBtn = document.getElementById("marketplace-logout-btn");
  const openListingFormBtn = document.getElementById("open-listing-form-btn");
  const productEditorModal = document.getElementById("product-editor-modal");
  const productEditorForm = document.getElementById("product-editor-form");
  const productEditorTitle = document.getElementById("product-editor-title");
  const productEditorId = document.getElementById("product-editor-id");
  const productEditorName = document.getElementById("product-editor-name");
  const productEditorPrice = document.getElementById("product-editor-price");
  const productEditorStock = document.getElementById("product-editor-stock");
  const productEditorDescription = document.getElementById("product-editor-description");
  const productEditorImageFile = document.getElementById("product-editor-image-file");
  const productEditorImageUrl = document.getElementById("product-editor-image-url");
  const productEditorImagePreview = document.getElementById("product-editor-image-preview");
  const productEditorImagePreviewWrap = document.getElementById("product-editor-image-preview-wrap");
  const productEditorMessage = document.getElementById("product-editor-message");
  const productEditorSubmit = document.getElementById("product-editor-submit");

  const MARKET_IMAGES_KEY = "marketplace_product_images_v1";
  const IMAGE_REF_PREFIX = "mpimg:";
  const DEFAULT_PRODUCT_IMAGE = "images/logo-immba-icon.svg";
  const itemsGrid = document.getElementById("marketplace-items-grid");
  const emptyText = document.getElementById("marketplace-empty-text");
  const cartLink = document.getElementById("marketplace-cart-link");
  const cartCountBadge = document.getElementById("marketplace-cart-count");
  const shipAlert = document.getElementById("marketplace-ship-alert");
  const shipCountBadge = document.getElementById("marketplace-ship-count");
  const sellerPanel = document.getElementById("seller-dashboard-panel");
  const sellerStatListings = document.getElementById("seller-stat-listings");
  const sellerStatSold = document.getElementById("seller-stat-sold");
  const sellerStatMode = document.getElementById("seller-stat-mode");
  const sellerPendingPayment = document.getElementById("seller-orders-pending-payment");
  const sellerPendingShipment = document.getElementById("seller-orders-pending-shipment");
  const sellerCompleted = document.getElementById("seller-orders-completed");
  const sellerMonthFilter = document.getElementById("seller-month-filter");
  const sellerMonthlySummary = document.getElementById("seller-monthly-summary");
  const sellerExportCsvBtn = document.getElementById("seller-export-csv-btn");
  const modeSelect = document.getElementById("market-mode-select");

  const seedProducts = [
    { id: "b8782051-97e4-4354-af89-445cc8025b6d", title: "全新藍芽耳機 imMBA 畢業生紀念品", description: "無描述", price: 3500, imageUrl: "https://res.cloudinary.com/dsvs6hyix/image/upload/v1777275193/uhazt7trcd4urt3uo1va.png", status: "active", stock: 1, sellerId: "seed-admin", sellerName: "平台賣家", createdAt: "2026-04-27T07:33:15.879Z", updatedAt: "2026-04-27T07:33:15.879Z" },
    { id: "1e067370-68d1-4907-8773-2e510d2aab4f", title: "imMBA 專屬筆記型電腦 全新", description: "全新電腦", price: 25000, imageUrl: "https://res.cloudinary.com/dsvs6hyix/image/upload/v1777275098/pgg0aret7ic3brfca3k3.png", status: "active", stock: 1, sellerId: "seed-admin", sellerName: "平台賣家", createdAt: "2026-04-27T07:31:41.762Z", updatedAt: "2026-04-27T07:31:41.762Z" },
    { id: "0566811b-a24a-4374-ac59-56d27274ef5b", title: "imMBA 二手平板", description: "學長姐二手平板電腦", price: 5000, imageUrl: "https://res.cloudinary.com/dsvs6hyix/image/upload/v1777275015/diqi0qj3mhmuermqvsik.png", status: "active", stock: 1, sellerId: "seed-admin", sellerName: "平台賣家", createdAt: "2026-04-27T07:30:18.754Z", updatedAt: "2026-04-27T07:30:18.754Z" },
    { id: "e690aeaf-4407-404c-bac9-37e0ac564bae", title: "imMBA 手持風扇", description: "全新 2026 畢業生紀念款", price: 800, imageUrl: "https://res.cloudinary.com/dsvs6hyix/image/upload/v1777275532/lncgxtjutjabyc9no8cc.png", status: "active", stock: 1, sellerId: "seed-admin", sellerName: "平台賣家", createdAt: "2026-04-20T09:58:13.194Z", updatedAt: "2026-04-20T09:58:13.194Z" }
  ];

  if (!canInitSupabase) {
    if (memberModeNote) memberModeNote.textContent = "尚未完成 Supabase 設定，請先填寫 supabase-config.js。";
    return;
  }

  const client = authApi.getClient();
  const getModeKey = (userId) => `marketplace_mode_${userId}`;
  const getCartKey = (userId) => `marketplace_cart_${userId}`;
  let currentUser = null;
  let currentProfile = null;
  let currentMode = "buyer";
  let products = [];
  let orders = [];
  let currentCart = {};
  let platformFee = DEFAULT_FEE;

  function nowIso() { return new Date().toISOString(); }
  function monthKey(dateStr) {
    const d = new Date(dateStr || nowIso());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}/${m}`;
  }
  function formatPrice(val) { return `NT$ ${Number(val || 0).toLocaleString("zh-TW")}`; }
  function escapeHtml(val) {
    return String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function canManageProducts() {
    return isSellerAllowed() && currentMode === "seller";
  }
  function readImageMap() {
    return safeParse(MARKET_IMAGES_KEY, {});
  }
  function saveImageMap(map) {
    localStorage.setItem(MARKET_IMAGES_KEY, JSON.stringify(map));
  }
  function resolveProductImageUrl(productOrUrl) {
    const raw = String(
      typeof productOrUrl === "string" ? productOrUrl : productOrUrl?.imageUrl || ""
    ).trim();
    if (!raw) return DEFAULT_PRODUCT_IMAGE;
    if (raw.startsWith(IMAGE_REF_PREFIX)) {
      const id = raw.slice(IMAGE_REF_PREFIX.length);
      return readImageMap()[id] || DEFAULT_PRODUCT_IMAGE;
    }
    return raw;
  }
  function attachProductImage(productId, dataUrl) {
    const map = readImageMap();
    map[productId] = dataUrl;
    saveImageMap(map);
    return `${IMAGE_REF_PREFIX}${productId}`;
  }
  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("讀取圖片失敗。"));
      reader.readAsDataURL(file);
    });
  }
  async function compressDataUrl(dataUrl, mimeType) {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("無法解析圖片，請改用 JPG 或 PNG。"));
      el.src = dataUrl;
    });
    const maxSide = 960;
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    const scale = Math.min(1, maxSide / Math.max(w, h, 1));
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("無法處理圖片。");
    ctx.drawImage(img, 0, 0, w, h);
    const usePng = mimeType === "image/png";
    let quality = 0.85;
    let result = canvas.toDataURL(usePng ? "image/png" : "image/jpeg", quality);
    while (!usePng && result.length > 450000 && quality > 0.45) {
      quality -= 0.08;
      result = canvas.toDataURL("image/jpeg", quality);
    }
    if (result.length > 900000) {
      throw new Error("圖片壓縮後仍過大，請改用較小或較低解析度的照片。");
    }
    return result;
  }
  async function processProductImageFile(file) {
    if (!file) return "";
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) throw new Error("圖片超過 8MB，請先縮小後再上傳。");
    if (!file.type?.startsWith("image/")) throw new Error("請上傳圖片檔案（JPG、PNG 等）。");
    const dataUrl = await readFileAsDataUrl(file);
    return compressDataUrl(dataUrl, file.type);
  }
  function setProductImagePreview(url) {
    const safeUrl = String(url || "").trim();
    if (!productEditorImagePreview || !productEditorImagePreviewWrap) return;
    if (!safeUrl) {
      productEditorImagePreviewWrap.style.display = "none";
      productEditorImagePreview.removeAttribute("src");
      return;
    }
    productEditorImagePreview.src = safeUrl;
    productEditorImagePreviewWrap.style.display = "block";
  }
  function closeProductEditor() {
    if (!productEditorModal) return;
    productEditorModal.hidden = true;
    productEditorModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function openProductEditor(productId) {
    if (!productEditorModal || !productEditorForm) return;
    const item = productId ? getProductById(productId) : null;
    if (productId && !item) return;
    productEditorForm.reset();
    if (productEditorMessage) productEditorMessage.textContent = "";
    if (productEditorImageFile) productEditorImageFile.value = "";
    if (item) {
      if (productEditorTitle) productEditorTitle.textContent = "編輯商品";
      if (productEditorId) productEditorId.value = item.id;
      if (productEditorName) productEditorName.value = item.title;
      if (productEditorPrice) productEditorPrice.value = String(item.price);
      if (productEditorStock) productEditorStock.value = String(item.stock);
      if (productEditorDescription) productEditorDescription.value = item.description === "無描述" ? "" : (item.description || "");
      if (productEditorImageUrl) productEditorImageUrl.value = item.imageUrl || "";
      if (productEditorSubmit) productEditorSubmit.textContent = "儲存變更";
      setProductImagePreview(resolveProductImageUrl(item));
    } else {
      if (productEditorTitle) productEditorTitle.textContent = "新增上架商品";
      if (productEditorId) productEditorId.value = "";
      if (productEditorStock) productEditorStock.value = "1";
      if (productEditorImageUrl) productEditorImageUrl.value = "";
      if (productEditorSubmit) productEditorSubmit.textContent = "新增物品";
      setProductImagePreview("");
    }
    productEditorModal.hidden = false;
    productEditorModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    productEditorName?.focus();
  }
  function safeParse(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }
  function saveData() {
    localStorage.setItem(MARKET_PRODUCTS_KEY, JSON.stringify(products));
    localStorage.setItem(MARKET_ORDERS_KEY, JSON.stringify(orders));
    localStorage.setItem(MARKET_FEE_KEY, String(platformFee));
  }
  function migrateOrderStatuses(list) {
    let changed = false;
    list.forEach((order) => {
      if (order.status === "pending_payment" && !order.shippedAt) {
        order.status = "pending_shipment";
        order.updatedAt = nowIso();
        changed = true;
      }
    });
    return changed;
  }
  function loadData() {
    products = safeParse(MARKET_PRODUCTS_KEY, []);
    if (!Array.isArray(products) || products.length === 0) products = [...seedProducts];
    orders = safeParse(MARKET_ORDERS_KEY, []);
    if (!Array.isArray(orders)) orders = [];
    const feeRaw = Number(localStorage.getItem(MARKET_FEE_KEY));
    platformFee = Number.isFinite(feeRaw) && feeRaw >= 0 ? feeRaw : DEFAULT_FEE;
    migrateOrderStatuses(orders);
    saveData();
  }
  function reloadOrdersFromStorage() {
    const fresh = safeParse(MARKET_ORDERS_KEY, []);
    if (!Array.isArray(fresh)) return;
    if (migrateOrderStatuses(fresh)) {
      localStorage.setItem(MARKET_ORDERS_KEY, JSON.stringify(fresh));
    }
    if (JSON.stringify(fresh) === JSON.stringify(orders)) return;
    const prevCount = getPendingShipmentCount();
    orders = fresh;
    renderSellerOrders();
    if (currentMode === "seller" && getPendingShipmentCount() > prevCount) {
      shipAlert?.classList.add("mp-ship-link--new");
      setTimeout(() => shipAlert?.classList.remove("mp-ship-link--new"), 2400);
    }
  }
  function getModeLabel(mode) {
    return mode === "seller" ? "賣家" : "買家";
  }
  function updateRoleBadge() {
    if (!roleBadge) return;
    if (!currentUser) {
      roleBadge.textContent = "";
      roleBadge.style.display = "none";
      return;
    }
    roleBadge.style.display = "";
    roleBadge.textContent = `角色：${getModeLabel(currentMode)}`;
  }
  function isActiveMember() {
    return !!(currentUser && currentProfile && currentProfile.status !== "suspended");
  }
  function isSellerAllowed() {
    return isActiveMember() && currentProfile.seller_enabled !== false;
  }
  function getProductById(id) {
    return products.find((p) => p.id === id) || null;
  }
  function loadCart() {
    if (!currentUser) { currentCart = {}; return; }
    const parsed = safeParse(getCartKey(currentUser.id), {});
    currentCart = parsed && typeof parsed === "object" ? parsed : {};
  }
  function saveCart() {
    if (!currentUser) return;
    localStorage.setItem(getCartKey(currentUser.id), JSON.stringify(currentCart));
  }
  function getCartRows() {
    return Object.entries(currentCart).map(([productId, qty]) => {
      const product = getProductById(productId);
      const quantity = Number(qty || 0);
      if (!product || product.status !== "active" || quantity <= 0) return null;
      return { product, quantity: Math.min(quantity, product.stock || 0), amount: product.price * Math.min(quantity, product.stock || 0) };
    }).filter(Boolean);
  }
  function renderProducts() {
    if (!itemsGrid) return;
    const items = products
      .filter((p) => p.status === "active" || p.status === "sold")
      .sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === "active" ? -1 : 1;
      });
    if (!items.length) {
      itemsGrid.innerHTML = "";
      if (emptyText) emptyText.style.display = "block";
      return;
    }
    if (emptyText) emptyText.style.display = "none";
    const showManage = canManageProducts();
    itemsGrid.innerHTML = items.map((item) => {
      const isSold = item.status === "sold";
      const lowStock = !isSold && Number(item.stock || 0) <= 1;
      const statusLabel = isSold ? "已售出" : (lowStock ? "低庫存（剩 1 件）" : "上架中");
      const statusColor = isSold ? "#6b7280" : "#8a6d3b";
      const imgUrl = escapeHtml(resolveProductImageUrl(item));
      return `
        <article class="card" style="${isSold ? "opacity:0.88;" : ""}">
          <div style="border-radius:12px;overflow:hidden;aspect-ratio:4/3;background:#f3f4f6;position:relative;">
            <img src="${imgUrl}" alt="${escapeHtml(item.title)}" style="width:100%;height:100%;object-fit:cover;${isSold ? "filter:grayscale(20%);" : ""}">
            ${isSold ? `<span style="position:absolute;top:10px;left:10px;background:#6b7280;color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;">已售出</span>` : ""}
          </div>
          <h3 style="margin-top:12px;">${escapeHtml(item.title)}</h3>
          <p style="color:${statusColor};font-size:12px;margin:0;">${statusLabel}</p>
          <p style="font-size:34px;font-weight:700;color:#e8a0ad;margin:4px 0 8px;">${formatPrice(item.price)}</p>
          <p class="admin-note" style="min-height:44px;">${escapeHtml(item.description || "無描述")}</p>
          <p class="admin-note">${isSold ? "此商品已售出，暫不可購買。" : `剩餘可購買：${item.stock} 件`}</p>
          <div class="admin-actions" style="margin-top:8px;">
            ${!isSold && currentMode !== "seller" ? `<button class="btn btn-primary add-cart-btn" type="button" data-product-id="${item.id}">加入購物車</button>` : ""}
            ${showManage ? `<button class="btn btn-outline edit-item-btn" type="button" data-product-id="${item.id}">編輯商品</button>` : ""}
            ${showManage && !isSold ? `<button class="btn btn-outline sold-item-btn" type="button" data-product-id="${item.id}">標示已售出</button>` : ""}
            ${showManage && isSold ? `<button class="btn btn-outline relist-item-btn" type="button" data-product-id="${item.id}">重新上架</button>` : ""}
          </div>
        </article>
      `;
    }).join("");
  }
  function updateCartBadge() {
    if (!cartCountBadge) return;
    const count = currentUser
      ? getCartRows().reduce((sum, row) => sum + row.quantity, 0)
      : 0;
    cartCountBadge.textContent = String(count);
    cartCountBadge.hidden = count <= 0;
  }
  function getPendingShipmentCount() {
    if (!currentUser) return 0;
    return orders.filter((o) => o.sellerId === currentUser.id && o.status === "pending_shipment").length;
  }
  function updateShipAlert() {
    if (!shipAlert) return;
    const show = !!(currentUser && currentMode === "seller" && isSellerAllowed());
    const count = show ? getPendingShipmentCount() : 0;
    shipAlert.style.display = show ? "inline-flex" : "none";
    shipAlert.hidden = !show;
    shipAlert.classList.toggle("mp-ship-link--pulse", show && count > 0);
    shipAlert.classList.toggle("mp-ship-link--idle", show && count <= 0);
    if (shipCountBadge) {
      shipCountBadge.textContent = String(count);
      shipCountBadge.hidden = count <= 0;
    }
    if (show) {
      const label = count > 0 ? `待出貨 ${count} 筆訂單` : "待出貨訂單（目前無待處理）";
      shipAlert.title = label;
      shipAlert.setAttribute("aria-label", label);
    }
  }
  function renderSellerOrders() {
    if (!sellerPanel || !currentUser) return;
    const mineListings = products.filter((p) => p.sellerId === currentUser.id);
    const mineSold = mineListings.filter((p) => p.status === "sold");
    if (sellerStatListings) sellerStatListings.textContent = String(mineListings.length);
    if (sellerStatSold) sellerStatSold.textContent = String(mineSold.length);
    if (sellerStatMode) sellerStatMode.textContent = getModeLabel(currentMode);

    const mineOrders = orders.filter((o) => o.sellerId === currentUser.id);
    const waitingPay = mineOrders.filter((o) => o.status === "pending_payment");
    const waitingShip = mineOrders.filter((o) => o.status === "pending_shipment");
    const completed = mineOrders.filter((o) => o.status === "completed");
    const renderOrderCard = (order, actionBtn) => `
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin-top:8px;">
        <div style="font-weight:700;color:#003366;">訂單編號: ${order.id}</div>
        <div class="admin-note">商品: ${order.items.map((i) => `${i.title} x${i.qty}`).join("、")}</div>
        <div class="admin-note">應付總額: ${formatPrice(order.total)}</div>
        ${actionBtn || ""}
      </div>`;
    if (sellerPendingShipment) sellerPendingShipment.innerHTML = waitingShip.length ? waitingShip.map((o) => renderOrderCard(o, `<button class="btn btn-outline mark-shipped-btn" type="button" data-order-id="${o.id}" style="color:#003366;border-color:#003366;">標記已出貨（轉待收款）</button>`)).join("") : `<p class="admin-note">目前沒有訂單。</p>`;
    if (sellerPendingPayment) sellerPendingPayment.innerHTML = waitingPay.length ? waitingPay.map((o) => renderOrderCard(o, `<button class="btn btn-outline mark-paid-btn" type="button" data-order-id="${o.id}" style="color:#003366;border-color:#003366;">標記已收款（完成）</button>`)).join("") : `<p class="admin-note">目前沒有訂單。</p>`;
    if (sellerCompleted) sellerCompleted.innerHTML = completed.length ? completed.map((o) => renderOrderCard(o, "")).join("") : `<p class="admin-note">目前沒有訂單。</p>`;

    const monthSet = Array.from(new Set(completed.map((o) => monthKey(o.completedAt || o.updatedAt || o.createdAt)))).sort().reverse();
    if (sellerMonthFilter) {
      sellerMonthFilter.innerHTML = [`<option value="all">全部月份</option>`, ...monthSet.map((m) => `<option value="${m}">${m}</option>`)].join("");
    }
    renderSellerMonthly();
    updateShipAlert();
  }
  function renderSellerMonthly() {
    if (!sellerMonthlySummary || !currentUser) return;
    const selected = sellerMonthFilter?.value || "all";
    const completed = orders.filter((o) => o.sellerId === currentUser.id && o.status === "completed");
    const rows = completed.filter((o) => selected === "all" || monthKey(o.completedAt || o.updatedAt || o.createdAt) === selected);
    const total = rows.reduce((sum, o) => sum + Number(o.total || 0), 0);
    sellerMonthlySummary.textContent = `${selected === "all" ? "全部月份" : selected}：完成 ${rows.length} 筆，本月營業額 ${formatPrice(total)}`;
  }
  function updateMemberUi() {
    const sellerAllowed = isSellerAllowed();
    if (memberModeNote) {
      if (currentMode === "seller" && !sellerAllowed) {
        memberModeNote.textContent = "目前無法使用賣家功能，請先聯繫平台或改以買家身分操作。";
      } else {
        memberModeNote.textContent = currentMode === "seller"
          ? "賣家：可上架商品、管理訂單與帳務。"
          : "買家：可瀏覽商品、加入購物車與下單。";
      }
    }
    updateRoleBadge();
    const showCart = currentMode !== "seller";
    if (cartLink) cartLink.style.display = showCart ? "inline-flex" : "none";
    updateCartBadge();
    if (openListingFormBtn) openListingFormBtn.style.display = sellerAllowed && currentMode === "seller" ? "inline-flex" : "none";
    if (sellerPanel) sellerPanel.style.display = sellerAllowed && currentMode === "seller" ? "block" : "none";
    if (!sellerAllowed || currentMode !== "seller") closeProductEditor();
    updateShipAlert();
  }
  function addToCart(productId) {
    if (!currentUser) { alert("請先登入會員後再加入購物車。"); return; }
    const product = getProductById(productId);
    if (!product || product.status !== "active" || Number(product.stock || 0) <= 0) return;
    const qty = Number(currentCart[productId] || 0);
    if (qty >= Number(product.stock || 0)) { alert("已達可購買上限。"); return; }
    currentCart[productId] = qty + 1;
    saveCart();
    updateCartBadge();
  }
  function markListingSold(productId) {
    if (!canManageProducts()) return;
    const item = getProductById(productId);
    if (!item || item.status === "sold") return;
    if (!confirm(`確定將「${item.title}」標示為已售出？`)) return;
    item.stock = 0;
    item.status = "sold";
    item.updatedAt = nowIso();
    saveData();
    renderProducts();
    renderSellerOrders();
  }
  function relistProduct(productId) {
    if (!canManageProducts()) return;
    const item = getProductById(productId);
    if (!item || item.status !== "sold") return;
    item.status = "active";
    item.stock = Math.max(1, Number(item.stock || 0) || 1);
    item.updatedAt = nowIso();
    saveData();
    renderProducts();
    renderSellerOrders();
  }

  async function init() {
    loadData();
    const boot = await authApi.bootstrapFromSupabase();
    currentUser = boot?.user || null;
    currentProfile = boot?.profile || null;
    if (!currentUser) {
      renderProducts();
      if (guestActions) guestActions.style.display = "flex";
      if (loginNote) loginNote.style.display = "none";
      if (memberPanel) memberPanel.style.display = "none";
      updateRoleBadge();
      if (sellerPanel) sellerPanel.style.display = "none";
      if (cartLink) cartLink.style.display = "inline-flex";
      updateCartBadge();
      return;
    }
    const modeStored = localStorage.getItem(getModeKey(currentUser.id)) || "buyer";
    currentMode = modeStored === "seller" ? "seller" : "buyer";

    if (guestActions) guestActions.style.display = "none";
    if (loginNote) loginNote.style.display = "block";
    if (memberPanel) memberPanel.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    updateRoleBadge();
    if (userEmail) {
      const displayName = String(currentProfile?.display_name || authApi.getLocalSession()?.displayName || "").trim();
      userEmail.textContent = displayName ? `${displayName}（${currentUser.email || ""}）` : (currentUser.email || "");
    }
    if (modeSelect) modeSelect.value = currentMode;
    loadCart();
    updateMemberUi();
    renderProducts();
    updateCartBadge();
    renderSellerOrders();
  }

  productEditorImageFile?.addEventListener("change", () => {
    const file = productEditorImageFile.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setProductImagePreview(localUrl);
  });

  productEditorForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser || !canManageProducts()) return;
    const title = String(productEditorName?.value || "").trim();
    const price = Number(productEditorPrice?.value || 0);
    const stock = Number(productEditorStock?.value ?? -1);
    const description = String(productEditorDescription?.value || "").trim();
    const editId = String(productEditorId?.value || "").trim();
    const existing = editId ? getProductById(editId) : null;

    if (!title || price <= 0 || stock < 0) {
      if (productEditorMessage) productEditorMessage.textContent = "請填寫正確的商品名稱、價格與庫存。";
      return;
    }

    if (productEditorSubmit) productEditorSubmit.disabled = true;
    if (productEditorMessage) productEditorMessage.textContent = "處理中…";

    const productId = editId || `prd-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    let imageUrl = String(productEditorImageUrl?.value || existing?.imageUrl || "").trim();
    const file = productEditorImageFile?.files?.[0];
    try {
      if (file) {
        const dataUrl = await processProductImageFile(file);
        imageUrl = attachProductImage(productId, dataUrl);
      }
    } catch (err) {
      if (productEditorMessage) productEditorMessage.textContent = err?.message || "圖片處理失敗。";
      if (productEditorSubmit) productEditorSubmit.disabled = false;
      return;
    }
    if (!imageUrl) imageUrl = DEFAULT_PRODUCT_IMAGE;

    if (existing) {
      existing.title = title;
      existing.price = Math.round(price);
      existing.stock = Math.round(stock);
      existing.description = description || "無描述";
      existing.imageUrl = imageUrl;
      existing.status = stock > 0 ? "active" : "sold";
      existing.updatedAt = nowIso();
    } else {
      products.unshift({
        id: productId,
        title,
        description: description || "無描述",
        price: Math.round(price),
        imageUrl,
        status: stock > 0 ? "active" : "sold",
        stock: Math.round(stock),
        sellerId: currentUser.id,
        sellerName: String(currentProfile?.display_name || authApi.getLocalSession()?.displayName || currentUser.email || "賣家").trim(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }

    saveData();
    closeProductEditor();
    renderProducts();
    renderSellerOrders();
    if (productEditorSubmit) productEditorSubmit.disabled = false;
  });

  logoutBtn?.addEventListener("click", async () => {
    await authApi.signOut();
    window.location.href = "marketplace.html";
  });
  openListingFormBtn?.addEventListener("click", () => openProductEditor(null));
  productEditorModal?.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeProductEditor);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && productEditorModal && !productEditorModal.hidden) {
      closeProductEditor();
    }
  });
  shipAlert?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("seller-pending-shipment-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("storage", (e) => {
    if (e.key === MARKET_ORDERS_KEY) reloadOrdersFromStorage();
  });
  window.addEventListener("marketplace-orders-updated", reloadOrdersFromStorage);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") reloadOrdersFromStorage();
  });
  setInterval(() => {
    if (currentMode === "seller" && currentUser) reloadOrdersFromStorage();
  }, 4000);

  modeSelect?.addEventListener("change", () => {
    if (!currentUser || !modeSelect) return;
    currentMode = modeSelect.value === "seller" ? "seller" : "buyer";
    localStorage.setItem(getModeKey(currentUser.id), currentMode);
    updateMemberUi();
    renderProducts();
    renderSellerOrders();
  });

  itemsGrid?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const addBtn = target.closest(".add-cart-btn");
    if (addBtn instanceof HTMLElement) {
      addToCart(String(addBtn.dataset.productId || ""));
      return;
    }
    const editBtn = target.closest(".edit-item-btn");
    if (editBtn instanceof HTMLElement) {
      openProductEditor(String(editBtn.dataset.productId || ""));
      return;
    }
    const soldBtn = target.closest(".sold-item-btn");
    if (soldBtn instanceof HTMLElement) {
      markListingSold(String(soldBtn.dataset.productId || ""));
      return;
    }
    const relistBtn = target.closest(".relist-item-btn");
    if (relistBtn instanceof HTMLElement) {
      relistProduct(String(relistBtn.dataset.productId || ""));
    }
  });

  sellerPanel?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement) || !currentUser) return;
    const paidBtn = target.closest(".mark-paid-btn");
    const shipBtn = target.closest(".mark-shipped-btn");
    if (!(paidBtn instanceof HTMLElement) && !(shipBtn instanceof HTMLElement)) return;
    const orderId = String((paidBtn || shipBtn)?.dataset.orderId || "");
    const order = orders.find((o) => o.id === orderId && o.sellerId === currentUser.id);
    if (!order) return;
    if (shipBtn) {
      order.status = "pending_payment";
      order.shippedAt = nowIso();
      order.updatedAt = nowIso();
    }
    if (paidBtn) {
      order.status = "completed";
      order.paidAt = nowIso();
      order.completedAt = nowIso();
      order.updatedAt = nowIso();
    }
    saveData();
    renderSellerOrders();
    updateShipAlert();
  });

  sellerMonthFilter?.addEventListener("change", renderSellerMonthly);
  sellerExportCsvBtn?.addEventListener("click", () => {
    if (!currentUser) return;
    const selected = sellerMonthFilter?.value || "all";
    const rows = orders.filter((o) => o.sellerId === currentUser.id && o.status === "completed" && (selected === "all" || monthKey(o.completedAt || o.updatedAt || o.createdAt) === selected));
    const lines = ["order_id,month,total,status,updated_at"];
    rows.forEach((o) => lines.push(`${o.id},${monthKey(o.completedAt || o.updatedAt || o.createdAt)},${o.total},${o.status},${o.updatedAt || ""}`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seller-accounting-${selected}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  init();
})();
