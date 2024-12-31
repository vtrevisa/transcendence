// menu.js

// Function to return to the main menu
async function returnToMenu() {
    hideAllContainers();
    try {
        if (window.isOnline) {
            document.getElementById('profileContainer').style.display = 'flex';
        } else {
            document.getElementById('menuContainer').style.display = 'block';
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}

// Function to select game mode
function selectMode(mode) {
    hideAllContainers();
    if (mode === 'vsPlayer') {
        showVsGame();
    } else if (mode === 'tournament') {
        showTournament();
    } else if (mode === 'fourPlayer') {
        showFourPlayers();
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const data = await checkLoginStatus();
    if (window.isOnline) {
        hideAllContainers();
        displayProfile(data);
        document.getElementById('gameModeContainer').style.display = 'flex';
        document.getElementById('profileContainer').style.display = 'flex';
        document.getElementById('logoutButton').style.display = 'block';
        } else {
        returnToMenu();
    }
});