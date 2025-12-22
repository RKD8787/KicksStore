// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ============== CART SYSTEM ==============
    let cart = {}; // Store cart items here
    
    // Get all important elements
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
    cartTrigger.addEventListener('click', function() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close cart when clicking X button
    cartCloseBtn.addEventListener('click', closeCart);
    
    // Close cart when clicking overlay (dark background)
    cartOverlay.addEventListener('click', closeCart);
    
    function closeCart() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Allow scrolling again
    }
    
    // Open filter when clicking filter icon
    filterTrigger.addEventListener('click', function() {
        filterDrawer.classList.add('active');
        filterOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close filter when clicking X button
    filterCloseBtn.addEventListener('click', closeFilter);
    
    // Close filter when clicking overlay (dark background)
    filterOverlay.addEventListener('click', closeFilter);
    
    function closeFilter() {
        filterDrawer.classList.remove('active');
        filterOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Allow scrolling again
    }
    
    // Open user profile when clicking user icon
    userTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        userDrawer.classList.add('active');
        userOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        updateUserInterface();
    });
    
    // Close user profile when clicking X button
    userCloseBtn.addEventListener('click', closeUser);
    
    // Close user profile when clicking overlay (dark background)
    userOverlay.addEventListener('click', closeUser);
    
    function closeUser() {
        userDrawer.classList.remove('active');
        userOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Allow scrolling again
    }
    
    // Update cart display
    function updateCart() {
        // Get all items from cart
        const cartItems = Object.values(cart);
        
        // Calculate total items
        let totalItems = 0;
        cartItems.forEach(function(item) {
            totalItems += item.quantity;
        });
        cartCountElement.textContent = totalItems;
        
        // Calculate total price
        let totalPrice = 0;
        cartItems.forEach(function(item) {
            totalPrice += item.price * item.quantity;
        });
        cartTotalAmount.textContent = '₹' + totalPrice.toLocaleString('en-IN');
        
        // Clear cart display
        cartItemsContainer.innerHTML = '';
        
        // If cart is empty
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
        } else {
            // Show each cart item
            cartItems.forEach(function(item) {
                const itemHTML = `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                        <div class="cart-item-details">
                            <h4>${item.title}</h4>
                            <p>₹${item.price.toLocaleString('en-IN')} x ${item.quantity}</p>
                            <p><strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong></p>
                        </div>
                        <button class="cart-remove-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
            
            // Add remove button functionality
            document.querySelectorAll('.cart-remove-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    delete cart[productId]; // Remove from cart
                    updateCart(); // Update display
                });
            });
        }
    }
    
    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(function(button) {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-id');
            
            // If product already in cart, increase quantity
            if (cart[productId]) {
                cart[productId].quantity++;
            } else {
                // Add new product to cart
                const title = productCard.querySelector('.product-title').textContent;
                const image = productCard.querySelector('.product-image img').src;
                const priceText = productCard.querySelector('.price').textContent;
                const price = parseInt(priceText.replace('₹', '').replace(',', ''));
                
                cart[productId] = {
                    id: productId,
                    title: title,
                    image: image,
                    price: price,
                    quantity: 1
                };
            }
            
            // Show feedback on button
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
        });
    });
    
    // Initialize cart
    updateCart();
    
    
    // ============== USER AUTHENTICATION SYSTEM ==============
    let currentUser = null;
    
    // Check if user is logged in on page load
    function checkLoginStatus() {
        const userData = localStorage.getItem('kicksStoreUser');
        if (userData) {
            currentUser = JSON.parse(userData);
        }
    }
    
    // Update user interface based on login status
    function updateUserInterface() {
        const notLoggedIn = document.getElementById('user-not-logged-in');
        const loggedIn = document.getElementById('user-logged-in');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (currentUser) {
            // Show logged in interface
            notLoggedIn.style.display = 'none';
            loggedIn.style.display = 'block';
            loginForm.style.display = 'none';
            signupForm.style.display = 'none';
            
            // Update user info
            document.getElementById('user-name').textContent = currentUser.name;
            document.getElementById('user-email').textContent = currentUser.email;
        } else {
            // Show not logged in interface
            notLoggedIn.style.display = 'block';
            loggedIn.style.display = 'none';
            loginForm.style.display = 'none';
            signupForm.style.display = 'none';
        }
    }
    
    // Login button
    document.getElementById('login-btn').addEventListener('click', function() {
        document.getElementById('user-not-logged-in').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
    
    // Signup button
    document.getElementById('signup-btn').addEventListener('click', function() {
        document.getElementById('user-not-logged-in').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });
    
    // Switch to signup
    document.getElementById('switch-to-signup').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });
    
    // Switch to login
    document.getElementById('switch-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
    
    // Login form submission
    document.getElementById('login-form-element').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simple validation (in real app, this would be server-side)
        if (email && password) {
            // Simulate login (in real app, check against database)
            currentUser = {
                name: email.split('@')[0], // Simple name extraction
                email: email
            };
            
            localStorage.setItem('kicksStoreUser', JSON.stringify(currentUser));
            updateUserInterface();
            
            alert('Login successful! Welcome back, ' + currentUser.name + '!');
        } else {
            alert('Please fill in all fields');
        }
    });
    
    // Signup form submission
    document.getElementById('signup-form-element').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (name && email && password) {
            // Simulate account creation
            currentUser = {
                name: name,
                email: email
            };
            
            localStorage.setItem('kicksStoreUser', JSON.stringify(currentUser));
            updateUserInterface();
            
            alert('Account created successfully! Welcome, ' + currentUser.name + '!');
        } else {
            alert('Please fill in all fields');
        }
    });
    
    // Logout
    document.querySelector('.logout-btn').addEventListener('click', function() {
        currentUser = null;
        localStorage.removeItem('kicksStoreUser');
        updateUserInterface();
        alert('Logged out successfully');
    });
    
    // Initialize user system
    checkLoginStatus();
    
    
    // ============== FILTER SYSTEM ==============
    let currentFilters = {
        brand: 'all',
        gender: 'all',
        search: ''
    };
    
    const productCards = document.querySelectorAll('.product-card');
    const noProductsMsg = document.getElementById('no-products-msg');
    
    // Apply filters to products
    function applyFilters() {
        let visibleCount = 0;
        
        productCards.forEach(function(card) {
            const cardBrand = card.getAttribute('data-brand');
            const cardGender = card.getAttribute('data-gender');
            const cardTitle = card.querySelector('.product-title').textContent.toLowerCase();
            const searchText = currentFilters.search.toLowerCase();
            
            // Check if product matches all filters
            const brandMatch = (currentFilters.brand === 'all' || currentFilters.brand === cardBrand);
            const genderMatch = (currentFilters.gender === 'all' || currentFilters.gender === cardGender);
            const searchMatch = (searchText === '' || cardTitle.includes(searchText));
            
            // Show or hide product
            if (brandMatch && genderMatch && searchMatch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show "no products" message if needed
        if (visibleCount === 0) {
            noProductsMsg.style.display = 'block';
        } else {
            noProductsMsg.style.display = 'none';
        }
    }
    
    // Filter button clicks
    document.querySelectorAll('.filter-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter-type');
            const filterValue = this.getAttribute('data-filter-value');
            
            // Remove active class from siblings
            const filterGroup = this.closest('.filter-group');
            filterGroup.querySelectorAll('.filter-btn').forEach(function(btn) {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update filter
            currentFilters[filterType] = filterValue;
            applyFilters();
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        currentFilters.search = this.value;
        applyFilters();
    });
    
    
    // ============== SMOOTH SCROLLING ==============
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only scroll if link points to an element
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
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Show success message (you can customize this)
        alert('Thank you ' + name + '! Your message has been sent.');
        
        // Reset form
        contactForm.reset();
    });
    
});