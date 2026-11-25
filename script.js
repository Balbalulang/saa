/* Skate Shop — frontend-only interactions. Data is stored in this browser. */
const CART_KEY = "skateShopCart";
const MESSAGES_KEY = "skateShopMessages";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

const money = amount => new Intl.NumberFormat("en-PH", {
  style: "currency", currency: "PHP", minimumFractionDigits: 2
}).format(amount);

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}
function showToast(message) {
  document.getElementById("toastMessage").textContent = message;
  bootstrap.Toast.getOrCreateInstance(document.getElementById("siteToast"), { delay: 2300 }).show();
}
function addToCart(button) {
  const id = button.dataset.id;
  const item = cart.find(product => product.id === id);
  if (item) item.quantity += 1;
  else cart.push({ id, name: button.dataset.name, price: Number(button.dataset.price), quantity: 1 });
  saveCart();
  showToast(`${button.dataset.name} added to your cart.`);
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);
  const container = document.getElementById("cartItems");
  if (!cart.length) {
    container.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-row">
      <div><strong>${escapeHTML(item.name)}</strong><small>${item.quantity} × ${money(item.price)}</small></div>
      <div class="text-end"><strong>${money(item.price * item.quantity)}</strong>
        <button class="remove-item" data-remove="${item.id}" aria-label="Remove ${escapeHTML(item.name)}"><i class="bi bi-trash3"></i></button>
      </div>
    </div>`).join("");
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

document.querySelectorAll(".add-cart").forEach(button => {
  button.addEventListener("click", () => addToCart(button));
});
document.getElementById("cartItems").addEventListener("click", event => {
  const removeButton = event.target.closest("[data-remove]");
  if (!removeButton) return;
  cart = cart.filter(item => item.id !== removeButton.dataset.remove);
  saveCart();
});
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) return showToast("Your cart is empty.");
  showToast("This is a frontend demo. Checkout is not connected to payments.");
});

const carousel = document.getElementById("categoryCarousel");
document.getElementById("categoryPrev").addEventListener("click", () => carousel.scrollBy({ left: -240, behavior: "smooth" }));
document.getElementById("categoryNext").addEventListener("click", () => carousel.scrollBy({ left: 240, behavior: "smooth" }));

// Pointer/touch drag-to-scroll category carousel.
let isDown = false, startX = 0, scrollStart = 0, dragged = false;
carousel.addEventListener("pointerdown", event => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  isDown = true; dragged = false; startX = event.clientX; scrollStart = carousel.scrollLeft;
  carousel.classList.add("dragging");
});
window.addEventListener("pointerup", () => { isDown = false; carousel.classList.remove("dragging"); });
carousel.addEventListener("pointermove", event => {
  if (!isDown) return;
  const delta = event.clientX - startX;
  if (Math.abs(delta) > 5) dragged = true;
  carousel.scrollLeft = scrollStart - delta;
});
carousel.addEventListener("click", event => {
  if (dragged) { event.preventDefault(); event.stopPropagation(); }
}, true);

document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", () => {
    const category = card.dataset.category;
    const input = document.getElementById("searchInput");
    input.value = category === "Apparel" || category === "Wheels" ? "" : category;
    filterProducts(input.value);
    if (category === "Apparel" || category === "Wheels") showToast(`${category} products will be added to the catalog soon.`);
  });
});

function filterProducts(query) {
  const normalized = query.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll(".product-column").forEach(card => {
    const matches = !normalized || card.dataset.name.toLowerCase().includes(normalized) || card.dataset.category.toLowerCase().includes(normalized);
    card.classList.toggle("d-none", !matches);
    if (matches) visible++;
  });
  document.getElementById("emptySearch").classList.toggle("d-none", visible !== 0);
}
document.getElementById("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  filterProducts(document.getElementById("searchInput").value);
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("searchInput").addEventListener("input", event => filterProducts(event.target.value));

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
  messages.push({
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    message: form.elements.message.value.trim(),
    sentAt: new Date().toISOString()
  });
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  form.reset();
  showToast("Message saved in this browser. Thanks for reaching out!");
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});
document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => document.getElementById("mainNav").classList.remove("open"));
});
document.getElementById("year").textContent = new Date().getFullYear();
renderCart();
