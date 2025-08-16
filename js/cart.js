// Simple and Working Cart System
class SimpleCart {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        this.loadCart();
        this.bindEvents();
        this.updateCartUI();
        console.log('Simple Cart initialized');
    }

    bindEvents() {
        // Add to cart buttons
        $(document).on('click', '.btn-cart', (e) => {
            e.preventDefault();
            this.addToCartFromButton(e.target);
        });

        // Remove from cart
        $(document).on('click', '.remove-from-cart', (e) => {
            e.preventDefault();
            const productId = $(e.target).closest('.cart-item').data('product-id');
            this.removeFromCart(productId);
        });

        // Update quantity
        $(document).on('change', '.cart-quantity', (e) => {
            const productId = $(e.target).closest('.cart-item').data('product-id');
            const quantity = parseInt($(e.target).val());
            this.updateQuantity(productId, quantity);
        });

        // Cart icon click
        $(document).on('click', '[data-bs-target="#offcanvasCart"]', (e) => {
            e.preventDefault();
            this.showCart();
        });

        // Checkout button
        $(document).on('click', '.checkout-btn', (e) => {
            e.preventDefault();
            this.handleCheckout();
        });

        // Clear cart button
        $(document).on('click', '.clear-cart-btn', (e) => {
            e.preventDefault();
            this.clearCart();
        });

        // My Account button in cart
        $(document).on('click', '.my-account-btn', (e) => {
            e.preventDefault();
            $('#offcanvasCart').offcanvas('hide');
            window.location.href = 'my-account.html';
        });
    }

    addToCartFromButton(button) {
        // Check if user is logged in
        if (!this.isUserLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        // Get product info from the button's parent container
        const productContainer = $(button).closest('.product-item, .card, .swiper-slide');
        
        if (productContainer.length === 0) {
            console.log('No product container found');
            return;
        }

        // Extract product information
        const product = {
            id: this.generateProductId(productContainer),
            name: this.getProductName(productContainer),
            price: this.getProductPrice(productContainer),
            image: this.getProductImage(productContainer),
            quantity: this.getProductQuantity(productContainer)
        };

        console.log('Adding product to cart:', product);

        if (product.name && product.price > 0) {
            this.addToCart(product);
            this.showSuccessMessage(`${product.name} added to cart!`);
        } else {
            this.showErrorMessage('Could not add product to cart');
        }
    }

    isUserLoggedIn() {
        return window.authSystem && window.authSystem.isAuthenticated();
    }

    generateProductId(container) {
        const name = this.getProductName(container);
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    }

    getProductName(container) {
        // Try multiple selectors for product name
        let name = container.find('h3, h4, h5, h6, .product-name').first().text().trim();
        if (!name) {
            name = container.find('[class*="title"]').first().text().trim();
        }
        return name || 'Organic Product';
    }

    getProductPrice(container) {
        // Look for price in fw-semibold class (current price)
        let price = container.find('.fw-semibold').first().text().trim();
        if (price) {
            price = parseFloat(price.replace('$', ''));
            if (!isNaN(price)) return price;
        }

        // Look for any text with $ symbol
        const priceText = container.find('span:contains("$")').first().text().trim();
        if (priceText) {
            price = parseFloat(priceText.replace('$', ''));
            if (!isNaN(price)) return price;
        }

        return 9.99; // Default price
    }

    getProductImage(container) {
        const img = container.find('img').first();
        return img.attr('src') || 'images/product-thumb-1.png';
    }

    getProductQuantity(container) {
        const quantityInput = container.find('input[type="number"], .quantity').first();
        return quantityInput.length > 0 ? parseInt(quantityInput.val()) || 1 : 1;
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            this.cart.push(product);
        }

        this.saveCart();
        this.updateCartUI();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.showSuccessMessage('Item removed from cart!');
    }

    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartUI();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.showSuccessMessage('Cart cleared!');
    }

    saveCart() {
        localStorage.setItem('organic_cart', JSON.stringify(this.cart));
    }

    loadCart() {
        const savedCart = localStorage.getItem('organic_cart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
            } catch (e) {
                this.cart = [];
            }
        }
    }

    updateCartUI() {
        // Update cart count badge
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        $('.cart-badge').text(totalItems);

        // Update cart content
        this.updateCartContent();
        
        // Update cart total
        this.updateCartTotal();
    }

    updateCartContent() {
        const cartList = $('#offcanvasCart .list-group');
        
        if (this.cart.length === 0) {
            cartList.html('<li class="list-group-item text-center text-muted">Your cart is empty</li>');
            return;
        }

        let cartHTML = '';
        this.cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            cartHTML += `
                <li class="list-group-item cart-item" data-product-id="${item.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" class="rounded me-3" width="50" height="50" style="object-fit: cover;">
                            <div>
                                <h6 class="my-0">${item.name}</h6>
                                <small class="text-body-secondary">$${item.price.toFixed(2)} each</small>
                                <div class="fw-bold text-primary">$${itemTotal}</div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <input type="number" class="form-control cart-quantity" value="${item.quantity}" min="1" style="width: 60px;">
                            <button class="btn btn-sm btn-outline-danger remove-from-cart">
                                <svg width="16" height="16"><use xlink:href="#trash"></use></svg>
                            </button>
                        </div>
                    </div>
                </li>
            `;
        });

        cartList.html(cartHTML);
    }

    updateCartTotal() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElement = $('#offcanvasCart .list-group-item:last-child strong');
        
        if (totalElement.length > 0) {
            totalElement.text(`$${total.toFixed(2)}`);
        }
    }

    showCart() {
        // Cart is already shown by Bootstrap offcanvas
        console.log('Cart shown, items:', this.cart.length);
    }

    handleCheckout() {
        if (this.cart.length === 0) {
            this.showErrorMessage('Your cart is empty!');
            return;
        }

        if (!this.isUserLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        // Show checkout modal
        this.showCheckoutModal();
    }

    showCheckoutModal() {
        // Populate order summary
        this.populateCheckoutSummary();
        
        // Show modal
        $('#checkoutModal').modal('show');
    }

    populateCheckoutSummary() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 5.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        let summaryHTML = '<div class="border rounded p-3">';
        
        this.cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            summaryHTML += `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>${item.name} x${item.quantity}</span>
                    <span>$${itemTotal}</span>
                </div>
            `;
        });

        summaryHTML += `
            <hr>
            <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>`;

        $('#checkoutOrderSummary').html(summaryHTML);
    }

    showSuccessMessage(message) {
        // Simple success message
        alert(message);
    }

    showErrorMessage(message) {
        // Simple error message
        alert('Error: ' + message);
    }
}

// Initialize cart when document is ready
$(document).ready(() => {
    window.shoppingCart = new SimpleCart();
}); 