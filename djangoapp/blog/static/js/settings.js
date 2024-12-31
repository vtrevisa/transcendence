// settings.js

// Function to show the settings container
function showSettings() {
    hideAllContainers();
    const settingsContainer = document.getElementById('settingsContainer');
    settingsContainer.style.display = 'block';
}

// Function to apply the game mode settings and redirect to the menu
function applySettings() {
    const enableObstacles = document.getElementById('enableObstacles').checked;
    const enableMultipleBalls = document.getElementById('enableMultipleBalls').checked;
    const numberOfBalls = parseInt(document.getElementById('numberOfBalls').value, 10);
    const ballSpeed = parseInt(document.getElementById('ballSpeed').value, 10);
    const paddleSpeed = parseInt(document.getElementById('paddleSpeed').value, 10);

    // Apply game modes settings
    window.gameSettings = {
        enableObstacles,
        enableMultipleBalls,
        numberOfBalls,
        ballSpeed,
        paddleSpeed
    };

    returnToMenu();
}

// Function to reset the settings to default
function resetSettings() {
    document.getElementById('enableObstacles').checked = false;
    document.getEleme// Event listener for DOM content loaded
    document.addEventListener('DOMContentLoaded', function() {
        containers = document.querySelectorAll('.container');
        checkLoginStatus().then(isLoggedIn => {
            if (!isLoggedIn) {
                returnToMenu();
            }
        });
    
        // Event listener for profile update form submission
        const updateProfileForm = document.getElementById('updateProfileForm');
        if (updateProfileForm) {
            updateProfileForm.addEventListener('submit', handleProfileUpdate);
        }
    
        // Event listener for the match history button
        document.getElementById('matchHistoryButton').addEventListener('click', showMatchHistory);
    });
    
    document.addEventListener('DOMContentLoaded', async function() {
        const isLoggedIn = await checkLoginStatus();
        if (isLoggedIn) {
            displayProfile(isLoggedIn);
            document.getElementById('menuContainer').style.display = 'none';
            document.getElementById('gameModeContainer').style.display = 'block';
        } else {
            document.getElementById('menuContainer').style.display = 'block';
            document.getElementById('gameModeContainer').style.display = 'none';
        }
    });
}

// Function to initialize settings
function initializeSettings() {
    document.getElementById('confirmButton').addEventListener('click', applySettings);
    document.getElementById('resetButton').addEventListener('click', resetSettings);
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
});