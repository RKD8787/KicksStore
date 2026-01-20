// ============== INITIALIZATION ==============
// SECURITY NOTE: This application stores passwords in plain text for demonstration purposes only.
// In production, passwords MUST be hashed server-side using bcrypt, Argon2, or similar algorithms.
// Never store plain text passwords in real applications.

// Load persisted data from localStorage
function loadFromStorage() {
    const stored = localStorage.getItem('kicksStoreData');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to load from storage', e);
        }
    }
    return { users: {}, currentUser: null, cart: {} };
}

// Save data to localStorage
function saveToStorage(data) {
    localStorage.setItem('kicksStoreData', JSON.stringify(data));
}

// Deep clone utility to prevent reference mutations
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Global app state
let appState = loadFromStorage();
let userDatabase = appState.users;
let currentUser = appState.currentUser;
let cart = appState.cart || {};

// Per-form submission flags for improved submission safety
let loginSubmitting = false;
let signupSubmitting = false;
let profileSubmitting = false;
let checkoutSubmitting = false;

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ============== CART SYSTEM ==============
    
    // Get all important elements with defensive null checks
    const cartTrigger = document.querySelector('.cart-trigger');
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cartCountElement = document.querySelector('.cart-count');
    
    const filterTrigger = document.querySelector('.filter-trigger');
    const filterDrawer = document.querySelector('.filter-drawer');
    const filterOverlay = document.querySelector('.filter-overlay');
    const filterCloseBtn = document.querySelector('.filter-close-btn');
    
    const userTrigger = document.querySelector('.profile-icon');
    const userDrawer = document.querySelector('.user-drawer');
    const userOverlay = document.querySelector('.user-overlay');
    const userCloseBtn = document.querySelector('.user-close-btn');
    
    // Open cart when clicking cart icon
    if (cartTrigger) {
        cartTrigger.addEventListener('click', function() {
            if (cartDrawer) cartDrawer.classList.add('active');
            if (cartOverlay) cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close cart when clicking X button
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', closeCart);
    }
    
    // Close cart when clicking overlay
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    function closeCart() {
        if (cartDrawer) cartDrawer.classList.remove('active');
        if (cartOverlay) cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Open filter when clicking filter icon
    if (filterTrigger) {
        filterTrigger.addEventListener('click', function() {
            if (filterDrawer) filterDrawer.classList.add('active');
            if (filterOverlay) filterOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close filter when clicking X button
    if (filterCloseBtn) {
        filterCloseBtn.addEventListener('click', closeFilter);
    }
    
    // Close filter when clicking overlay
    if (filterOverlay) {
        filterOverlay.addEventListener('click', closeFilter);
    }
    
    function closeFilter() {
        if (filterDrawer) filterDrawer.classList.remove('active');
        if (filterOverlay) filterOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Open user profile when clicking user icon
    if (userTrigger) {
        userTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            if (userDrawer) userDrawer.classList.add('active');
            if (userOverlay) userOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateUserInterface();
        });
    }
    
    // Close user profile when clicking X button
    if (userCloseBtn) {
        userCloseBtn.addEventListener('click', closeUser);
    }
    
    // Close user profile when clicking overlay
    if (userOverlay) {
        userOverlay.addEventListener('click', closeUser);
    }
    
    function closeUser() {
        if (userDrawer) userDrawer.classList.remove('active');
        if (userOverlay) userOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Update cart display
    function updateCart() {
        const cartItems = Object.values(cart);
        
        let totalItems = 0;
        cartItems.forEach(function(item) {
            totalItems += item.quantity;
        });
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
        
        let totalPrice = 0;
        cartItems.forEach(function(item) {
            totalPrice += item.price * item.quantity;
        });
        if (cartTotalAmount) {
            cartTotalAmount.textContent = '₹' + totalPrice.toLocaleString('en-IN');
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
            
            document.querySelectorAll('.cart-remove-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    delete cart[productId];
                    updateCart();
                    saveAppState();
                });
            });

            document.querySelectorAll('.qty-increase').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    if (cart[productId]) {
                        cart[productId].quantity++;
                        updateCart();
                        saveAppState();
                    }
                });
            });

            document.querySelectorAll('.qty-decrease').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    if (cart[productId] && cart[productId].quantity > 1) {
                        cart[productId].quantity--;
                        updateCart();
                        saveAppState();
                    }
                });
            });
        }
    }
    
    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(function(button) {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            if (!productCard) return;
            
            const productId = productCard.getAttribute('data-id');
            
            if (cart[productId]) {
                cart[productId].quantity++;
            } else {
                const titleEl = productCard.querySelector('.product-title');
                const imageEl = productCard.querySelector('.product-image img');
                if (!titleEl || !imageEl) return;
                
                const title = titleEl.textContent;
                const image = imageEl.src;
                const discountedEl = productCard.querySelector('.discounted-price');
                const priceEl = discountedEl || productCard.querySelector('.price');
                const rawPriceText = priceEl ? priceEl.textContent : '';
                const match = rawPriceText.match(/[\d,]+/);
                const price = match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
                
                cart[productId] = {
                    id: productId,
                    title: title,
                    image: image,
                    price: price,
                    quantity: 1
                };
            }
            
            const originalText = button.textContent;
            button.textContent = 'Added!';
            button.style.backgroundColor = '#2ecc71';
            button.disabled = true;
            
            setTimeout(function() {
                button.textContent = originalText;
                button.style.backgroundColor = '';
                button.disabled = false;
            }, 1000);
            
            updateCart();
            saveAppState();
        });
    });
    
    updateCart();
    
    
    // ============== UTILITY FUNCTIONS ==============
    
    // Save application state to localStorage
    function saveAppState() {
        appState = {
            users: userDatabase,
            currentUser: currentUser,
            cart: cart
        };
        saveToStorage(appState);
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            font-weight: 500;
        `;
        document.body.appendChild(toast);
        
        setTimeout(function() {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }
    
    // Add CSS animations if not already present
    if (!document.querySelector('style[data-custom]')) {
        const style = document.createElement('style');
        style.setAttribute('data-custom', 'true');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .form-input {
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
            }
            .form-input.valid {
                border-color: #28a745 !important;
                box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
            }
            .form-input.invalid {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
            }
            .error-message {
                color: #dc3545;
                font-size: 12px;
                margin-top: 5px;
                min-height: 18px;
                animation: fadeIn 0.2s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .password-strength {
                display: flex;
                gap: 3px;
                margin-top: 8px;
            }
            .strength-bar {
                height: 4px;
                flex: 1;
                background: #e0e0e0;
                border-radius: 2px;
                transition: background-color 0.3s ease;
            }
            .strength-text {
                font-size: 11px;
                font-weight: 600;
                margin-top: 5px;
                transition: color 0.3s ease;
            }
            .password-toggle {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                color: #666;
                font-size: 18px;
            }
            .form-group {
                position: relative;
            }
            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .btn.loading {
                position: relative;
            }
            .btn.loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                right: 12px;
                margin-top: -8px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 0.6s linear infinite;
            }
            .demo-warning {
                background: #fff3cd;
                border: 1px solid #ffc107;
                color: #856404;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 15px;
                font-size: 13px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Validation rules
    const validators = {
        email: function(value) {
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
            if (!value) return { valid: false, message: 'Email is required' };
            if (!regex.test(value)) return { valid: false, message: 'Invalid email format' };
            return { valid: true, message: '' };
        },
        password: function(value) {
            if (!value) {
                return { valid: false, message: 'Password is required' };
            }

            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

            if (!regex.test(value)) {
                return {
                    valid: false,
                    message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number'
                };
            }

            return { valid: true, message: '' };
        },
        name: function(value) {
            if (!value) return { valid: false, message: 'Full name is required' };
            if (value.length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
            if (value.length > 50) return { valid: false, message: 'Name must not exceed 50 characters' };
            if (!/^[a-zA-Z\s]+$/.test(value)) return { valid: false, message: 'Name can only contain letters and spaces' };
            return { valid: true, message: '' };
        },
        phone: function(value) {
            if (!value) return { valid: true, message: '' };
            const regex = /^(\+91)?[6-9]\d{9}$/;
            if (!regex.test(value.replace(/\s/g, ''))) return { valid: false, message: 'Invalid Indian phone number' };
            return { valid: true, message: '' };
        },
        address: function(value) {
            if (!value) return { valid: false, message: 'Address is required' };
            if (value.length < 5) return { valid: false, message: 'Address must be at least 5 characters' };
            return { valid: true, message: '' };
        },
        confirmPassword: function(value, passwordValue) {
            if (!value) return { valid: false, message: 'Confirm password is required' };
            if (value !== passwordValue) return { valid: false, message: 'Passwords do not match' };
            return { valid: true, message: '' };
        }
    };
    
    // Password strength indicator
    function getPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        if (strength < 2) return { level: 'weak', color: '#dc3545', text: 'Weak' };
        if (strength < 4) return { level: 'fair', color: '#fd7e14', text: 'Fair' };
        if (strength < 5) return { level: 'good', color: '#ffc107', text: 'Good' };
        return { level: 'strong', color: '#28a745', text: 'Strong' };
    }
    
    // Setup password visibility toggle
    function setupPasswordToggle(formId, passwordInputId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const passwordInput = document.getElementById(passwordInputId);
        if (!passwordInput) return;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.innerHTML = `<i class="fas fa-eye${isPassword ? '-slash' : ''}"></i>`;
        });
        
        const formGroup = passwordInput.closest('.form-group');
        if (formGroup) {
            formGroup.style.position = 'relative';
            formGroup.appendChild(toggleBtn);
        }
    }
    
    // Display field error
    function displayError(fieldId, message) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        const errorEl = input.parentElement.querySelector('.error-message');
        input.classList.remove('valid');
        input.classList.add('invalid');
        if (errorEl) {
            errorEl.textContent = message;
        }
    }
    
    // Display field success
    function displaySuccess(fieldId) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        const errorEl = input.parentElement.querySelector('.error-message');
        input.classList.remove('invalid');
        input.classList.add('valid');
        if (errorEl) {
            errorEl.textContent = '';
        }
    }
    
    // Validate single field
    function validateField(fieldId, value, extraValue = null) {
        let result = { valid: true, message: '' };
        
        if (fieldId === 'login-email') {
            result = validators.email(value);
        } else if (fieldId === 'login-password') {
            result = validators.password(value);
        } else if (fieldId === 'signup-name') {
            result = validators.name(value);
        } else if (fieldId === 'signup-email') {
            result = validators.email(value);
            // Check for duplicate email (case-insensitive)
            if (result.valid && userDatabase[value.toLowerCase()]) {
                result = { valid: false, message: 'Email already registered' };
            }
        } else if (fieldId === 'signup-password') {
            result = validators.password(value);
        } else if (fieldId === 'signup-confirm-password') {
            result = validators.confirmPassword(value, extraValue);
        } else if (fieldId === 'profile-name') {
            result = validators.name(value);
        } else if (fieldId === 'profile-phone') {
            result = validators.phone(value);
        } else if (fieldId === 'profile-address') {
            result = validators.address(value);
        }
        
        if (result.valid) {
            displaySuccess(fieldId);
        } else {
            displayError(fieldId, result.message);
        }
        
        return result.valid;
    }
    
    // ============== USER AUTHENTICATION SYSTEM ==============
    
    // Check if user is logged in on page load
    function checkLoginStatus() {
        if (currentUser) {
            updateUserInterface();
        }
    }
    
    // Update user interface based on login status
    function updateUserInterface() {
        const notLoggedIn = document.getElementById('user-not-logged-in');
        const loggedIn = document.getElementById('user-logged-in');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const profileSection = document.getElementById('profile-section');
        const myOrdersSection = document.getElementById('my-orders-section');
        
        if (currentUser) {
            if (notLoggedIn) notLoggedIn.style.display = 'none';
            if (loggedIn) loggedIn.style.display = 'block';
            if (loginForm) loginForm.style.display = 'none';
            if (signupForm) signupForm.style.display = 'none';
            
            document.getElementById('user-name').textContent = currentUser.name;
            document.getElementById('user-email').textContent = currentUser.email;
        } else {
            if (notLoggedIn) notLoggedIn.style.display = 'block';
            if (loggedIn) loggedIn.style.display = 'none';
            if (loginForm) loginForm.style.display = 'none';
            if (signupForm) signupForm.style.display = 'none';
        }
    }
    
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            document.getElementById('user-not-logged-in').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            setTimeout(function() {
                document.getElementById('login-email').focus();
            }, 100);
        });
    }
    
    // Signup button
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            document.getElementById('user-not-logged-in').style.display = 'none';
            document.getElementById('signup-form').style.display = 'block';
            setTimeout(function() {
                document.getElementById('signup-name').focus();
            }, 100);
        });
    }
    
    // Switch to signup
    const switchToSignup = document.getElementById('switch-to-signup');
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('signup-form').style.display = 'block';
            setTimeout(function() {
                document.getElementById('signup-name').focus();
            }, 100);
        });
    }
    
    // Switch to login
    const switchToLogin = document.getElementById('switch-to-login');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            setTimeout(function() {
                document.getElementById('login-email').focus();
            }, 100);
        });
    }
    
    // Setup password visibility toggles
    setupPasswordToggle('login-form-element', 'login-password');
    setupPasswordToggle('signup-form-element', 'signup-password');
    setupPasswordToggle('profile-form-element', 'profile-password');
    
    // Real-time validation on blur and input
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
            if (id === 'signup-confirm-password' || id === 'profile-password') {
                const passwordId = id === 'signup-confirm-password' ? 'signup-password' : 'profile-password';
                validateField(id, this.value, document.getElementById(passwordId).value);
            } else if (id === 'signup-password' || id === 'profile-password') {
                validateField(id, this.value);
                const strengthEl = this.parentElement.querySelector('.password-strength');
                if (strengthEl && (id === 'signup-password' || id === 'profile-password')) {
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
                }
            } else {
                validateField(id, this.value);
            }
        });
        
        input.addEventListener('input', function() {
            if ((id === 'signup-password' || id === 'profile-password') && this.value) {
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
            
            if (this.classList.contains('invalid')) {
                if (id === 'signup-confirm-password' || id === 'profile-password') {
                    const passwordId = id === 'signup-confirm-password' ? 'signup-password' : 'profile-password';
                    validateField(id, this.value, document.getElementById(passwordId).value);
                } else {
                    validateField(id, this.value);
                }
            }
        });
    });
    
    // Login form submission
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
            isValid &= validateField('login-email', email);
            isValid &= validateField('login-password', password);
            
            if (!isValid) {
                showToast('Please fix the errors above', 'error');
                return;
            }
            
            const emailLower = email.toLowerCase();
            if (!userDatabase[emailLower]) {
                displayError('login-email', 'Email not found');
                showToast('Email not registered', 'error');
                return;
            }
            
            if (userDatabase[emailLower].password !== password) {
                displayError('login-password', 'Incorrect password');
                showToast('Incorrect password', 'error');
                return;
            }
            
            loginSubmitting = true;
            const submitBtn = this.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            setTimeout(function() {
                currentUser = deepClone(userDatabase[emailLower]);
                updateUserInterface();
                showToast('Login successful! Welcome back, ' + currentUser.name + '!', 'success');
                
                const loginFormElement = document.getElementById('login-form-element');
                if (loginFormElement) {
                    loginFormElement.reset();
                }
                
                const loginEmailInput = document.getElementById('login-email');
                const loginPasswordInput = document.getElementById('login-password');
                if (loginEmailInput) loginEmailInput.classList.remove('valid', 'invalid');
                if (loginPasswordInput) loginPasswordInput.classList.remove('valid', 'invalid');
                
                document.querySelectorAll('#login-form .error-message').forEach(function(el) {
                    el.textContent = '';
                });
                
                loginSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
                
                saveAppState();
            }, 800);
        });
    }
    
    // Signup form submission
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
            isValid &= validateField('signup-name', name);
            isValid &= validateField('signup-email', email);
            isValid &= validateField('signup-password', password);
            isValid &= validateField('signup-confirm-password', confirmPassword, password);
            
            if (!isValid) {
                showToast('Please fix the errors above', 'error');
                return;
            }
            
            signupSubmitting = true;
            const submitBtn = this.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            const originalText = submitBtn.textContent;
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
                
                const signupFormElement = document.getElementById('signup-form-element');
                if (signupFormElement) {
                    signupFormElement.reset();
                }
                
                document.querySelectorAll('#signup-form .form-input').forEach(function(input) {
                    input.classList.remove('valid', 'invalid');
                });
                
                document.querySelectorAll('#signup-form .error-message').forEach(function(el) {
                    el.textContent = '';
                });
                
                document.querySelectorAll('#signup-form .password-strength .strength-bar').forEach(function(bar) {
                    bar.style.backgroundColor = '#e0e0e0';
                });
                
                signupSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
                
                saveAppState();
            }, 800);
        });
    }
    
    // Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            currentUser = null;
            updateUserInterface();
            showToast('Logged out successfully', 'success');
            saveAppState();
        });
    }
    
    // Initialize user system
    checkLoginStatus();
    
    
    // ============== USER PROFILE SYSTEM ==============
    
    // My Profile button
    const myProfileBtn = document.querySelector('.user-menu-item[data-section="profile"]');
    if (myProfileBtn) {
        myProfileBtn.addEventListener('click', function() {
            if (!currentUser) {
                showToast('Please login first', 'error');
                return;
            }
            showProfileForm();
        });
    }
    
    function showProfileForm() {
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) return;
        
        const profileNameInput = document.getElementById('profile-name');
        const profilePhoneInput = document.getElementById('profile-phone');
        const profileAddressInput = document.getElementById('profile-address');
        
        if (profileNameInput) profileNameInput.value = currentUser.name || '';
        if (profilePhoneInput) profilePhoneInput.value = (currentUser.profile && currentUser.profile.phone) || '';
        if (profileAddressInput) profileAddressInput.value = (currentUser.profile && currentUser.profile.address) || '';
        
        // Populate view mode
        populateProfileView();
        
        // Show profile section in view mode
        const viewMode = document.getElementById('profile-view-mode');
        const editForm = document.getElementById('profile-form-element');
        if (viewMode && editForm) {
            viewMode.style.display = 'flex';
            editForm.style.display = 'none';
        }
        
        profileSection.style.display = 'block';
    }
    
    // Back to menu button
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const profileSection = document.getElementById('profile-section');
            if (profileSection) {
                profileSection.style.display = 'none';
            }
        });
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form-element');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (profileSubmitting) return;
            if (!currentUser) {
                showToast('Please login first', 'error');
                return;
            }
            
            const nameInput = document.getElementById('profile-name');
            const phoneInput = document.getElementById('profile-phone');
            const addressInput = document.getElementById('profile-address');
            if (!nameInput || !phoneInput || !addressInput) return;
            
            const name = nameInput.value;
            const phone = phoneInput.value;
            const address = addressInput.value;
            
            let isValid = true;
            isValid &= validateField('profile-name', name);
            isValid &= validateField('profile-phone', phone);
            isValid &= validateField('profile-address', address);
            
            if (!isValid) {
                showToast('Please fix the errors above', 'error');
                return;
            }
            
            profileSubmitting = true;
            const submitBtn = this.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            setTimeout(function() {
                const emailLower = currentUser.email.toLowerCase();
                userDatabase[emailLower].name = name;
                userDatabase[emailLower].profile = {
                    phone: phone,
                    address: address
                };
                currentUser = deepClone(userDatabase[emailLower]);
                
                updateUserInterface();
                showToast('Profile updated successfully!', 'success');
                saveAppState();
                
                // Exit edit mode and show view mode
                const viewMode = document.getElementById('profile-view-mode');
                const editForm = document.getElementById('profile-form-element');
                if (viewMode && editForm) {
                    viewMode.style.display = 'flex';
                    editForm.style.display = 'none';
                    populateProfileView();
                }
                
                profileSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
            }, 800);
        });
    }
    
    // Profile Edit Button Handler
    const profileEditBtn = document.getElementById('profile-edit-btn');
    if (profileEditBtn) {
        profileEditBtn.addEventListener('click', function() {
            const viewMode = document.getElementById('profile-view-mode');
            const editForm = document.getElementById('profile-form-element');
            if (viewMode && editForm) {
                viewMode.style.display = 'none';
                editForm.style.display = 'flex';
            }
        });
    }
    
    // Profile Cancel Button Handler
    const profileCancelBtn = document.getElementById('profile-cancel-btn');
    if (profileCancelBtn) {
        profileCancelBtn.addEventListener('click', function() {
            const viewMode = document.getElementById('profile-view-mode');
            const editForm = document.getElementById('profile-form-element');
            if (viewMode && editForm) {
                viewMode.style.display = 'flex';
                editForm.style.display = 'none';
            }
        });
    }
    
    // Function to populate profile view with current user data
    function populateProfileView() {
        if (!currentUser) return;
        
        document.getElementById('profile-name-display').textContent = currentUser.name || '-';
        document.getElementById('profile-email-display').textContent = currentUser.email || '-';
        document.getElementById('profile-phone-display').textContent = (currentUser.profile?.phone || '-');
        document.getElementById('profile-address-display').textContent = (currentUser.profile?.address || '-');
    }
    
    // Function to populate profile edit form with current user data
    function populateProfileForm() {
        if (!currentUser) return;
        
        document.getElementById('profile-name').value = currentUser.name || '';
        document.getElementById('profile-phone').value = currentUser.profile?.phone || '';
        document.getElementById('profile-address').value = currentUser.profile?.address || '';
    }
    
    
    // ============== CHECKOUT SYSTEM ==============
    
    // Checkout button in cart
    const checkoutBtn = document.querySelector('.cart-footer .btn-primary');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!currentUser) {
                closeCart();
                showToast('Please login to checkout', 'error');
                userTrigger.click();
                return;
            }
            
            const cartItems = Object.values(cart);
            if (cartItems.length === 0) {
                showToast('Your cart is empty', 'error');
                return;
            }
            
            showCheckoutModal();
        });
    }
    
    function showCheckoutModal() {
        const checkoutModal = document.getElementById('checkout-modal');
        if (checkoutModal) {
            checkoutModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            populateCheckoutSummary();
        }
    }
    
    function closeCheckoutModal() {
        const checkoutModal = document.getElementById('checkout-modal');
        if (checkoutModal) {
            checkoutModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
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
        
        const cartItems = Object.values(cart);
        let totalPrice = 0;
        
        let html = '<h4>Order Summary</h4>';
        cartItems.forEach(function(item) {
            totalPrice += item.price * item.quantity;
            html += `
                <div class="checkout-item">
                    <span>${item.title} x ${item.quantity}</span>
                    <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
            `;
        });
        
        html += `
            <div class="checkout-total">
                <strong>Total: ₹${totalPrice.toLocaleString('en-IN')}</strong>
            </div>
        `;
        
        summaryContainer.innerHTML = html;
    }
    
    // Checkout form submission
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
            
            const cartItems = Object.values(cart);
            if (cartItems.length === 0) {
                showToast('Your cart is empty', 'error');
                return;
            }
            
            checkoutSubmitting = true;
            const submitBtn = this.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            setTimeout(function() {
                // Calculate total price
                let totalPrice = 0;
                cartItems.forEach(function(item) {
                    totalPrice += item.price * item.quantity;
                });
                
                // Create order with deep-cloned cart items to prevent reference mutations
                const order = {
                    id: 'ORD-' + Date.now(),
                    date: new Date().toLocaleDateString('en-IN'),
                    items: deepClone(cartItems),
                    totalPrice: totalPrice,
                    address: address,
                    paymentMethod: paymentMethod,
                    status: 'Confirmed'
                };
                
                const emailLower = currentUser.email.toLowerCase();
                userDatabase[emailLower].orders = userDatabase[emailLower].orders || [];
                userDatabase[emailLower].orders.push(order);
                
                // Update checkout address back to profile for next order
                userDatabase[emailLower].profile.address = address;
                currentUser = deepClone(userDatabase[emailLower]);
                
                // Clear cart
                cart = {};
                updateCart();
                saveAppState();
                
                closeCheckoutModal();
                closeCart();
                
                showToast('Order placed successfully! Order ID: ' + order.id, 'success');
                
                checkoutSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
                
                // Reset form
                checkoutForm.reset();
            }, 1200);
        });
    }
    
    // Pre-fill address from profile
    const checkoutAddressInput = document.getElementById('checkout-address');
    if (checkoutAddressInput && currentUser && currentUser.profile && currentUser.profile.address) {
        checkoutAddressInput.value = currentUser.profile.address;
    }
    
    
    // ============== MY ORDERS SYSTEM ==============
    
    // My Orders button
    const myOrdersBtn = document.querySelector('.user-menu-item[data-section="orders"]');
    if (myOrdersBtn) {
        myOrdersBtn.addEventListener('click', function() {
            if (!currentUser) {
                showToast('Please login first', 'error');
                return;
            }
            showOrdersSection();
        });
    }
    
    function showOrdersSection() {
        const ordersSection = document.getElementById('my-orders-section');
        if (ordersSection) {
            ordersSection.style.display = 'block';
            populateOrders();
        }
    }
    
    function populateOrders() {
        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) return;
        
        const orders = currentUser.orders || [];
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="no-orders-msg">You haven\'t placed any orders yet.</p>';
            return;
        }
        
        let html = '';
        orders.forEach(function(order) {
            const itemsHtml = order.items.map(function(item) {
                return `<div class="order-item-line">${item.title} x ${item.quantity}</div>`;
            }).join('');
            
            html += `
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-id">Order #${order.id}</div>
                        <div class="order-status status-${order.status.toLowerCase()}">${order.status}</div>
                    </div>
                    <div class="order-details">
                        <p><strong>Date:</strong> ${order.date}</p>
                        <p><strong>Items:</strong></p>
                        <div class="order-items">${itemsHtml}</div>
                        <p><strong>Total:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}</p>
                        <p><strong>Delivery To:</strong> ${order.address}</p>
                        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
                    </div>
                </div>
            `;
        });
        
        ordersContainer.innerHTML = html;
    }
    
    // Back to menu from orders
    const backToMenuFromOrdersBtn = document.getElementById('back-to-menu-from-orders-btn');
    if (backToMenuFromOrdersBtn) {
        backToMenuFromOrdersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const ordersSection = document.getElementById('my-orders-section');
            if (ordersSection) {
                ordersSection.style.display = 'none';
            }
        });
    }
    
    
    // ============== FILTER SYSTEM ==============
    let currentFilters = {
        brand: 'all',
        gender: 'all',
        search: ''
    };
    
    const productCards = document.querySelectorAll('.product-card');
    const noProductsMsg = document.getElementById('no-products-msg');
    
    function applyFilters() {
        let visibleCount = 0;
        
        productCards.forEach(function(card) {
            const cardBrand = card.getAttribute('data-brand');
            const cardGender = card.getAttribute('data-gender');
            const cardTitleEl = card.querySelector('.product-title');
            const cardTitle = cardTitleEl ? cardTitleEl.textContent.toLowerCase() : '';
            const searchText = currentFilters.search.toLowerCase();
            
            const brandMatch = (currentFilters.brand === 'all' || currentFilters.brand === cardBrand);
            const genderMatch = (currentFilters.gender === 'all' || currentFilters.gender === cardGender);
            const searchMatch = (searchText === '' || cardTitle.includes(searchText));
            
            if (brandMatch && genderMatch && searchMatch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        if (noProductsMsg) {
            noProductsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }
    
    document.querySelectorAll('.filter-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter-type');
            const filterValue = this.getAttribute('data-filter-value');
            
            const filterGroup = this.closest('.filter-group');
            filterGroup.querySelectorAll('.filter-btn').forEach(function(btn) {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
            
            currentFilters[filterType] = filterValue;
            applyFilters();
        });
    });
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentFilters.search = this.value;
            applyFilters();
        });
    }
    
    
    // ============== SMOOTH SCROLLING ==============
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    
    // ============== CONTACT FORM ==============
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const messageInput = document.getElementById('contact-message');
            
            if (!nameInput || !emailInput || !messageInput) return;
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const message = messageInput.value.trim();
            
            // Validate name
            const nameResult = validators.name(name);
            if (!nameResult.valid) {
                showToast(nameResult.message, 'error');
                return;
            }
            
            // Validate email
            const emailResult = validators.email(email);
            if (!emailResult.valid) {
                showToast(emailResult.message, 'error');
                return;
            }
            
            // Validate message
            if (!message) {
                showToast('Message is required', 'error');
                return;
            }
            if (message.length < 10) {
                showToast('Message must be at least 10 characters', 'error');
                return;
            }
            if (message.length > 500) {
                showToast('Message must not exceed 500 characters', 'error');
                return;
            }
            
            // All validation passed
            showToast('Thank you ' + name + '! Your message has been sent.', 'success');
            contactForm.reset();
        });
    }
    
});