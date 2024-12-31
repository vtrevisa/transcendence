// menu.js
window.data = {};
// Function to return to the main menu
async function returnToMenu() {
    hideAllContainers();
    if (window.isOnline) {
        displayProfile (window.data);
    } else {
        hideAllContainers();
        document.getElementById('menuContainer').style.display = 'block';
    }
}

// Function to select game mode
function selectMode(mode) {
    hideAllContainers();
    if (mode === 'vsPlayer') {
        navigateTo('versusplayer');
    } else if (mode === 'tournament') {
        navigateTo('tournament');
    } else if (mode === 'fourPlayer') {
        navigateTo('fourplayers');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
   window.data = await checkLoginStatus();
        returnToMenu();
});