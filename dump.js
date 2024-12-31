function displayProfile(profile) {
    
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const profileNickname = document.getElementById('profileNickname');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileContainer = document.getElementById('profileContainer');
    const logoutButton = document.getElementById('logoutButton');
    const vsGameButton = document.getElementById('vsGameButton');
    const tournamentButton = document.getElementById('tournamentButton');
    const editProfileButton = document.getElementById('editProfileButton');
    const friendListButton = document.getElementById('friendListButton');
    const historyButton = document.getElementById('historyButton');
    const player1NicknameInput = document.getElementById('player1Nickname');
    const tournamentPlayer1Input = document.getElementById('player1');
    const fourPlayer1NicknameInput = document.getElementById('player1Nickname4');

    if (profileUsername) profileUsername.textContent = profile.username;
    if (profileEmail) profileEmail.textContent = profile.email;
    if (profileNickname) profileNickname.textContent = profile.nickname;
    console.log('profileNickname.textContent: ', profileNickname.textContent);
    console.log('profileNickname.value: ', profileNickname.value);
    if (!profileNickname.textContent)
        {
            alert('Please input your nickname.');
            hideAllContainers();
            navigateTo('profile');
        }
    if (profileAvatar) profileAvatar.src = profile.avatar_url;
    if (profileContainer) profileContainer.style.display = 'flex';
    if (logoutButton) logoutButton.style.display = 'block';
    if (vsGameButton) vsGameButton.style.display = 'block';
    if (tournamentButton) tournamentButton.style.display = 'block';
    if (editProfileButton) editProfileButton.style.display = 'block';
    if (friendListButton) friendListButton.style.display = 'block';
    if (historyButton) historyButton.style.display = 'block';
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