/**
 * 賣場商品／購物車／訂單 — 本機儲存共用模組
 */
(function () {
  const MARKET_PRODUCTS_KEY = "marketplace_products_v2";
  const MARKET_ORDERS_KEY = "marketplace_orders_v2";
  const MARKET_FEE_KEY = "marketplace_platform_fee_v1";
  const MARKET_IMAGES_KEY = "marketplace_product_images_v1";
  const IMAGE_REF_PREFIX = "mpimg:";
  const DEFAULT_PRODUCT_IMAGE = "images/logo-immba-icon.svg";
  const DEFAULT_FEE = 4;
  const SHIPPING_FEE = 80;

  const seedProducts = [
    { id: "b8782051-97e4-4354-af89-445cc8025b6d", title: "全新藍芽耳機 imMBA 畢業生紀念品", description: "無描述", price: 3500, imageUrl: "https://res.cloudinary.com/dsvs6hyix/image/upload/v1777275193/uhazt7trcd4urt3uo1va.png", status: "active", stock: 1, sellerId: "seed-admin", sellerName: "平台賣家", createdAt: "2026-04-27T07:33:15.879Z", updatedAt: "2026-04-27T07:33:15.879Z" },
    { id: "1e067370-68d1-4907-8773-2e510d2aab4f", title: "imMBA 專屬筆記型電腦 全新", description: "全新電腦", price: 25000, imageUrl: "https://res.cloudinary.com/dsvs6hyix/image/upload/v1777275098/pgg0aret7ic3brfca3k3.png", status: "active", stock: 1, sellerId: "seed-admin", sellerName: "平台賣家", createdAt: "2026-04-27T07:31:41.762Z", updatedAt: "2026-04-27T07:31:41.762Z" },
    { id: "0566811b-a24a-4374-ac59-56d27274ef5b", title: "imMBA 二手平板", description: "學長姐二手平板電腦", price: 5000, imageUrl: "https://res.cloudinary.com/dsvs6hyix/image/upload/v1777275015/diqi0qj3mhmuermqvsik.png", status: "active", stock: 1, sellerId: "seed-admin", sellerName: "平台賣家", createdAt: "2026-04-27T07:30:18.754Z", updatedAt: "2026-04-27T07:30:18.754Z" },
    { id: "e690aeaf-4407-404c-bac9-37e0ac564bae", title: "imMBA 手持風扇", description: "全新 2026 畢業生紀念款", price: 800, imageUrl: "https://res.cloudinary.com/dsvs6hyix/image/upload/v1777275532/lncgxtjutjabyc9no8cc.png", status: "active", stock: 1, sellerId: "seed-admin", sellerName: "平台賣家", createdAt: "2026-04-20T09:58:13.194Z", updatedAt: "2026-04-20T09:58:13.194Z" },
  ];

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

  function getCartKey(userId) {
    return `marketplace_cart_${userId}`;
  }

  function formatPrice(val) {
    return `NT$ ${Number(val || 0).toLocaleString("zh-TW")}`;
  }

  function escapeHtml(val) {
    return String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readImageMap() {
    return safeParse(MARKET_IMAGES_KEY, {});
  }

  function resolveProductImageUrl(productOrUrl, assetPrefix) {
    const prefix = assetPrefix || "";
    const raw = String(
      typeof productOrUrl === "string" ? productOrUrl : productOrUrl?.imageUrl || ""
    ).trim();
    if (!raw) return prefix + DEFAULT_PRODUCT_IMAGE;
    if (raw.startsWith(IMAGE_REF_PREFIX)) {
      const id = raw.slice(IMAGE_REF_PREFIX.length);
      return readImageMap()[id] || prefix + DEFAULT_PRODUCT_IMAGE;
    }
    if (raw.startsWith("http") || raw.startsWith("data:") || raw.startsWith("/")) return raw;
    return prefix + raw;
  }

  function loadProducts() {
    let products = safeParse(MARKET_PRODUCTS_KEY, []);
    if (!Array.isArray(products) || products.length === 0) products = [...seedProducts];
    return products;
  }

  function saveProducts(products) {
    localStorage.setItem(MARKET_PRODUCTS_KEY, JSON.stringify(products));
  }

  function loadOrders() {
    const orders = safeParse(MARKET_ORDERS_KEY, []);
    return Array.isArray(orders) ? orders : [];
  }

  function saveOrders(orders) {
    localStorage.setItem(MARKET_ORDERS_KEY, JSON.stringify(orders));
  }

  function getPlatformFee() {
    const feeRaw = Number(localStorage.getItem(MARKET_FEE_KEY));
    return Number.isFinite(feeRaw) && feeRaw >= 0 ? feeRaw : DEFAULT_FEE;
  }

  function readCart(userId) {
    const parsed = safeParse(getCartKey(userId), {});
    return parsed && typeof parsed === "object" ? parsed : {};
  }

  function writeCart(userId, cart) {
    localStorage.setItem(getCartKey(userId), JSON.stringify(cart));
  }

  function getProductById(products, id) {
    return products.find((p) => p.id === id) || null;
  }

  function getCartRows(cart, products) {
    return Object.entries(cart)
      .map(([productId, qty]) => {
        const product = getProductById(products, productId);
        const quantity = Number(qty || 0);
        if (!product || product.status !== "active" || quantity <= 0) return null;
        const q = Math.min(quantity, product.stock || 0);
        return { product, quantity: q, amount: product.price * q };
      })
      .filter(Boolean);
  }

  function countCartItems(cart, products) {
    return getCartRows(cart, products).reduce((sum, row) => sum + row.quantity, 0);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  window.MarketplaceStore = {
    MARKET_PRODUCTS_KEY,
    MARKET_ORDERS_KEY,
    DEFAULT_PRODUCT_IMAGE,
    SHIPPING_FEE,
    safeParse,
    getCartKey,
    formatPrice,
    escapeHtml,
    resolveProductImageUrl,
    loadProducts,
    saveProducts,
    loadOrders,
    saveOrders,
    getPlatformFee,
    readCart,
    writeCart,
    getProductById,
    getCartRows,
    countCartItems,
    nowIso,
  };
})();
