let currentPage = 1;
const itemsPerPage = 10;
let fetchedMatchData = []; // Store fetched match data

function showMatchHistory() {
    fetch('/match_history/')
        .then(response => response.json())
        .then(data => {
            fetchedMatchData = data.matches; // Store fetched match data
            // Store match data in localStorage
            localStorage.setItem('matchData', JSON.stringify(fetchedMatchData));

            const matchHistoryTableBody = document.getElementById('matchHistoryTable').getElementsByTagName('tbody')[0];
            matchHistoryTableBody.innerHTML = ''; // Clear existing rows

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageMatches = fetchedMatchData.slice(startIndex, endIndex);

            pageMatches.forEach(match => {
                const row = matchHistoryTableBody.insertRow();
                const player1Cell = row.insertCell(0);
                const player2Cell = row.insertCell(1);
                const winnerCell = row.insertCell(2);
                const dateCell = row.insertCell(3);
                const detailsCell = row.insertCell(4);
                const statsCell = row.insertCell(5);

                player1Cell.textContent = match.player1.username;
                player2Cell.textContent = match.player2.nickname;
                winnerCell.textContent = match.winner;
                dateCell.textContent = match.date;
                detailsCell.textContent = match.details;

                const statsButton = document.createElement('button');
                statsButton.textContent = 'Statistics';
                statsButton.classList.add('statisticsButton');
                statsButton.setAttribute('data-match-id', match.id);
                statsButton.onclick = function() {
                    displayMatchStatistics(match.id);
                };
                statsCell.appendChild(statsButton);
            });

            document.getElementById('matchHistoryContainer').style.display = 'block';

            // Update pagination controls
            updatePaginationControls();
        })
        .catch(error => console.error('Error fetching match history:', error));
}

function updatePaginationControls() {
    const pageInfo = document.getElementById('pageInfo');
    const totalPages = Math.ceil(fetchedMatchData.length / itemsPerPage);

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    document.getElementById('prevPageButton').disabled = currentPage === 1;
    document.getElementById('nextPageButton').disabled = currentPage === totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        showMatchHistory();
    }
}

function nextPage() {
    const totalPages = Math.ceil(fetchedMatchData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        showMatchHistory();
    }
}

async function recordGameHistory(matchData) {
    const response = await fetch('/record_game_history/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Ensure CSRF token is included
        },
        body: JSON.stringify(matchData)
    });

    if (response.ok) {
        const data = await response.json();
    } else {    }
}

// Event listener for the match history button
const matchHistoryButton = document.getElementById('historyButton');
if (matchHistoryButton) {
    matchHistoryButton.addEventListener('click', showMatchHistory);
}