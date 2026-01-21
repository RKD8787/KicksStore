// ============== CART MODULE ==============

import { showToast } from './ui.js';
import { saveToStorage } from './storage.js';

let cartState = {};

export function setCart(cart) {
    cartState = cart;
}

export function getCart() {
    return cartState;
}

export function addToCart(productId, product) {
    if (cartState[productId]) {
        cartState[productId].quantity++;
    } else {
        cartState[productId] = {
            id: productId,
            title: product.title,
            image: product.image,
            price: product.price,
            quantity: 1
        };
    }
}

export function removeFromCart(productId) {
    delete cartState[productId];
}

export function updateCartQuantity(productId, quantity) {
    if (cartState[productId]) {
        if (quantity > 0) {
            cartState[productId].quantity = quantity;
        } else {
            removeFromCart(productId);
        }
    }
}

export function clearCart() {
    cartState = {};
}

export function getCartTotal() {
    const items = Object.values(cartState);
    let totalPrice = 0;
    items.forEach(function(item) {
        totalPrice += item.price * item.quantity;
    });
    return totalPrice;
}

export function getCartItemCount() {
    const items = Object.values(cartState);
    let totalItems = 0;
    items.forEach(function(item) {
        totalItems += item.quantity;
    });
    return totalItems;
}

export function updateCartUI(cartItemsContainer, cartCountElement, cartTotalAmount) {
    const cartItems = Object.values(cartState);
    
    if (cartCountElement) {
        cartCountElement.textContent = getCartItemCount();
    }
    
    if (cartTotalAmount) {
        cartTotalAmount.textContent = '₹' + getCartTotal().toLocaleString('en-IN');
    }
    
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
    } else {
        cartItems.forEach(function(item) {
            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4>${item.title}</h4>
                        <p>₹${item.price.toLocaleString('en-IN')} x <span class="qty-value" data-id="${item.id}">${item.quantity}</span></p>
                        <p><strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong></p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="qty-decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                            <button class="qty-increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
                        </div>
                        <button class="cart-remove-btn" data-id="${item.id}" aria-label="Remove item from cart">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
        
        attachCartEventListeners(cartItemsContainer);
    }
}

export function attachCartEventListeners(container, onUpdateCallback) {
    container.querySelectorAll('.cart-remove-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
            updateCartUI(container, document.querySelector('.cart-count'), document.getElementById('cart-total-amount'));
            if (onUpdateCallback) onUpdateCallback();
        });
    });

    container.querySelectorAll('.qty-increase').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            if (cartState[productId]) {
                cartState[productId].quantity++;
                updateCartUI(container, document.querySelector('.cart-count'), document.getElementById('cart-total-amount'));
                if (onUpdateCallback) onUpdateCallback();
            }
        });
    });

    container.querySelectorAll('.qty-decrease').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            if (cartState[productId] && cartState[productId].quantity > 1) {
                cartState[productId].quantity--;
                updateCartUI(container, document.querySelector('.cart-count'), document.getElementById('cart-total-amount'));
                if (onUpdateCallback) onUpdateCallback();
            }
        });
    });
}