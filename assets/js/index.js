// Constants
const ROLE_REDIRECTS = {
    'Super Admin': '/pages/superAdminDashboard.html',
    'Owner': '/pages/orgOwnerDashboard.html',
    'Organization Admin': '/pages/orgAdminDashboard.html',
    'Site Admin': '/pages/siteAdminDashboard.html',
    'PC Admin': '/pages/pcAdminDashboard.html'
};

// Helper functions
function showLoading() {
    const overlay = document.getElementById('overlay');
    const root = document.getElementById('root');
    
    if (overlay) overlay.classList.remove('hidden');
    if (root) root.classList.add('content-blur');
    document.body.classList.add('disabled');
}

function hideLoading() {
    const overlay = document.getElementById('overlay');
    const root = document.getElementById('root');
    
    if (overlay) overlay.classList.add('hidden');
    if (root) root.classList.remove('content-blur');
    document.body.classList.remove('disabled');
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function getSessionToken() {
    const name = "sessionToken=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return null;
}

// Authentication check
function checkAuthentication() {
    const token = getSessionToken();
    if (token) {
        showLoading();
        fetch(API_URLS.login + '&verify=true', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.status === 'Verified') {
                const redirectUrl = ROLE_REDIRECTS[data.role];
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                }
            } else {
                document.cookie = 'sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
        })
        .catch(() => {
            hideLoading();
            document.cookie = 'sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        });
    }
}

// Remember me functionality
const rememberCheckbox = document.getElementById('remember');
if (localStorage.getItem('rememberedEmail')) {
    document.getElementById('email').value = localStorage.getItem('rememberedEmail');
    rememberCheckbox.checked = true;
}

rememberCheckbox.addEventListener('change', function() {
    if (!this.checked) {
        localStorage.removeItem('rememberedEmail');
    }
});

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get all required elements
    const errorDiv = document.getElementById('login-error');
    const errorMessage = errorDiv?.querySelector('p');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;

    // Show loading
    showLoading();
    
    // Clear any existing error messages
    if (errorDiv) errorDiv.classList.add('hidden');

    try {
        const response = await fetch(API_URLS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userEmail: email,
                password: password
            })
        });

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            throw new Error(`Account not found! status: ${response.status}`);
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('JSON Parse Error:', jsonError);
            throw new Error('Server response was not in the correct format. Please try again.');
        }

        if (data.status === 'Verified') {
            // Store user details immediately after successful login
            localStorage.setItem('userDetails', JSON.stringify({
                name: data.userDetails.userName,
                email: data.userDetails.userEmail,
                role: data.role,
                initials: data.userDetails.userName.split(' ').map(n => n[0]).join('').toUpperCase()
            }));

            // Store credentials if remember me is checked
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            }

            // Set token in cookie
            document.cookie = `sessionToken=${data.token}; path=/`;

            // Redirect based on role
            const redirectUrl = ROLE_REDIRECTS[data.role];
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        } else {
            // Show error message in the page
            if (errorDiv && errorMessage) {
                errorDiv.classList.remove('hidden');
                errorMessage.textContent = 'Invalid credentials. Please try again.';
            }
            hideLoading();
        }
    } catch (error) {
        console.error('Login Error:', error);
        // Show error message in the page
        if (errorDiv && errorMessage) {
            errorDiv.classList.remove('hidden');
            errorMessage.textContent = error.message || 'An error occurred during login. Please try again later.';
        }
        hideLoading();
    }
});

// Password toggle functionality
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    const eyePath = document.getElementById('eyePath');

    if (passwordField.type === 'password') {
        // Show password (open eye)
        passwordField.type = 'text';
        eyePath.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
    } else {
        // Hide password (crossed eye)
        passwordField.type = 'password';
        eyePath.setAttribute('d', 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z');
    }
});

// Initialize authentication check
document.addEventListener('DOMContentLoaded', checkAuthentication);
