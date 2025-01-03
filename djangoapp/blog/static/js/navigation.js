// Function to navigate to a route and update the browser history
function navigateTo(route, params = {}) {
    window.history.pushState(params, '', `#${route}`);
    loadPage(route, params);
}

// Function to load the appropriate content based on the route
function loadPage(route, params) {
    switch (route) {
        case 'login':
            showLogin(params);
            break;
        case 'sign_in':
            showSignIn(params);
            break;
        case 'versusplayer':
            showVsGame(params);
            break;
        case 'tournament':
            showTournament(params);
            break;
        case 'fourplayers':
            showFourPlayers(params);
            break;
        case 'settings':
            showSettings(params);
            break;
        case 'profile':
            showUpdateProfile(params);
            break;
        case 'friendlist':
            showFriendList(params);
            break;
        case 'showStatus':
            showStatus(params);
            break;
        case 'matchHistory':
            showMatchHistory(params);
            break;
        case 'statistics':
            showStatistics(params);
            break;
        case 'home':
            showHome(params);
            break;
        default:
            showHome(params);
            break;
    }
}

// Event listener for popstate to handle browser navigation
window.addEventListener('popstate', function(event) {
    const route = window.location.hash.substring(1);
    loadPage(route, event.state);
});

// Example functions to show different pages
function showHome(params) {
    returnToMenu();
}

function showLogin(params) {
    hideAllContainers();
    document.getElementById('loginContainer').style.display = 'block';
}

function showSignIn(params) {
    hideAllContainers();
    document.getElementById('signInContainer').style.display = 'block';
}

function showVsGame(params) {
    hideAllContainers();
    document.getElementById('nicknameContainer').style.display = 'block';
}

function showTournament(params) {
    hideAllContainers();
    document.getElementById('tournamentContainer').style.display = 'block';
}

function showFourPlayers(params) {
    hideAllContainers();
    document.getElementById('fourPlayerNicknameContainer').style.display = 'block';
}

function showSettings(params) {
    hideAllContainers();
    document.getElementById('settingsContainer').style.display = 'block';
}

function showUpdateProfile() {
    hideAllContainers();
    document.getElementById('updateProfileContainer').style.display = 'block';
}

function showFriendList() {
    hideAllContainers();
    document.getElementById('friendListContainer').style.display = 'block';
    fetchFriendList();
}

async function showStatus() {
    hideAllContainers();
    document.getElementById('statusContainer').style.display = 'block';
    fetchStatus();
}

function showMatchHistory(params) {
    hideAllContainers();
    displayMatchHistory();
}

function showStatistics(params) {
    hideAllContainers();
    document.getElementById('statisticsContainer').style.display = 'block';
    displayLast10Matches();
}
