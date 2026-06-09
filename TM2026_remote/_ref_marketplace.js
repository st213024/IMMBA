(() => {
  const cfg = window.SUPABASE_CONFIG || {};
  const canInitSupabase = !!(window.supabase && cfg.url && cfg.anonKey && !cfg.url.includes("YOUR_PROJECT_REF"));
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
  const platformOverviewLink = document.getElementById("platform-overview-link");
  const adminReviewLink = document.getElementById("admin-review-link");
  const openListingFormBtn = document.getElementById("open-listing-form-btn");
  const listingFormPanel = document.getElementById("listing-form-panel");
  const listingForm = document.getElementById("listing-form");
  const listingFormMessage = document.getElementById("listing-form-message");
  const itemsGrid = document.getElementById("marketplace-items-grid");
  const emptyText = document.getElementById("marketplace-empty-text");
  const cartLoginHint = document.getElementById("marketplace-cart-login-hint");
  const cartEmptyText = document.getElementById("marketplace-cart-empty-text");
  const cartList = document.getElementById("marketplace-cart-list");
  const deliveryMethodWrap = document.getElementById("marketplace-delivery-method");
  const cartSummary = document.getElementById("marketplace-cart-summary");
  const cartActions = document.getElementById("marketplace-cart-actions");
  const checkoutBtn = document.getElementById("marketplace-checkout-btn");
  const checkoutMessage = document.getElementById("marketplace-checkout-message");
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
  const modeBuyerRadio = document.getElementById("mode-buyer-radio");
  const modeSellerRadio = document.getElementById("mode-seller-radio");
  const openMemberCenterBtn = document.getElementById("open-member-center-btn");

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

  const client = window.supabase.createClient(cfg.url, cfg.anonKey);
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
  function loadData() {
    products = safeParse(MARKET_PRODUCTS_KEY, []);
    if (!Array.isArray(products) || products.length === 0) products = [...seedProducts];
    orders = safeParse(MARKET_ORDERS_KEY, []);
    if (!Array.isArray(orders)) orders = [];
    const feeRaw = Number(localStorage.getItem(MARKET_FEE_KEY));
    platformFee = Number.isFinite(feeRaw) && feeRaw >= 0 ? feeRaw : DEFAULT_FEE;
    saveData();
  }
  async function getAdminProfile(userId) {
    const { data } = await client.from("admin_users").select("role,status").eq("user_id", userId).maybeSingle();
    return data || null;
  }
  function getRoleText(profile) {
    if (!profile) return "一般使用者（Pending / User）";
    if (profile.role === "super_admin" && profile.status === "approved") return "超級管理員（Super Admin）";
    if (profile.role === "admin" && profile.status === "approved") return "管理員（Admin）";
    return "一般使用者（Pending / User）";
  }
  function isApprovedAdmin() {
    return !!(currentProfile && currentProfile.status === "approved" && (currentProfile.role === "admin" || currentProfile.role === "super_admin"));
  }
  function isSuperAdmin() {
    return !!(currentProfile && currentProfile.status === "approved" && currentProfile.role === "super_admin");
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
    const items = products.filter((p) => p.status === "active");
    if (!items.length) {
      itemsGrid.innerHTML = "";
      if (emptyText) emptyText.style.display = "block";
      return;
    }
    if (emptyText) emptyText.style.display = "none";
    itemsGrid.innerHTML = items.map((item) => {
      const myListing = currentUser && item.sellerId === currentUser.id;
      const adminSeller = isApprovedAdmin() && currentMode === "seller";
      const lowStock = Number(item.stock || 0) <= 1;
      return `
        <article class="card">
          <div style="border-radius:12px;overflow:hidden;aspect-ratio:4/3;background:#f3f4f6;">
            <img src="${item.imageUrl}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <h3 style="margin-top:12px;">${item.title}</h3>
          <p style="color:#8a6d3b;font-size:12px;margin:0;">${lowStock ? "低庫存（剩 1 件）" : "上架中"}</p>
          <p style="font-size:34px;font-weight:700;color:#e8a0ad;margin:4px 0 8px;">${formatPrice(item.price)}</p>
          <p class="admin-note" style="min-height:44px;">${item.description || "無描述"}</p>
          <p class="admin-note">剩餘可購買：${item.stock} 件</p>
          <div class="admin-actions" style="margin-top:8px;">
            <button class="btn btn-primary add-cart-btn" type="button" data-product-id="${item.id}">加入購物車</button>
            ${adminSeller && myListing ? `<button class="btn btn-outline edit-item-btn" type="button" data-product-id="${item.id}" style="color:#003366;border-color:#003366;">編輯商品</button>` : ""}
            ${adminSeller && myListing ? `<button class="btn btn-outline sold-item-btn" type="button" data-product-id="${item.id}" style="color:#003366;border-color:#003366;">標示已售出</button>` : ""}
          </div>
        </article>
      `;
    }).join("");
  }
  function renderCart() {
    const rows = getCartRows();
    const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked')?.value || "meetup";
    const shipping = deliveryMethod === "shipping" ? SHIPPING_FEE : 0;
    const subtotal = rows.reduce((sum, r) => sum + r.amount, 0);
    const total = subtotal + shipping;
    if (cartList) {
      cartList.style.display = rows.length ? "block" : "none";
      cartList.innerHTML = rows.map((row) => `
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;margin-top:8px;background:#fff;">
          <div>
            <div style="font-weight:600;color:#003366;">${row.product.title}</div>
            <div class="admin-note">${formatPrice(row.product.price)} x ${row.quantity}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="btn btn-outline cart-dec-btn" type="button" data-product-id="${row.product.id}" style="color:#003366;border-color:#003366;">-</button>
            <span style="min-width:24px;text-align:center;">${row.quantity}</span>
            <button class="btn btn-outline cart-inc-btn" type="button" data-product-id="${row.product.id}" style="color:#003366;border-color:#003366;">+</button>
            <button class="btn btn-outline cart-remove-btn" type="button" data-product-id="${row.product.id}" style="color:#8b1e3f;border-color:#8b1e3f;">移除</button>
          </div>
        </div>`).join("");
    }
    if (deliveryMethodWrap) deliveryMethodWrap.style.display = rows.length ? "block" : "none";
    if (cartSummary) {
      cartSummary.style.display = rows.length ? "block" : "none";
      cartSummary.innerHTML = `商品小計：${formatPrice(subtotal)}<br>運費：${formatPrice(shipping)}<br><strong>應付總額：${formatPrice(total)}</strong>`;
    }
    if (cartActions) cartActions.style.display = rows.length ? "flex" : "none";
    if (cartEmptyText) cartEmptyText.style.display = rows.length ? "none" : "block";
  }
  function renderSellerOrders() {
    if (!sellerPanel || !currentUser) return;
    const mineListings = products.filter((p) => p.sellerId === currentUser.id);
    const mineSold = mineListings.filter((p) => p.status === "sold");
    if (sellerStatListings) sellerStatListings.textContent = String(mineListings.length);
    if (sellerStatSold) sellerStatSold.textContent = String(mineSold.length);
    if (sellerStatMode) sellerStatMode.textContent = currentMode === "seller" ? "賣家模式" : "買家模式";

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
    if (sellerPendingPayment) sellerPendingPayment.innerHTML = waitingPay.length ? waitingPay.map((o) => renderOrderCard(o, `<button class="btn btn-outline mark-paid-btn" type="button" data-order-id="${o.id}" style="color:#003366;border-color:#003366;">標記已收款（轉待出貨）</button>`)).join("") : `<p class="admin-note">目前沒有訂單。</p>`;
    if (sellerPendingShipment) sellerPendingShipment.innerHTML = waitingShip.length ? waitingShip.map((o) => renderOrderCard(o, `<button class="btn btn-outline mark-shipped-btn" type="button" data-order-id="${o.id}" style="color:#003366;border-color:#003366;">標記已出貨（完成）</button>`)).join("") : `<p class="admin-note">目前沒有訂單。</p>`;
    if (sellerCompleted) sellerCompleted.innerHTML = completed.length ? completed.map((o) => renderOrderCard(o, "")).join("") : `<p class="admin-note">目前沒有訂單。</p>`;

    const monthSet = Array.from(new Set(completed.map((o) => monthKey(o.completedAt || o.updatedAt || o.createdAt)))).sort().reverse();
    if (sellerMonthFilter) {
      sellerMonthFilter.innerHTML = [`<option value="all">全部月份</option>`, ...monthSet.map((m) => `<option value="${m}">${m}</option>`)].join("");
    }
    renderSellerMonthly();
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
    const sellerAllowed = isApprovedAdmin();
    if (memberModeNote) {
      if (currentMode === "seller" && !sellerAllowed) {
        memberModeNote.textContent = "你可切換到賣家模式檢視，但上架與賣家管理功能需經核准管理員。";
      } else {
        memberModeNote.textContent = currentMode === "seller" ? "目前為賣家模式：可管理上架商品與賣家訂單。" : "目前為買家模式：可瀏覽商品、加入購物車與下單。";
      }
    }
    if (openListingFormBtn) openListingFormBtn.style.display = sellerAllowed && currentMode === "seller" ? "inline-flex" : "none";
    if (platformOverviewLink) platformOverviewLink.style.display = isApprovedAdmin() ? "inline-flex" : "none";
    if (adminReviewLink) adminReviewLink.style.display = isSuperAdmin() ? "inline-flex" : "none";
    if (sellerPanel) sellerPanel.style.display = sellerAllowed && currentMode === "seller" ? "block" : "none";
    if (listingFormPanel && (!sellerAllowed || currentMode !== "seller")) listingFormPanel.style.display = "none";
  }
  function addToCart(productId) {
    if (!currentUser) { alert("請先登入會員後再加入購物車。"); return; }
    const product = getProductById(productId);
    if (!product || product.status !== "active" || Number(product.stock || 0) <= 0) return;
    const qty = Number(currentCart[productId] || 0);
    if (qty >= Number(product.stock || 0)) { alert("已達可購買上限。"); return; }
    currentCart[productId] = qty + 1;
    saveCart();
    renderCart();
  }
  function createOrdersFromCart() {
    const rows = getCartRows();
    if (!rows.length || !currentUser) return;
    const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked')?.value || "meetup";
    const shipping = deliveryMethod === "shipping" ? SHIPPING_FEE : 0;
    const grouped = {};
    rows.forEach((row) => {
      const key = row.product.sellerId;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });
    Object.keys(grouped).forEach((sellerId) => {
      const items = grouped[sellerId];
      const subtotal = items.reduce((sum, r) => sum + r.amount, 0);
      const fee = platformFee;
      const total = subtotal + shipping;
      const id = `ord-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
      orders.unshift({
        id,
        buyerId: currentUser.id,
        buyerEmail: currentUser.email || "",
        sellerId,
        sellerName: items[0]?.product?.sellerName || "賣家",
        items: items.map((r) => ({ productId: r.product.id, title: r.product.title, price: r.product.price, qty: r.quantity })),
        subtotal,
        shipping,
        platformFee: fee,
        total,
        deliveryMethod,
        status: "pending_payment",
        createdAt: nowIso(),
        updatedAt: nowIso()
      });
      items.forEach((r) => {
        const p = getProductById(r.product.id);
        if (!p) return;
        p.stock = Math.max(0, Number(p.stock || 0) - r.quantity);
        p.updatedAt = nowIso();
        if (p.stock === 0) p.status = "sold";
      });
    });
    currentCart = {};
    saveCart();
    saveData();
    if (checkoutMessage) checkoutMessage.textContent = "已建立訂單，請到會員中心查看付款/待收款狀態。";
    renderProducts();
    renderCart();
    renderSellerOrders();
  }
  function editListing(productId) {
    const item = getProductById(productId);
    if (!item || !currentUser || item.sellerId !== currentUser.id) return;
    const title = prompt("商品名稱", item.title);
    if (!title) return;
    const priceRaw = prompt("價格（NT$）", String(item.price));
    const stockRaw = prompt("庫存", String(item.stock));
    const description = prompt("描述", item.description || "") || "";
    const price = Number(priceRaw);
    const stock = Number(stockRaw);
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(stock) || stock < 0) {
      alert("價格或庫存格式錯誤。");
      return;
    }
    item.title = title.trim();
    item.price = Math.round(price);
    item.stock = Math.round(stock);
    item.description = description.trim();
    item.status = item.stock > 0 ? "active" : "sold";
    item.updatedAt = nowIso();
    saveData();
    renderProducts();
    renderSellerOrders();
  }
  function markListingSold(productId) {
    const item = getProductById(productId);
    if (!item || !currentUser || item.sellerId !== currentUser.id) return;
    item.stock = 0;
    item.status = "sold";
    item.updatedAt = nowIso();
    saveData();
    renderProducts();
    renderSellerOrders();
  }

  async function init() {
    loadData();
    const { data } = await client.auth.getUser();
    currentUser = data?.user || null;
    if (!currentUser) {
      renderProducts();
      if (guestActions) guestActions.style.display = "flex";
      if (loginNote) loginNote.style.display = "none";
      if (memberPanel) memberPanel.style.display = "none";
      if (roleBadge) roleBadge.textContent = "角色：訪客";
      if (cartLoginHint) cartLoginHint.style.display = "block";
      if (cartEmptyText) cartEmptyText.style.display = "none";
      if (cartList) cartList.style.display = "none";
      if (deliveryMethodWrap) deliveryMethodWrap.style.display = "none";
      if (cartSummary) cartSummary.style.display = "none";
      if (cartActions) cartActions.style.display = "none";
      if (sellerPanel) sellerPanel.style.display = "none";
      return;
    }
    currentProfile = await getAdminProfile(currentUser.id);
    const roleText = getRoleText(currentProfile);
    const modeStored = localStorage.getItem(getModeKey(currentUser.id)) || "buyer";
    currentMode = modeStored === "seller" ? "seller" : "buyer";

    if (guestActions) guestActions.style.display = "none";
    if (loginNote) loginNote.style.display = "block";
    if (memberPanel) memberPanel.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (roleBadge) roleBadge.textContent = `角色：${roleText}`;
    if (userEmail) userEmail.textContent = currentUser.email || "";
    if (modeBuyerRadio) modeBuyerRadio.checked = currentMode === "buyer";
    if (modeSellerRadio) modeSellerRadio.checked = currentMode === "seller";
    if (cartLoginHint) cartLoginHint.style.display = "none";
    loadCart();
    updateMemberUi();
    renderProducts();
    renderCart();
    renderSellerOrders();
  }

  listingForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser || !isApprovedAdmin()) return;
    const title = String(document.getElementById("listing-title")?.value || "").trim();
    const price = Number(document.getElementById("listing-price")?.value || 0);
    const stock = Number(document.getElementById("listing-stock")?.value || 0);
    const image = String(document.getElementById("listing-image")?.value || "").trim() || "assets/fjcu-logo.svg";
    const description = String(document.getElementById("listing-description")?.value || "").trim();
    if (!title || price <= 0 || stock <= 0) {
      if (listingFormMessage) listingFormMessage.textContent = "請填寫正確的商品名稱、價格與庫存。";
      return;
    }
    products.unshift({
      id: `prd-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title,
      description: description || "無描述",
      price: Math.round(price),
      imageUrl: image,
      status: "active",
      stock: Math.round(stock),
      sellerId: currentUser.id,
      sellerName: currentUser.email || "賣家",
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
    saveData();
    listingForm.reset();
    if (listingFormMessage) listingFormMessage.textContent = "新增成功，商品已上架。";
    renderProducts();
    renderSellerOrders();
  });

  logoutBtn?.addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.href = "marketplace.html";
  });
  openListingFormBtn?.addEventListener("click", () => {
    if (listingFormPanel) listingFormPanel.style.display = listingFormPanel.style.display === "none" ? "block" : "none";
  });
  openMemberCenterBtn?.addEventListener("click", () => {
    document.getElementById("member-center-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  modeBuyerRadio?.addEventListener("change", () => {
    if (!currentUser || !modeBuyerRadio.checked) return;
    currentMode = "buyer";
    localStorage.setItem(getModeKey(currentUser.id), currentMode);
    updateMemberUi();
    renderProducts();
    renderSellerOrders();
  });
  modeSellerRadio?.addEventListener("change", () => {
    if (!currentUser || !modeSellerRadio.checked) return;
    currentMode = "seller";
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
      editListing(String(editBtn.dataset.productId || ""));
      return;
    }
    const soldBtn = target.closest(".sold-item-btn");
    if (soldBtn instanceof HTMLElement) {
      markListingSold(String(soldBtn.dataset.productId || ""));
    }
  });

  cartList?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement) || !currentUser) return;
    const btn = target.closest("button");
    if (!(btn instanceof HTMLElement)) return;
    const productId = String(btn.dataset.productId || "");
    if (!productId || !currentCart[productId]) return;
    if (btn.classList.contains("cart-dec-btn")) {
      currentCart[productId] = Math.max(0, Number(currentCart[productId]) - 1);
      if (currentCart[productId] === 0) delete currentCart[productId];
    } else if (btn.classList.contains("cart-inc-btn")) {
      const p = getProductById(productId);
      if (!p) return;
      currentCart[productId] = Math.min(Number(currentCart[productId]) + 1, Number(p.stock || 0));
    } else if (btn.classList.contains("cart-remove-btn")) {
      delete currentCart[productId];
    } else {
      return;
    }
    saveCart();
    renderCart();
  });

  document.querySelectorAll('input[name="delivery-method"]').forEach((el) => {
    el.addEventListener("change", () => renderCart());
  });

  checkoutBtn?.addEventListener("click", () => {
    if (!currentUser) { alert("請先登入會員。"); return; }
    if (!getCartRows().length) { alert("購物車目前沒有商品。"); return; }
    createOrdersFromCart();
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
    if (paidBtn) {
      order.status = "pending_shipment";
      order.paidAt = nowIso();
      order.updatedAt = nowIso();
    }
    if (shipBtn) {
      order.status = "completed";
      order.shippedAt = nowIso();
      order.completedAt = nowIso();
      order.updatedAt = nowIso();
    }
    saveData();
    renderSellerOrders();
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
