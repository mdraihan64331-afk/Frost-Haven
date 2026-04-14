// ---------- PRODUCT DATA ----------
const products = [
  { id: 1, name: "Arctic Stone Mug", price: 28.99, icon: "fa-mug-hot" },
  { id: 2, name: "Nordic Wool Blanket", price: 79.0, icon: "fa-bed" },
  { id: 3, name: "Minimalist Backpack", price: 64.5, icon: "fa-bag-shopping" },
  { id: 4, name: "Cedarwood Candle", price: 24.99, icon: "fa-candle-holder" },
  { id: 5, name: "Botanical Planter", price: 32.0, icon: "fa-seedling" },
  {
    id: 6,
    name: "Wireless Charger",
    price: 39.95,
    icon: "fa-charging-station",
  },
];

// CART STATE
let cart = [];

// DOM elements
const productsContainer = document.getElementById("productsContainer");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const cartCountBadge = document.getElementById("cartCountBadge");
const cartItemsList = document.getElementById("cartItemsList");
const cartTotalSpan = document.getElementById("cartTotalPrice");
const toastEl = document.getElementById("globalToast");

// Helper: show toast
function showToast(message, isError = false) {
  toastEl.textContent = message;
  toastEl.style.backgroundColor = isError ? "#bc3f2e" : "#1f3d34";
  toastEl.style.opacity = "1";
  setTimeout(() => {
    toastEl.style.opacity = "0";
  }, 2200);
}

// Update cart UI (badge, items, total)
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountBadge.textContent = totalItems;

  if (!cartItemsList) return;
  if (cart.length === 0) {
    cartItemsList.innerHTML = `<div class="empty-cart"><i class="fas fa-bag-shopping"></i><br>Your cart is empty</div>`;
    cartTotalSpan.textContent = `$0.00`;
    return;
  }

  let itemsHtml = "";
  let total = 0;
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    itemsHtml += `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          </div>
          <div class="item-actions">
            <button class="decr-item" data-id="${item.id}">−</button>
            <span style="min-width: 24px; text-align: center; font-weight:500;">${item.quantity}</span>
            <button class="incr-item" data-id="${item.id}">+</button>
            <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      `;
  });
  cartItemsList.innerHTML = itemsHtml;
  cartTotalSpan.textContent = `$${total.toFixed(2)}`;

  // attach events to dynamic buttons
  document.querySelectorAll(".incr-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.getAttribute("data-id"));
      updateQuantity(id, 1);
    });
  });
  document.querySelectorAll(".decr-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.getAttribute("data-id"));
      updateQuantity(id, -1);
    });
  });
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.getAttribute("data-id"));
      removeItemCompletely(id);
    });
  });
}

function updateQuantity(productId, delta) {
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      cart = cart.filter((item) => item.id !== productId);
      showToast(`Removed from cart`);
    } else {
      existing.quantity = newQty;
      showToast(`Cart updated`);
    }
  } else if (delta > 0) {
    const product = products.find((p) => p.id === productId);
    if (product)
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    showToast(`${product?.name} added`);
  }
  updateCartUI();
  saveCartToLocal();
}

function removeItemCompletely(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
  saveCartToLocal();
  showToast(`Item removed`);
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
    showToast(`+1 ${product.name}`);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    showToast(`${product.name} added to cart`);
  }
  updateCartUI();
  saveCartToLocal();
}

function saveCartToLocal() {
  localStorage.setItem("responsiveEcomCart", JSON.stringify(cart));
}
function loadCartFromLocal() {
  const stored = localStorage.getItem("responsiveEcomCart");
  if (stored) {
    try {
      cart = JSON.parse(stored);
      if (!Array.isArray(cart)) cart = [];
    } catch (e) {
      cart = [];
    }
  } else cart = [];
  updateCartUI();
}

// Render product grid
function renderProducts() {
  if (!productsContainer) return;
  productsContainer.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <div class="product-img">
          <i class="fas ${product.icon}" style="font-size: 3rem;"></i>
        </div>
        <div class="product-title">${product.name}</div>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <button class="add-to-cart" data-id="${product.id}">
          <i class="fas fa-cart-plus"></i> Add to cart
        </button>
      `;
    productsContainer.appendChild(card);
  });
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute("data-id"));
      addToCart(id);
    });
  });
}

// Cart sidebar toggle - improved for mobile
function openCart() {
  cartSidebar.style.right = "0";
  cartOverlay.style.visibility = "visible";
  cartOverlay.style.opacity = "1";
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartSidebar.style.right = "-100%";
  cartOverlay.style.visibility = "hidden";
  cartOverlay.style.opacity = "0";
  document.body.style.overflow = "";
}

function handleCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty! Add some items first.", true);
    return;
  }
  const total = cart
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
    .toFixed(2);
  showToast(`🎉 Order placed! Total $${total}. Thank you for shopping!`, false);
  cart = [];
  updateCartUI();
  saveCartToLocal();
  closeCart();
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  loadCartFromLocal();

  const cartIconBtn = document.getElementById("cartIconBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const shopNowBtn = document.getElementById("shopNowBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (cartIconBtn) cartIconBtn.addEventListener("click", openCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
  if (checkoutBtn) checkoutBtn.addEventListener("click", handleCheckout);
  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", () => {
      document
        .querySelector(".products-grid")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
});
