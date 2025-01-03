// Function to handle sign-in form submission
async function handleSignIn(event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('signInForm'));
    const csrfToken = getCookie('csrftoken');
    const nickname = formData.get('nickname');
    const nicknamePattern = /[a-zA-Z0-9]/;

    // Validate nickname
    if (!nickname || !nicknamePattern.test(nickname)) {
        alert('Please input a valid nickname with at least one letter or number.');
        return;
    }
    
    try {
        const response = await fetch('/sign_in/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: formData
        });
        if (!response.ok) {
            console.log('handleSignIn: ', response);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.success) {
            // Redirect to the menu page
            window.location.href = '/';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', handleSignIn);
    } else {
        console.error('Sign-in form not found'); // Debugging log
    }
});