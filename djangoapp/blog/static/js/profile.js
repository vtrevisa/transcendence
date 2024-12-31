// profile.js

// Define containers variable at the top

const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
const profileNickname = document.getElementById('profileNickname');
const profileAvatar = document.getElementById('profileAvatar');

const profileContainer = document.getElementById('profileContainer');

const gameModeContainer = document.getElementById('gameModeContainer');
const logoutButton = document.getElementById('logoutButton');
const editProfileButton = document.getElementById('editProfileButton');
const friendListButton = document.getElementById('friendListButton');
const historyButton = document.getElementById('historyButton');
const player1NicknameInput = document.getElementById('player1Nickname');
const tournamentPlayer1Input = document.getElementById('player1');
const fourPlayer1NicknameInput = document.getElementById('player1Nickname4');

function displayProfile(profile) {
    console.log('profile: ', profile);
    showProfileInfo(profile);
    if (profileContainer) profileContainer.style.display = 'flex';
    if (gameModeContainer) gameModeContainer.style.display = 'flex';
    if (logoutButton) logoutButton.style.display = 'block';
    if (player1NicknameInput) {
        player1NicknameInput.value = profile.nickname;
        player1NicknameInput.readOnly = true;  // Make the field read-only
    }
    if (tournamentPlayer1Input) {
        tournamentPlayer1Input.value = profile.nickname;
        tournamentPlayer1Input.readOnly = true;  // Make the field read-only
    }
    if (fourPlayer1NicknameInput) {
        fourPlayer1NicknameInput.value = profile.nickname;
        fourPlayer1NicknameInput.readOnly = true;  // Make the field read-only
    }
}

function showProfileInfo(profile) {
    if (profileUsername) profileUsername.textContent = profile.username;
    if (profileEmail) profileEmail.textContent = profile.email;
    if (profileNickname) profileNickname.textContent = profile.nickname;
    if (profileAvatar) profileAvatar.src = profile.avatar_url;
}

// Function to handle profile update form submission
async function handleProfileUpdate(event) {
    event.preventDefault();
    const formData = new FormData();
    const email = document.getElementById('updateEmail').value;
    const nickname = document.getElementById('updateNickname').value;
    const avatar = document.getElementById('updateAvatar').files[0];
    if (email) {
        formData.append('email', email);
    }
    if (nickname) {
        formData.append('nickname', nickname);
    }
    if (avatar) {
        formData.append('avatar', avatar);
    }
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await fetch('/update_profile/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            alert('Profile updated successfully');
            window.location.reload();
        } else {
            alert('Profile update failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', async function() {
    if (window.isOnline) {
        displayProfile(isLoggedIn);
        document.getElementById('menuContainer').style.display = 'none';
        document.getElementById('gameModeContainer').style.display = 'block';
    } else {
        returnToMenu();
    }

    // Event listener for profile update form submission
    const updateProfileForm = document.getElementById('updateProfileForm');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', handleProfileUpdate);
    }
});

