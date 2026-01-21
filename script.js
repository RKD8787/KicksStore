// ============== MAIN ENTRY POINT ==============

import { loadFromStorage, saveToStorage, deepClone } from './modules/storage.js';
import { showToast, addCSSAnimations } from './modules/ui.js';
import { 
    validateField, 
    getPasswordStrength, 
    setupPasswordToggle 
} from './modules/validation.js';
import { 
    setCart, 
    getCart, 
    addToCart, 
    removeFromCart, 
    updateCartUI, 
    getCartTotal,
    clearCart 
} from './modules/cart.js';
import { setupDrawerTriggers, openDrawer, closeDrawer } from './modules/drawer.js';

// Global app state
let appState = loadFromStorage();
let userDatabase = appState.users;
let currentUser = appState.currentUser;
let cart = appState.cart || {};

setCart(cart);

let loginSubmitting = false;
let signupSubmitting = false;
let profileSubmitting = false;
let checkoutSubmitting = false;

// Save application state
function saveAppState() {
    appState = {
        users: userDatabase,
        currentUser: currentUser,
        cart: getCart()
    };
    saveToStorage(appState);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    addCSSAnimations();
    
    // ============== CART SYSTEM ==============
    const cartTrigger = document.querySelector('.cart-trigger');
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cartCountElement = document.querySelector('.cart-count');
    
    setupDrawerTriggers('.cart-trigger', '.cart-drawer', '.cart-overlay', '.cart-close-btn');
    
    // ============== FILTER SYSTEM ==============
    setupDrawerTriggers('.filter-trigger', '.filter-drawer', '.filter-overlay', '.filter-close-btn');
    
    // ============== USER SYSTEM ==============
    setupDrawerTriggers('.profile-icon', '.user-drawer', '.user-overlay', '.user-close-btn');
    
    const userTrigger = document.querySelector('.profile-icon');
    const userDrawer = document.querySelector('.user-drawer');
    const userOverlay = document.querySelector('.user-overlay');
    
    if (userTrigger) {
        userTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            openDrawer(userDrawer, userOverlay);
            updateUserInterface();
        });
    }
    // ============== USER MENU NAVIGATION ==============
const userMenuItems = document.querySelectorAll('.user-menu-item[data-section]');

userMenuItems.forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;

        // Hide main menu
        document.getElementById('user-logged-in').style.display = 'none';

        // Hide all sub sections
        document.getElementById('my-orders-section').style.display = 'none';
        document.getElementById('profile-section').style.display = 'none';

        if (section === 'orders') {
            document.getElementById('my-orders-section').style.display = 'block';
            renderOrders();
        }

        if (section === 'profile') {
            document.getElementById('profile-section').style.display = 'block';
            populateProfile();
        }
    });
});
function populateProfile() {
    if (!currentUser) return;

    document.getElementById('profile-name-display').textContent = currentUser.name;
    document.getElementById('profile-email-display').textContent = currentUser.email;
    document.getElementById('profile-phone-display').textContent =
        currentUser.profile.phone || '-';
    document.getElementById('profile-address-display').textContent =
        currentUser.profile.address || '-';
}
document.getElementById('back-to-menu-btn')?.addEventListener('click', () => {
    document.getElementById('profile-section').style.display = 'none';
    document.getElementById('user-logged-in').style.display = 'block';
});

document.getElementById('back-to-menu-from-orders-btn')?.addEventListener('click', () => {
    document.getElementById('my-orders-section').style.display = 'none';
    document.getElementById('user-logged-in').style.display = 'block';
});
const editProfileBtn = document.getElementById('profile-edit-btn');
const profileViewMode = document.getElementById('profile-view-mode');
const profileForm = document.getElementById('profile-form-element');

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        if (!currentUser) return;

        // Hide view mode
        profileViewMode.style.display = 'none';

        // Show edit form
        profileForm.style.display = 'block';

        // Populate form fields
        document.getElementById('profile-name').value = currentUser.name;
        document.getElementById('profile-phone').value = currentUser.profile.phone || '';
        document.getElementById('profile-address').value = currentUser.profile.address || '';
    });
}
const cancelProfileBtn = document.getElementById('profile-cancel-btn');

if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', () => {
        profileForm.style.display = 'none';
        profileViewMode.style.display = 'block';
    });
}

    // Update cart on load
    updateCartUI(cartItemsContainer, cartCountElement, cartTotalAmount);
    
    // ============== AUTHENTICATION ==============
    
    function checkLoginStatus() {
        if (currentUser) {
            updateUserInterface();
        }
    }
    
    function updateUserInterface() {
        const notLoggedIn = document.getElementById('user-not-logged-in');
        const loggedIn = document.getElementById('user-logged-in');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (currentUser) {
            if (notLoggedIn) notLoggedIn.style.display = 'none';
            if (loggedIn) loggedIn.style.display = 'block';
            if (loginForm) loginForm.style.display = 'none';
            if (signupForm) signupForm.style.display = 'none';
            
            const userNameEl = document.getElementById('user-name');
            const userEmailEl = document.getElementById('user-email');
            if (userNameEl) userNameEl.textContent = currentUser.name;
            if (userEmailEl) userEmailEl.textContent = currentUser.email;
        } else {
            if (notLoggedIn) notLoggedIn.style.display = 'block';
            if (loggedIn) loggedIn.style.display = 'none';
            if (loginForm) loginForm.style.display = 'none';
            if (signupForm) signupForm.style.display = 'none';
        }
    }
    
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            document.getElementById('user-not-logged-in').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });
    }
    
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            document.getElementById('user-not-logged-in').style.display = 'none';
            document.getElementById('signup-form').style.display = 'block';
        });
    }
    
    const switchToSignup = document.getElementById('switch-to-signup');
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('signup-form').style.display = 'block';
        });
    }
    
    const switchToLogin = document.getElementById('switch-to-login');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });
    }
    
    setupPasswordToggle('login-form-element', 'login-password');
    setupPasswordToggle('signup-form-element', 'signup-password');
    setupPasswordToggle('profile-form-element', 'profile-password');
    
    const inputIds = [
        'login-email', 'login-password',
        'signup-name', 'signup-email', 'signup-password', 'signup-confirm-password',
        'profile-name', 'profile-phone', 'profile-address'
    ];
    
    inputIds.forEach(function(id) {
        const input = document.getElementById(id);
        if (!input) return;
        
        input.classList.add('form-input');
        
        input.addEventListener('blur', function() {
            if (id === 'signup-confirm-password') {
                const passwordEl = document.getElementById('signup-password');
                validateField(id, this.value, userDatabase, passwordEl.value);
            } else {
                validateField(id, this.value, userDatabase);
            }
        });
        
        input.addEventListener('input', function() {
            if ((id === 'signup-password') && this.value) {
                const strengthEl = this.parentElement.querySelector('.password-strength');
                const strengthTextEl = this.parentElement.querySelector('.strength-text');
                if (strengthEl) {
                    const strength = getPasswordStrength(this.value);
                    const bars = strengthEl.querySelectorAll('.strength-bar');
                    const filledBars = {
                        weak: 1,
                        fair: 2,
                        good: 3,
                        strong: 4
                    }[strength.level];
                    
                    bars.forEach(function(bar, idx) {
                        bar.style.backgroundColor = idx < filledBars ? strength.color : '#e0e0e0';
                    });
                    
                    if (strengthTextEl) {
                        strengthTextEl.textContent = strength.text;
                        strengthTextEl.style.color = strength.color;
                    }
                }
            }
        });
    });
    
    // Login form
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (loginSubmitting) return;
            
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            if (!emailInput || !passwordInput) return;
            
            const email = emailInput.value.toLowerCase();
            const password = passwordInput.value;
            
            let isValid = true;
            isValid &= validateField('login-email', email, userDatabase);
            isValid &= validateField('login-password', password, userDatabase);
            
            if (!isValid) {
                showToast('Please fix the errors above', 'error');
                return;
            }
            
            const emailLower = email.toLowerCase();
            if (!userDatabase[emailLower]) {
                showToast('Email not registered', 'error');
                return;
            }
            
            if (userDatabase[emailLower].password !== password) {
                showToast('Incorrect password', 'error');
                return;
            }
            
            loginSubmitting = true;
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            setTimeout(function() {
                currentUser = deepClone(userDatabase[emailLower]);
                updateUserInterface();
                showToast('Login successful! Welcome back, ' + currentUser.name + '!', 'success');
                loginForm.reset();
                
                loginSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                
                saveAppState();
            }, 800);
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form-element');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (signupSubmitting) return;
            
            const nameInput = document.getElementById('signup-name');
            const emailInput = document.getElementById('signup-email');
            const passwordInput = document.getElementById('signup-password');
            const confirmPasswordInput = document.getElementById('signup-confirm-password');
            if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) return;
            
            const name = nameInput.value;
            const email = emailInput.value.toLowerCase();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            let isValid = true;
            isValid &= validateField('signup-name', name, userDatabase);
            isValid &= validateField('signup-email', email, userDatabase);
            isValid &= validateField('signup-password', password, userDatabase);
            isValid &= validateField('signup-confirm-password', confirmPassword, userDatabase, password);
            
            if (!isValid) {
                showToast('Please fix the errors above', 'error');
                return;
            }
            
            signupSubmitting = true;
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            setTimeout(function() {
                const emailLower = email.toLowerCase();
                userDatabase[emailLower] = {
                    name: name,
                    email: emailLower,
                    password: password,
                    profile: {
                        phone: '',
                        address: ''
                    },
                    orders: []
                };
                
                currentUser = deepClone(userDatabase[emailLower]);
                updateUserInterface();
                showToast('Account created successfully! Welcome, ' + name + '!', 'success');
                signupForm.reset();
                
                signupSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                
                saveAppState();
            }, 800);
        });
    }
    
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            currentUser = null;
            updateUserInterface();
            showToast('Logged out successfully', 'success');
            saveAppState();
        });
    }
    
    checkLoginStatus();
    
    // ============== PRODUCT SYSTEM ==============
    
    let products = [];
    let filteredProducts = [...products];
    let currentFilters = {
        brand: 'all',
        gender: 'all',
        searchQuery: ''
    };
    
    function initializeProducts() {
        const existingCards = document.querySelectorAll('.product-card[data-id]');
        products = [];
        
        existingCards.forEach(function(card) {
            const id = card.getAttribute('data-id');
            const titleEl = card.querySelector('.product-title');
            const priceEl = card.querySelector('.price') || card.querySelector('.discounted-price');
            const imageEl = card.querySelector('img');
            const genderAttr = card.getAttribute('data-gender');
            const brandAttr = card.getAttribute('data-brand');
            
            if (titleEl && priceEl && imageEl) {
                const priceText = priceEl.textContent;
                const price = parseInt(priceText.replace(/[^\d]/g, ''));
                
                const product = {
                    id: id,
                    title: titleEl.textContent.trim(),
                    brand: brandAttr || 'Unknown',
                    category: 'General',
                    price: price || 0,
                    image: imageEl.src,
                    gender: genderAttr || 'Unisex'
                };
                
                products.push(product);
            }
        });
        
        filteredProducts = [...products];
    }
    
    initializeProducts();
    
    // ============== SEARCH ==============
    
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    function performSearch(query) {
        currentFilters.searchQuery = query.toLowerCase();
        applyFilters();
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
        
        searchInput.addEventListener('input', function() {
            if (this.value.length > 2 || this.value.length === 0) {
                performSearch(this.value);
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
    }
    
    // ============== FILTERS ==============
    
    function applyFilters() {
        filteredProducts = products.filter(function(product) {
            const matchesBrand = currentFilters.brand === 'all' || product.brand.toLowerCase() === currentFilters.brand.toLowerCase();
            const matchesGender = currentFilters.gender === 'all' || product.gender.toLowerCase() === currentFilters.gender.toLowerCase();
            const matchesSearch = currentFilters.searchQuery === '' || 
                                 product.title.toLowerCase().includes(currentFilters.searchQuery) ||
                                 product.brand.toLowerCase().includes(currentFilters.searchQuery);
            
            return matchesBrand && matchesGender && matchesSearch;
        });
        
        displayProducts();
    }
    
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter-type');
            const filterValue = this.getAttribute('data-filter-value');
            
            document.querySelectorAll(`.filter-btn[data-filter-type="${filterType}"]`).forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            currentFilters[filterType] = filterValue;
            applyFilters();
            
            if (window.innerWidth <= 768) {
                closeDrawer(document.querySelector('.filter-drawer'), document.querySelector('.filter-overlay'));
            }
        });
    });
    
    // ============== PRODUCT DISPLAY ==============
    
    function displayProducts() {
        const productGrid = document.querySelector('.product-grid');
        const noProductsMsg = document.getElementById('no-products-msg');
        
        if (!productGrid) return;
        
        if (filteredProducts.length === 0) {
            productGrid.style.display = 'none';
            if (noProductsMsg) {
                noProductsMsg.style.display = 'block';
                noProductsMsg.textContent = 'No products found matching your search or filters';
            }
            return;
        }
        
        productGrid.style.display = 'grid';
        if (noProductsMsg) noProductsMsg.style.display = 'none';
        
        productGrid.innerHTML = '';
        
        filteredProducts.forEach(function(product) {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-id', product.id);
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="brand-label">${product.brand}</p>
                    <p class="price">₹${product.price.toLocaleString('en-IN')}</p>
                    <button class="btn btn-secondary add-to-cart" aria-label="Add to Cart">Add to Cart</button>
                </div>
            `;
            
            productGrid.appendChild(productCard);
        });
        
        attachAddToCartListeners();
    }
    
    function attachAddToCartListeners() {
        document.querySelectorAll('.add-to-cart').forEach(function(button) {
            button.removeEventListener('click', addToCartHandler);
            button.addEventListener('click', addToCartHandler);
        });
    }
    
    function addToCartHandler(e) {
        e.preventDefault();
        const productCard = this.closest('.product-card');
        if (!productCard) return;
        
        const productId = productCard.getAttribute('data-id');
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        addToCart(productId, product);
        
        const originalText = this.textContent;
        this.textContent = 'Added!';
        this.style.backgroundColor = '#2ecc71';
        this.disabled = true;
        
        setTimeout(() => {
            this.textContent = originalText;
            this.style.backgroundColor = '';
            this.disabled = false;
        }, 1000);
        
        updateCartUI(cartItemsContainer, cartCountElement, cartTotalAmount);
        saveAppState();
        showToast(`${product.title} added to cart!`, 'success');
    }
    
    attachAddToCartListeners();
    
    // ============== ORDERS ==============
    
    const myOrdersBtn = document.querySelector('.user-menu-item[data-section="orders"]');
    if (myOrdersBtn) {
        myOrdersBtn.addEventListener('click', function() {
            if (!currentUser) {
                showToast('Please login first', 'error');
                return;
            }
            document.getElementById('user-logged-in').style.display = 'none';
            showOrdersSection();
        });
    }
    
    function showOrdersSection() {
        const myOrdersSection = document.getElementById('my-orders-section');
        if (!myOrdersSection) return;
        
        populateOrdersList();
        myOrdersSection.classList.add('visible-block');
    }
    
    function populateOrdersList() {
        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) return;
        
        const orders = (currentUser && currentUser.orders) ? currentUser.orders : [];
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="no-orders-message">You haven\'t placed any orders yet.</p>';
            return;
        }
        
        let html = '';
        orders.forEach(function(order, index) {
            html += `
                <div class="order-card">
                    <div class="order-header-row">
                        <h5>Order #${index + 1}</h5>
                        <span class="order-status-delivered">Delivered</span>
                    </div>
                    <p><strong>Date:</strong> ${order.date || 'N/A'}</p>
                    <p><strong>Items:</strong> ${order.items.length} sneaker(s)</p>
                    <p><strong>Total:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}</p>
                </div>
            `;
        });
        
        ordersContainer.innerHTML = html;
    }
    
    const backToMenuFromOrdersBtn = document.getElementById('back-to-menu-from-orders-btn');
    if (backToMenuFromOrdersBtn) {
        backToMenuFromOrdersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const myOrdersSection = document.getElementById('my-orders-section');
            const loggedInSection = document.getElementById('user-logged-in');
            if (myOrdersSection && loggedInSection) {
                myOrdersSection.classList.remove('visible-block');
                loggedInSection.classList.add('visible-block');
            }
        });
    }
    
    // ============== CHECKOUT ==============
    
    const checkoutBtn = document.querySelector('.cart-footer .btn-primary');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!currentUser) {
                closeDrawer(cartDrawer, cartOverlay);
                showToast('Please login to checkout', 'error');
                userTrigger.click();
                return;
            }
            
            if (Object.values(getCart()).length === 0) {
                showToast('Your cart is empty', 'error');
                return;
            }
            
            showCheckoutModal();
        });
    }
    
    function showCheckoutModal() {
        const checkoutModal = document.getElementById('checkout-modal');
        const checkoutOverlay = document.getElementById('checkout-modal-overlay');
        
        const addressField = document.getElementById('checkout-address');
        if (addressField && currentUser && currentUser.profile && currentUser.profile.address) {
            addressField.value = currentUser.profile.address;
        }
        
        checkoutModal.classList.add('modal-active');
        checkoutOverlay.classList.add('modal-active');
        document.body.classList.add('overflow-hidden');
        populateCheckoutSummary();
    }
    
    function closeCheckoutModal() {
        const checkoutModal = document.getElementById('checkout-modal');
        const checkoutOverlay = document.getElementById('checkout-modal-overlay');
        
        checkoutModal.classList.remove('modal-active');
        checkoutOverlay.classList.remove('modal-active');
        document.body.classList.remove('overflow-hidden');
    }
    
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    }
    
    const checkoutModalOverlay = document.getElementById('checkout-modal-overlay');
    if (checkoutModalOverlay) {
        checkoutModalOverlay.addEventListener('click', closeCheckoutModal);
    }
    
    function populateCheckoutSummary() {
        const summaryContainer = document.getElementById('checkout-summary');
        if (!summaryContainer) return;
        
        const cartItems = Object.values(getCart());
        
        let html = '<h4>Order Summary</h4>';
        cartItems.forEach(function(item) {
            html += `
                <div class="checkout-item">
                    <span>${item.title} x ${item.quantity}</span>
                    <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
            `;
        });
        
        html += `
            <div class="checkout-total">
                <strong>Total: ₹${getCartTotal().toLocaleString('en-IN')}</strong>
            </div>
        `;
        
        summaryContainer.innerHTML = html;
    }
    
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (checkoutSubmitting) return;
            if (!currentUser) return;
            
            const addressInput = document.getElementById('checkout-address');
            const paymentMethodSelect = document.getElementById('payment-method');
            if (!addressInput || !paymentMethodSelect) return;
            
            const address = addressInput.value;
            const paymentMethod = paymentMethodSelect.value;
            
            if (!address.trim()) {
                showToast('Please enter delivery address', 'error');
                return;
            }
            
            const cartItems = Object.values(getCart());
            if (cartItems.length === 0) {
                showToast('Your cart is empty', 'error');
                return;
            }
            
            checkoutSubmitting = true;
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            setTimeout(function() {
                const order = {
                    id: 'ORD-' + Date.now(),
                    date: new Date().toLocaleDateString('en-IN'),
                    items: deepClone(cartItems),
                    totalPrice: getCartTotal(),
                    address: address,
                    paymentMethod: paymentMethod,
                    status: 'Confirmed'
                };
                
                const emailLower = currentUser.email.toLowerCase();
                userDatabase[emailLower].orders = userDatabase[emailLower].orders || [];
                userDatabase[emailLower].orders.push(order);
                userDatabase[emailLower].profile.address = address;
                
                currentUser = deepClone(userDatabase[emailLower]);
                
                clearCart();
                setCart({});
                updateCartUI(cartItemsContainer, cartCountElement, cartTotalAmount);
                saveAppState();
                
                closeCheckoutModal();
                closeDrawer(cartDrawer, cartOverlay);
                
                showToast('Order placed successfully! Order ID: ' + order.id, 'success');
                
                checkoutSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                checkoutForm.reset();
            }, 1200);
        });
    }
    
    // ============== RESPONSIVE ==============
    
    function handleResponsive() {
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            productGrid.classList.remove('product-grid-2-col', 'product-grid-3-col', 'product-grid-auto');
            
            if (window.innerWidth <= 600) {
                productGrid.classList.add('product-grid-2-col');
            } else if (window.innerWidth <= 768) {
                productGrid.classList.add('product-grid-2-col');
            } else if (window.innerWidth <= 992) {
                productGrid.classList.add('product-grid-3-col');
            } else {
                productGrid.classList.add('product-grid-auto');
            }
        }
    }
    
    window.addEventListener('resize', handleResponsive);
    handleResponsive();
});