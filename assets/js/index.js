function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Form validation
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (!validatePassword(password)) {
        alert('Password must be at least 8 characters long');
        return;
    }
    
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('root').classList.add('content-blur');
    document.body.classList.add('disabled');

    const loginData = {
        userEmail: email,
        password: password
    };
    fetch(API_URLS.login, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('overlay').classList.add('hidden');
            document.getElementById('root').classList.remove('content-blur');
            document.body.classList.remove('disabled');

            if (data.status === 'Verified') {
                // Get the role from the response and navigate accordingly
                const role = data.role;
                const token = data.token;
                var takenToken = "";
                if (token != null) {
                    setSessionToken(token);
                }
                if (role === 'Super Admin') {
                    window.location.href = 'pages/superAdminDashboard.html';
                } else if (role === 'Owner') {
                    window.location.href = 'pages/orgOwnerDashboard.html';
                } else if (role === 'Organization Admin') {
                    window.location.href = 'pages/orgAdminDashboard.html';
                } else if (role === 'Site Admin') {
                    window.location.href = 'pages/siteAdminDashboard.html';
                } else if (role === 'PC Admin') {
                    window.location.href = '/pages/pcAdminDashboard.html';
                }
            } else {
                alert('Invalid credentials, please try again!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('overlay').classList.add('hidden');
            document.getElementById('root').classList.remove('content-blur');
            document.body.classList.remove('disabled');
            
            let errorMessage = 'An error occurred. Please try again later.';
            if (!navigator.onLine) {
                errorMessage = 'Please check your internet connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        });
});

document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    const eyePath = document.getElementById('eyePath');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        // Open eye icon path
        eyePath.setAttribute('d', 'M15 12c-1.5 0-2.9-.5-4-1.3-1.1.8-2.5 1.3-4 1.3C3.1 12 0 9 0 9s3.1-3 7-3c1.5 0 2.9.5 4 1.3C12.1 6.5 13.5 6 15 6c3.9 0 7 3 7 3s-3.1 3-7 3z');
    } else {
        passwordField.type = 'password';
        // Closed eye icon path
        eyePath.setAttribute('d', 'M10 2C5.58 2 1.73 4.61 0 8c1.73 3.39 5.58 6 10 6s8.27-2.61 10-6c-1.73-3.39-5.58-6-10-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6a2 2 0 100 4 2 2 0 000-4z');
    }
});
const checkToken = getSessionToken();
if (checkToken != null) {


}

function setSessionToken(token) {
    document.cookie = `sessionToken=${token}; Secure; SameSite=Strict; Path=/;`;
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

// Add remember me functionality
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
