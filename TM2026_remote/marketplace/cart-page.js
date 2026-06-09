(() => {
  const store = window.MarketplaceStore;
  const authApi = window.MarketplaceAuth;
  if (!store || !authApi) return;

  const ASSET_PREFIX = "../";
  const tableWrap = document.getElementById("cart-table-wrap");
  const emptyEl = document.getElementById("cart-empty");
  const loginHint = document.getElementById("cart-login-hint");
  const summaryEl = document.getElementById("cart-summary");
  const deliveryWrap = document.getElementById("cart-delivery-wrap");
  const checkoutBtn = document.getElementById("cart-checkout-btn");
  const messageEl = document.getElementById("cart-message");
  const headerEmail = document.getElementById("cart-header-email");
  const logoutBtn = document.getElementById("cart-logout-btn");
  const cartBadge = document.getElementById("header-cart-count");

  let currentUser = null;
  let products = [];
  let orders = [];
  let cart = {};

  function showMessage(text, ok) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.style.color = ok ? "#1e6b4a" : "#b65e5e";
  }

  function updateHeaderBadge() {
    if (!cartBadge) return;
    const count = store.countCartItems(cart, products);
    cartBadge.textContent = String(count);
    cartBadge.hidden = count <= 0;
  }

  function getDeliveryMethod() {
    return document.querySelector('input[name="delivery-method"]:checked')?.value || "meetup";
  }

  function renderSummary() {
    const rows = store.getCartRows(cart, products);
    const shipping = getDeliveryMethod() === "shipping" ? store.SHIPPING_FEE : 0;
    const subtotal = rows.reduce((sum, r) => sum + r.amount, 0);
    const total = subtotal + shipping;
    if (deliveryWrap) deliveryWrap.style.display = rows.length ? "block" : "none";
    if (checkoutBtn) checkoutBtn.disabled = !rows.length;
    if (summaryEl) {
      summaryEl.innerHTML = rows.length
        ? `共 ${rows.length} 項商品<br>商品小計：${store.formatPrice(subtotal)}<br>運費：${store.formatPrice(shipping)}<br><strong style="font-size:1.15em;color:var(--primary,#075985);">應付總額：${store.formatPrice(total)}</strong>`
        : "";
    }
    updateHeaderBadge();
  }

  function renderCartTable() {
    const rows = store.getCartRows(cart, products);
    if (!tableWrap || !emptyEl) return;
    if (!rows.length) {
      tableWrap.innerHTML = "";
      tableWrap.style.display = "none";
      emptyEl.style.display = "block";
      renderSummary();
      return;
    }
    emptyEl.style.display = "none";
    tableWrap.style.display = "block";
    tableWrap.innerHTML = `
      <table class="mp-cart-table">
        <thead>
          <tr>
            <th>圖片</th>
            <th>品項</th>
            <th>單價</th>
            <th>數量</th>
            <th>小計</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => {
            const img = store.escapeHtml(store.resolveProductImageUrl(row.product, ASSET_PREFIX));
            return `
              <tr>
                <td class="mp-cart-table__img"><img src="${img}" alt=""></td>
                <td class="mp-cart-table__title">${store.escapeHtml(row.product.title)}</td>
                <td>${store.formatPrice(row.product.price)}</td>
                <td>
                  <div class="mp-cart-qty">
                    <button type="button" class="mp-cart-qty__btn cart-dec-btn" data-product-id="${row.product.id}">−</button>
                    <span>${row.quantity}</span>
                    <button type="button" class="mp-cart-qty__btn cart-inc-btn" data-product-id="${row.product.id}">+</button>
                  </div>
                </td>
                <td class="mp-cart-table__subtotal">${store.formatPrice(row.amount)}</td>
                <td><button type="button" class="mp-cart-remove cart-remove-btn" data-product-id="${row.product.id}" aria-label="移除">×</button></td>
              </tr>`;
          }).join("")}
        </tbody>
      </table>`;
    renderSummary();
  }

  function persistCart() {
    if (!currentUser) return;
    store.writeCart(currentUser.id, cart);
    updateHeaderBadge();
  }

  function checkout() {
    const rows = store.getCartRows(cart, products);
    if (!rows.length || !currentUser) return;
    const deliveryMethod = getDeliveryMethod();
    const shipping = deliveryMethod === "shipping" ? store.SHIPPING_FEE : 0;
    const grouped = {};
    rows.forEach((row) => {
      const key = row.product.sellerId;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });
    Object.keys(grouped).forEach((sellerId) => {
      const items = grouped[sellerId];
      const subtotal = items.reduce((sum, r) => sum + r.amount, 0);
      const total = subtotal + shipping;
      orders.unshift({
        id: `ord-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
        buyerId: currentUser.id,
        buyerEmail: currentUser.email || "",
        sellerId,
        sellerName: items[0]?.product?.sellerName || "賣家",
        items: items.map((r) => ({
          productId: r.product.id,
          title: r.product.title,
          price: r.product.price,
          qty: r.quantity,
        })),
        subtotal,
        shipping,
        platformFee: store.getPlatformFee(),
        total,
        deliveryMethod,
        status: "pending_shipment",
        createdAt: store.nowIso(),
        updatedAt: store.nowIso(),
      });
      items.forEach((r) => {
        const p = store.getProductById(products, r.product.id);
        if (!p) return;
        p.stock = Math.max(0, Number(p.stock || 0) - r.quantity);
        p.updatedAt = store.nowIso();
        if (p.stock === 0) p.status = "sold";
      });
    });
    cart = {};
    persistCart();
    store.saveProducts(products);
    store.saveOrders(orders);
    window.dispatchEvent(new CustomEvent("marketplace-orders-updated"));
    showMessage("已建立訂單，賣家將收到待出貨通知。", true);
    renderCartTable();
  }

  tableWrap?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement) || !currentUser) return;
    const btn = target.closest("button");
    if (!(btn instanceof HTMLElement)) return;
    const productId = String(btn.dataset.productId || "");
    if (!productId) return;
    if (btn.classList.contains("cart-dec-btn")) {
      cart[productId] = Math.max(0, Number(cart[productId] || 0) - 1);
      if (cart[productId] === 0) delete cart[productId];
    } else if (btn.classList.contains("cart-inc-btn")) {
      const p = store.getProductById(products, productId);
      if (!p) return;
      cart[productId] = Math.min(Number(cart[productId] || 0) + 1, Number(p.stock || 0));
    } else if (btn.classList.contains("cart-remove-btn")) {
      delete cart[productId];
    } else {
      return;
    }
    persistCart();
    renderCartTable();
  });

  document.querySelectorAll('input[name="delivery-method"]').forEach((el) => {
    el.addEventListener("change", renderSummary);
  });

  checkoutBtn?.addEventListener("click", checkout);

  document.getElementById("cart-back-marketplace")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.assign("/marketplace.html");
  });

  logoutBtn?.addEventListener("click", async () => {
    await authApi.signOut();
    location.href = "login.html?next=/marketplace/cart.html";
  });

  (async function init() {
    products = store.loadProducts();
    orders = store.loadOrders();
    const boot = await authApi.bootstrapFromSupabase();
    currentUser = boot?.user || null;
    if (!currentUser) {
      if (loginHint) loginHint.style.display = "block";
      if (tableWrap) tableWrap.style.display = "none";
      if (emptyEl) emptyEl.style.display = "none";
      if (deliveryWrap) deliveryWrap.style.display = "none";
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }
    if (loginHint) loginHint.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    const profile = boot?.profile || {};
    const session = boot?.session || {};
    const displayName = String(profile.display_name || session.displayName || "").trim();
    if (headerEmail) {
      headerEmail.textContent = displayName
        ? `${displayName}（${currentUser.email || ""}）`
        : (currentUser.email || "");
    }
    cart = store.readCart(currentUser.id);
    renderCartTable();
  })();
})();
