// Authentication and User Management System
class AuthSystem {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // Login form submission
        $('#loginForm').on('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Registration form submission
        $('#registerForm').on('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        // Show registration modal
        $('#showRegister').on('click', (e) => {
            e.preventDefault();
            $('#registerModal').modal('show');
        });

        // Logout functionality
        $(document).on('click', '.logout-btn', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    handleLogin() {
        const email = $('#email').val();
        const password = $('#password').val();
        const rememberMe = $('#rememberMe').is(':checked');

        // Simple validation
        if (!email || !password) {
            this.showAlert('Please fill in all fields', 'danger');
            return;
        }

        // Simulate API call - in real app, this would be an actual API request
        this.simulateLogin(email, password, rememberMe);
    }

    handleRegistration() {
        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const email = $('#registerEmail').val();
        const password = $('#registerPassword').val();
        const confirmPassword = $('#confirmPassword').val();
        const agreeTerms = $('#agreeTerms').is(':checked');

        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            this.showAlert('Please fill in all fields', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            this.showAlert('Passwords do not match', 'danger');
            return;
        }

        if (!agreeTerms) {
            this.showAlert('Please agree to the terms and conditions', 'danger');
            return;
        }

        // Simulate registration
        this.simulateRegistration(firstName, lastName, email, password);
    }

    simulateLogin(email, password, rememberMe) {
        // Show loading state
        const submitBtn = $('#loginForm button[type="submit"]');
        const originalText = submitBtn.text();
        submitBtn.text('Signing In...').prop('disabled', true);

        // Simulate API delay
        setTimeout(() => {
            // For demo purposes, accept any email/password combination
            // In real app, this would validate against backend
            if (email && password) {
                const user = {
                    id: Date.now(),
                    email: email,
                    firstName: email.split('@')[0],
                    lastName: 'User',
                    avatar: this.generateAvatar(email)
                };

                this.login(user, rememberMe);
                this.showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect to home page after successful login
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showAlert('Invalid credentials', 'danger');
            }

            // Reset button
            submitBtn.text(originalText).prop('disabled', false);
        }, 1500);
    }

    simulateRegistration(firstName, lastName, email, password) {
        // Show loading state
        const submitBtn = $('#registerForm button[type="submit"]');
        const originalText = submitBtn.text();
        submitBtn.text('Creating Account...').prop('disabled', true);

        // Simulate API delay
        setTimeout(() => {
            const user = {
                id: Date.now(),
                email: email,
                firstName: firstName,
                lastName: lastName,
                avatar: this.generateAvatar(email)
            };

            this.login(user, false);
            this.showAlert('Account created successfully!', 'success');
            
            // Close modal and redirect
            $('#registerModal').modal('hide');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

            // Reset button
            submitBtn.text(originalText).prop('disabled', false);
        }, 1500);
    }

    login(user, rememberMe) {
        this.currentUser = user;
        this.isLoggedIn = true;

        // Store user data
        if (rememberMe) {
            localStorage.setItem('organic_user', JSON.stringify(user));
            localStorage.setItem('organic_remember', 'true');
        } else {
            sessionStorage.setItem('organic_user', JSON.stringify(user));
        }

        // Update UI
        this.updateUI();
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;

        // Clear stored data
        localStorage.removeItem('organic_user');
        localStorage.removeItem('organic_remember');
        sessionStorage.removeItem('organic_user');

        // Update UI
        this.updateUI();

        // Redirect to login if on protected page
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    checkLoginStatus() {
        // Check for stored user data
        let user = localStorage.getItem('organic_user');
        if (!user) {
            user = sessionStorage.getItem('organic_user');
        }

        if (user) {
            try {
                this.currentUser = JSON.parse(user);
                this.isLoggedIn = true;
            } catch (e) {
                console.error('Error parsing user data:', e);
                this.logout();
            }
        }
    }

    updateUI() {
        // Update user icon in header
        const userIcon = $('#userIcon');
        
        if (this.isLoggedIn && this.currentUser) {
            // User is logged in - show simple user icon that links to My Account
            if (!userIcon.hasClass('user-menu')) {
                userIcon.removeClass('user-menu').html(`
                    <a href="my-account.html" class="p-2 mx-1 text-decoration-none">
                        <svg width="24" height="24" class="text-primary"><use xlink:href="#user"></use></svg>
                    </a>
                `);
            }
        } else {
            // User is not logged in - show login icon
            if (userIcon.hasClass('user-menu')) {
                userIcon.removeClass('user-menu').html(`
                    <svg width="24" height="24"><use xlink:href="#user"></use></svg>
                `);
            }
        }
    }

    generateAvatar(email) {
        // Generate a simple avatar based on email
        const colors = ['#6BB252', '#a3be4c', '#F95F09', '#364127', '#6c757d'];
        const color = colors[email.length % colors.length];
        const initials = email.substring(0, 2).toUpperCase();
        
        return `data:image/svg+xml;base64,${btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="${color}"/>
                <text x="20" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
            </svg>
        `)}`;
    }

    showAlert(message, type) {
        // Create alert element
        const alert = $(`
            <div class="alert alert-${type} alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);

        // Add to page
        $('body').append(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.alert('close');
        }, 5000);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.isLoggedIn && this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize authentication system
$(document).ready(function() {
    window.authSystem = new AuthSystem();
}); 