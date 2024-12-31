// Function to show the status table
async function fetchStatus() {
    try {
        const response = await fetch('/status/');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const statusTableBody = document.getElementById('statusTable').getElementsByTagName('tbody')[0];
        statusTableBody.innerHTML = `
            <tr>
                <td>${data.matches}</td>
                <td>${data.wins}</td>
                <td>${data.losses}</td>
                <td>${data.winrate}</td>
            </tr>
        `;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateStatusCounter(username, result) {
    const response = await fetch('/update_status_counter/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Ensure CSRF token is included
        },
        body: JSON.stringify({ username: username, result: result })
    });

    if (response.ok) {
        const data = await response.json();
    } else {   }
}