// common.js

// Utility function to get a cookie value by name
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to hide all containers
function hideAllContainers() {
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
        container.style.display = 'none';
    });
}

async function fetchUsernameByNickname(nickname) {
    const response = await fetch(`/get_username_by_nickname?nickname=${nickname}`);
    const data = await response.json();
    return data.username;
}

// Event listener for popstate to handle browser navigation
window.addEventListener('popstate', function(event) {
    const route = window.location.hash.substring(1);
    loadPage(route, event.state);
});