// My Account Page Functionality
class MyAccountPage {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.loadUserData();
        this.loadMockData();
    }

    checkAuthentication() {
        // Check if user is logged in
        if (!window.authSystem || !window.authSystem.isAuthenticated()) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }
    }

    bindEvents() {
        // Profile form submission
        $(document).on('submit', '#editProfileForm', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Tab change events
        $(document).on('shown.bs.tab', '[data-bs-toggle="tab"]', (e) => {
            const target = $(e.target).attr('data-bs-target');
            this.loadTabContent(target);
        });
    }

    loadUserData() {
        if (window.authSystem && window.authSystem.currentUser) {
            const user = window.authSystem.currentUser;
            
            // Update profile display
            $('#userName').text(`${user.firstName} ${user.lastName}`);
            $('#userEmail').text(user.email);
            
            // Pre-fill edit form
            $('#editFirstName').val(user.firstName);
            $('#editLastName').val(user.lastName);
            $('#editEmail').val(user.email);
        }
    }

    updateProfile() {
        const firstName = $('#editFirstName').val();
        const lastName = $('#editLastName').val();
        const email = $('#editEmail').val();

        if (window.authSystem && window.authSystem.currentUser) {
            // Update user data
            window.authSystem.currentUser.firstName = firstName;
            window.authSystem.currentUser.lastName = lastName;
            window.authSystem.currentUser.email = email;
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(window.authSystem.currentUser));
            
            // Update display
            $('#userName').text(`${firstName} ${lastName}`);
            $('#userEmail').text(email);
            
            // Close modal
            $('#editProfileModal').modal('hide');
            
            // Show success message
            this.showAlert('Profile updated successfully!', 'success');
        }
    }

    loadMockData() {
        // Load initial tab content
        this.loadTabContent('#orders');
    }

    loadTabContent(target) {
        switch(target) {
            case '#orders':
                this.loadOrders();
                break;
            case '#wishlist':
                this.loadWishlist();
                break;
            case '#addresses':
                this.loadAddresses();
                break;
            case '#settings':
                this.loadSettings();
                break;
        }
    }

    loadOrders() {
        const orders = [
            {
                id: 'ORD001',
                date: '2024-01-15',
                status: 'Delivered',
                total: 89.99,
                items: ['Organic Apples', 'Fresh Milk', 'Whole Grain Bread']
            },
            {
                id: 'ORD002',
                date: '2024-01-10',
                status: 'Shipped',
                total: 45.50,
                items: ['Organic Bananas', 'Greek Yogurt']
            },
            {
                id: 'ORD003',
                date: '2024-01-05',
                status: 'Delivered',
                total: 67.25,
                items: ['Organic Tomatoes', 'Avocados', 'Spinach']
            }
        ];

        let ordersHTML = '';
        orders.forEach(order => {
            ordersHTML += `
                <div class="card mb-3 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <h6 class="mb-1">Order #${order.id}</h6>
                                <small class="text-muted">${order.date}</small>
                            </div>
                            <div class="col-md-4">
                                <p class="mb-1"><strong>Items:</strong></p>
                                <small class="text-muted">${order.items.join(', ')}</small>
                            </div>
                            <div class="col-md-2">
                                <span class="badge bg-success">${order.status}</span>
                            </div>
                            <div class="col-md-2 text-end">
                                <strong>$${order.total}</strong>
                            </div>
                            <div class="col-md-1">
                                <button class="btn btn-sm btn-outline-primary">View</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        $('#ordersList').html(ordersHTML);
    }

    loadWishlist() {
        const wishlistItems = [
            {
                name: 'Organic Honey',
                price: 12.99,
                image: 'images/product-thumb-1.png'
            },
            {
                name: 'Fresh Berries Mix',
                price: 8.99,
                image: 'images/product-thumb-2.png'
            },
            {
                name: 'Organic Quinoa',
                price: 15.99,
                image: 'images/product-thumb-3.png'
            }
        ];

        let wishlistHTML = '';
        wishlistItems.forEach(item => {
            wishlistHTML += `
                <div class="card mb-3 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-2">
                                <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" style="width: 60px; height: 60px; object-fit: cover;">
                            </div>
                            <div class="col-md-6">
                                <h6 class="mb-1">${item.name}</h6>
                                <p class="text-primary mb-0">$${item.price}</p>
                            </div>
                            <div class="col-md-4 text-end">
                                <button class="btn btn-sm btn-primary me-2">Add to Cart</button>
                                <button class="btn btn-sm btn-outline-danger">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        $('#wishlistItems').html(wishlistHTML);
    }

    loadAddresses() {
        const addresses = [
            {
                type: 'Home',
                address: '123 Organic Street, Fresh City, FC 12345, United States',
                isDefault: true
            },
            {
                type: 'Work',
                address: '456 Business Avenue, Office District, OD 67890, United States',
                isDefault: false
            }
        ];

        let addressesHTML = '';
        addresses.forEach(addr => {
            addressesHTML += `
                <div class="card mb-3 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <h6 class="mb-1">${addr.type} Address</h6>
                                ${addr.isDefault ? '<span class="badge bg-primary">Default</span>' : ''}
                            </div>
                            <div class="col-md-7">
                                <p class="mb-0 text-muted">${addr.address}</p>
                            </div>
                            <div class="col-md-2 text-end">
                                <button class="btn btn-sm btn-outline-primary me-2">Edit</button>
                                <button class="btn btn-sm btn-outline-danger">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        addressesHTML += `
            <div class="text-center mt-4">
                <button class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Add New Address
                </button>
            </div>
        `;

        $('#addressesList').html(addressesHTML);
    }

    loadSettings() {
        const settingsHTML = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h6 class="mb-3">Email Preferences</h6>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="orderUpdates" checked>
                                <label class="form-check-label" for="orderUpdates">
                                    Order updates and tracking
                                </label>
                            </div>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="promotions" checked>
                                <label class="form-check-label" for="promotions">
                                    Promotions and offers
                                </label>
                            </div>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="newsletter">
                                <label class="form-check-label" for="newsletter">
                                    Newsletter subscription
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h6 class="mb-3">Privacy Settings</h6>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="dataSharing" checked>
                                <label class="form-check-label" for="dataSharing">
                                    Allow data sharing for better experience
                                </label>
                            </div>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="personalization" checked>
                                <label class="form-check-label" for="personalization">
                                    Personalized recommendations
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-center">
                <button class="btn btn-primary">Save Settings</button>
            </div>
        `;

        $('#settingsContent').html(settingsHTML);
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Add to body
        $('body').append(alertHTML);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            $('.alert').fadeOut(() => {
                $('.alert').remove();
            });
        }, 3000);
    }
}

// Global logout function
function logout() {
    console.log('Logout function called');
    
    // Clear all authentication data
    if (localStorage.getItem('organic_user')) {
        localStorage.removeItem('organic_user');
    }
    if (localStorage.getItem('organic_remember')) {
        localStorage.removeItem('organic_remember');
    }
    if (sessionStorage.getItem('organic_user')) {
        sessionStorage.removeItem('organic_user');
    }
    
    // Clear cart data
    if (localStorage.getItem('organic_cart')) {
        localStorage.removeItem('organic_cart');
    }
    
    // Clear current user from auth system
    if (window.authSystem) {
        window.authSystem.currentUser = null;
        window.authSystem.isLoggedIn = false;
    }
    
    // Redirect to home page
    window.location.href = 'index.html';
}



// Initialize when document is ready
$(document).ready(() => {
    new MyAccountPage();
}); 