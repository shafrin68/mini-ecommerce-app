// Product data
const products = [
    { id: 1, name: "Notebook", price: 120, category: "Stationery", icon: "📓" },
    { id: 2, name: "Pen Pack", price: 80, category: "Stationery", icon: "🖊️" },
    { id: 3, name: "Desk Lamp", price: 650, category: "Electronics", icon: "💡" },
    { id: 4, name: "Headphones", price: 899, category: "Electronics", icon: "🎧" },
    { id: 5, name: "Water Bottle", price: 250, category: "Accessories", icon: "🧴" },
    { id: 6, name: "Backpack", price: 799, category: "Accessories", icon: "🎒" },
    { id: 7, name: "Wrist Watch", price: 1200, category: "Accessories", icon: "⌚" },
    { id: 8, name: "Coffee Mug", price: 180, category: "Home", icon: "☕" }
];

// Load saved cart
let cart = {};

try {
    const savedCart = JSON.parse(localStorage.getItem("miniShopCart") || "{}");

    if (
        savedCart &&
        typeof savedCart === "object" &&
        !Array.isArray(savedCart)
    ) {
        products.forEach(function(product) {
            const quantity = savedCart[product.id];

            if (
                Number.isSafeInteger(quantity) &&
                quantity > 0 &&
                quantity <= 999
            ) {
                cart[product.id] = quantity;
            }
        });
    }
} catch (error) {
    cart = {};
}

// HTML elements
const productsContainer = document.getElementById("products");
const cartContainer = document.getElementById("cart-items");
const emptyMessage = document.getElementById("empty-message");
const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const totalElement = document.getElementById("total");
const checkoutButton = document.getElementById("checkout-btn");

const checkoutDialog = document.getElementById("checkout-dialog");
const checkoutMessage = document.getElementById("checkout-message");
const checkoutTotal = document.getElementById("checkout-total");
const closeDialogButton = document.getElementById("close-dialog");

// Format price in Indian Rupees
function formatMoney(amount) {
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });
}

// Display product cards
function renderProducts() {
    productsContainer.replaceChildren();

    products.forEach(function(product) {
        const card = document.createElement("article");
        card.className = "product-card";

        const icon = document.createElement("div");
        icon.className = "product-icon";
        icon.textContent = product.icon;

        const name = document.createElement("h3");
        name.textContent = product.name;

        const category = document.createElement("p");
        category.className = "category";
        category.textContent = product.category;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = formatMoney(product.price);

        const button = document.createElement("button");
        button.className = "add-btn";
        button.textContent = "Add to Cart";
        button.dataset.productId = product.id;

        card.append(icon, name, category, price, button);
        productsContainer.appendChild(card);
    });
}

// Add product to cart
function addToCart(id) {
    const product = products.find(function(item) {
        return item.id === id;
    });

    if (!product) return;

    const currentQuantity = cart[id] || 0;

    if (currentQuantity >= 999) {
        alert("Maximum quantity reached.");
        return;
    }

    cart[id] = currentQuantity + 1;
    saveCart();
}

// Change quantity
function changeQuantity(id, delta) {
    const newQuantity = (cart[id] || 0) + delta;

    if (newQuantity <= 0) {
        delete cart[id];
    } else if (newQuantity <= 999) {
        cart[id] = newQuantity;
    }

    saveCart();
}

// Remove product
function removeItem(id) {
    delete cart[id];
    saveCart();
}

// Calculate subtotal, delivery and total
function calculateTotals() {
    const subtotal = Object.keys(cart).reduce(function(sum, id) {
        const product = products.find(function(item) {
            return item.id === Number(id);
        });

        if (!product) return sum;

        return sum + product.price * cart[id];
    }, 0);

    const delivery = subtotal > 0 && subtotal < 500 ? 40 : 0;

    return {
        subtotal: subtotal,
        delivery: delivery,
        total: subtotal + delivery
    };
}

// Save cart and update display
function saveCart() {
    localStorage.setItem("miniShopCart", JSON.stringify(cart));
    renderCart();
}

// Display shopping cart
function renderCart() {
    cartContainer.replaceChildren();

    const itemIds = Object.keys(cart);
    const hasItems = itemIds.length > 0;

    emptyMessage.hidden = hasItems;
    checkoutButton.disabled = !hasItems;

    itemIds.forEach(function(id) {
        const product = products.find(function(item) {
            return item.id === Number(id);
        });

        if (!product) return;

        const item = document.createElement("div");
        item.className = "cart-item";

        const details = document.createElement("div");

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = formatMoney(product.price) + " each";

        details.append(name, price);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const decreaseButton = document.createElement("button");
        decreaseButton.className = "quantity-btn";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute(
            "aria-label",
            "Decrease " + product.name + " quantity"
        );
        decreaseButton.dataset.action = "decrease";
        decreaseButton.dataset.productId = id;

        const quantity = document.createElement("span");
        quantity.textContent = cart[id];

        const increaseButton = document.createElement("button");
        increaseButton.className = "quantity-btn";
        increaseButton.textContent = "+";
        increaseButton.setAttribute(
            "aria-label",
            "Increase " + product.name + " quantity"
        );
        increaseButton.dataset.action = "increase";
        increaseButton.dataset.productId = id;

        controls.append(
            decreaseButton,
            quantity,
            increaseButton
        );

        const lineTotal = document.createElement("p");
        lineTotal.textContent = formatMoney(
            product.price * cart[id]
        );

        const removeButton = document.createElement("button");
        removeButton.className = "remove-btn";
        removeButton.textContent = "Remove";
        removeButton.dataset.action = "remove";
        removeButton.dataset.productId = id;

        const itemControls = document.createElement("div");
        itemControls.append(controls, lineTotal, removeButton);

        item.append(details, itemControls);
        cartContainer.appendChild(item);
    });

    const totals = calculateTotals();

    subtotalElement.textContent = formatMoney(totals.subtotal);
    deliveryElement.textContent = formatMoney(totals.delivery);
    totalElement.textContent = formatMoney(totals.total);
}

// Handle Add to Cart buttons
productsContainer.addEventListener("click", function(event) {
    const button = event.target.closest("[data-product-id]");

    if (!button) return;

    addToCart(Number(button.dataset.productId));
});

// Handle cart quantity and remove buttons
cartContainer.addEventListener("click", function(event) {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.productId);

    if (button.dataset.action === "increase") {
        changeQuantity(id, 1);
    } else if (button.dataset.action === "decrease") {
        changeQuantity(id, -1);
    } else if (button.dataset.action === "remove") {
        removeItem(id);
    }
});

// Checkout preview
checkoutButton.addEventListener("click", function() {
    const totals = calculateTotals();
    const itemCount = Object.values(cart).reduce(function(sum, quantity) {
        return sum + quantity;
    }, 0);

    checkoutMessage.textContent =
        "You have " + itemCount + " item(s) in your cart.";

    checkoutTotal.textContent =
        "Order total: " + formatMoney(totals.total);

    checkoutDialog.showModal();
});

// Close checkout dialog
closeDialogButton.addEventListener("click", function() {
    checkoutDialog.close();
});

// Initial display
renderProducts();
renderCart();
