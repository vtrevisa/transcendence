// friendlist.js

// Function to show the friend list
async function fetchFriendList() {
    try {
        const response = await fetch('/get_friends/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        if (!response.ok) {
            console.error('Response status:', response.status);
            console.error('Response status text:', response.statusText);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.friends) {  // Ensure data.friends exists
            // Populate the friend list table
            const friendListTableBody = document.getElementById('friendListTable').getElementsByTagName('tbody')[0];
            friendListTableBody.innerHTML = ''; // Clear existing rows
            data.friends.forEach(friend => {
                const row = friendListTableBody.insertRow();
                const usernameCell = row.insertCell(0);
                const nicknameCell = row.insertCell(1);
                const statusCell = row.insertCell(2);
                const actionCell = row.insertCell(3);
                usernameCell.textContent = friend.username;
                nicknameCell.textContent = friend.nickname;
                statusCell.textContent = friend.is_online ? 'Online' : 'Offline';
                actionCell.innerHTML = `<button onclick="removeFriend('${friend.username}')">Remove</button>`;
            });
        } else {
            console.error('Error fetching friend list:', data.message);
            alert('Error fetching friend list: ' + data.message);
        }
    } catch (error) {
        console.error('Error fetching friend list:', error);
        alert('An error occurred while fetching the friend list.');
    }
}

// Function to show the add friend form
function showAddFriendForm() {
    hideAllContainers();
    const addFriendContainer = document.getElementById('addFriendContainer');
    addFriendContainer.style.display = 'block';
}

// Function to handle add friend form submission
async function handleAddFriend(event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('addFriendForm'));
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await fetch('/add_friend/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: formData.get('username')
            })
        });
        if (!response.ok) {
            console.error('Response status:', response.status);
            console.error('Response status text:', response.statusText);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.success) {
            alert('Friend added successfully');
            showFriendList();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error adding friend:', error);
    }
}

// Function to remove a friend
async function removeFriend(username) {
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await fetch('/delete_friend/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });
        if (!response.ok) {
            console.error('Response status:', response.status);
            console.error('Response status text:', response.statusText);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.success) {
            alert('Friend removed successfully');
            showFriendList();
        } else {
            alert('Failed to remove friend: ' + data.message);
        }
    } catch (error) {
        console.error('Error removing friend:', error);
        alert('An error occurred while trying to remove the friend.');
    }
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // Event listener for add friend form submission
    const addFriendForm = document.getElementById('addFriendForm');
    if (addFriendForm) {
        addFriendForm.addEventListener('submit', handleAddFriend);
    }
});