
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
            } else {            }
            return false;
        }

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        if (data.logged_in) {
            // User is logged in, proceed with the rest of your code
            displayProfile(data);
            document.getElementById('menuContainer').style.display = 'none';
            document.getElementById('gameModeContainer').style.display = 'block';
            return true;
        } else {
            document.getElementById('menuContainer').style.display = 'block';
            document.getElementById('gameModeContainer').style.display = 'none';
            return false;
        }
    } catch (error) {
        document.getElementById('menuContainer').style.display = 'block';
        document.getElementById('gameModeContainer').style.display = 'none';
        return false;
    }
}

// Call the function to check login status when the script loads
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

// Function to show the profile update form
function showUpdateProfile() {
    hideAllContainers();
    document.getElementById('updateProfileContainer').style.display = 'block';
}
