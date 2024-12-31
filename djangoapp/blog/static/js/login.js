// login.js
window.isOnline = false; // Initialize as false

// Function to check if the user is logged in
async function checkLoginStatus() {
    try {
        const response = await fetch('/check_login/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            redirect: 'manual' // Prevent automatic redirection
        });

        if (response.status === 302) {
            const redirectUrl = response.headers.get('Location');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
            return false;
        }

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        if (data.logged_in) {
            window.isOnline = true;
            return data;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Function to handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('loginForm'));
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await fetch('/login/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: formData
        });
        if (!response.ok) {
            console.log('Network response was not ok');
        }
        const data = await response.json();
        if (data.success != false) {
            console.log('data.success: ', data.message);
            alert(data.message);
            // Show OTP input form
            document.getElementById('otpContainer').style.display = 'block';
            document.getElementById('loginContainer').style.display = 'none';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to handle OTP verification form submission
async function verifyOtp(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const otp = document.getElementById('otp').value;
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await fetch('/verify-otp/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ username, otp })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            alert('Login successful');
            window.isOnline = true;
            // Redirect to protected page
            window.location.href = '/';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to handle logout
async function logout() {
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await fetch('/logout/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        if (response.ok) {
            window.location.reload();
        } else {
            alert('Logout failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Optimized event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', async function() {

    // Event listener for login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Event listener for logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Event listener for OTP form submission
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', verifyOtp);
    }
});