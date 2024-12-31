async function displayMatchStatistics(matchId) {
    try {
        const storedMatchData = JSON.parse(localStorage.getItem('matchData'));
        if (!storedMatchData) {
            throw new Error('No match data found in localStorage');
        }

        const match = storedMatchData.find(m => m.id === matchId);
        if (!match) {
            throw new Error(`Match with ID ${matchId} not found`);
        }

        hideAllContainers();
        const matchStatisticsContainer = document.getElementById('matchStatisticsContent');
        matchStatisticsContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Player 1</th>
                        <th>Player 2</th>
                        <th>Winner</th>
                        <th>Date</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${match.player1.nickname}</td>
                        <td>${match.player2.nickname}</td>
                        <td>${match.winner}</td>
                        <td>${match.date}</td>
                        <td>${match.details}</td>
                    </tr>
                </tbody>
            </table>
            <canvas id="gameImageCanvas" width="400" height="300" style="border:1px solid #000000; margin-top:20px;"></canvas>
        `;
        document.getElementById('matchStatisticsContainer').style.display = 'block';

        // Draw the game field on the canvas
        const canvas = document.getElementById('gameImageCanvas');
        const ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Paint the background black
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the field boundaries in white
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Draw the center line in white
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        // Draw the goals in white
        const goalWidth = 50; // Adjusted for smaller canvas
        const goalHeight = 10; // Adjusted for smaller canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((canvas.width - goalWidth) / 2, 0, goalWidth, goalHeight); // Top goal
        ctx.fillRect((canvas.width - goalWidth) / 2, canvas.height - goalHeight, goalWidth, goalHeight); // Bottom goal

        // Define a margin for the points
        const margin = 10;

        // Draw goal markers
        if (match.events) {
            match.events.forEach(event => {
                if (event.type === 'goal') {
                    let { x, y } = event.coordinates;
                    const direction = event.direction;

                    // Adjust coordinates to include margin and ensure they are within canvas boundaries
                    x = Math.max(margin, Math.min(canvas.width - margin, x));
                    y = Math.max(margin, Math.min(canvas.height - margin, y));

                    // Ensure coordinates are within canvas boundaries
                    x = Math.max(0, Math.min(canvas.width, x));
                    y = Math.max(0, Math.min(canvas.height, y));

                    ctx.fillStyle = direction === 'right' ? 'red' : 'yellow';
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        } else {
            console.error('No events found for match ID:', matchId);
        }
    } catch (error) {
        console.error('Error displaying match statistics:', error);
    }
}

function returnToHistory() {
    document.getElementById('matchStatisticsContainer').style.display = 'none';
    document.getElementById('matchHistoryContainer').style.display = 'block';
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // Existing event listeners...

    // Add event listener for the statistics button
    const statisticsButtons = document.querySelectorAll('.statisticsButton');
    statisticsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const matchId = this.getAttribute('data-match-id');
            displayMatchStatistics(matchId);
        });
    });

    // Add event listener for the overall statistics button
    const overallStatisticsButton = document.getElementById('overallStatisticsButton');
    if (overallStatisticsButton) {
        overallStatisticsButton.addEventListener('click', function() {
            displayOverallStatistics();
        });
    }
});

// Function to fetch match history
async function fetchMatchHistory() {
    try {
        const response = await fetch('/match_history/');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.matches;
    } catch (error) {
        console.error('Error fetching match history:', error);
        return [];
    }
}

// Function to display the last 10 matches and draw goal markers
async function displayLast10Matches() {
    hideAllContainers(); // Hide all containers
    const matchStatisticsContainer = document.getElementById('matchStatisticsContainer');
    if (matchStatisticsContainer) {
        matchStatisticsContainer.style.display = 'block'; // Display the statistics container
    }

    const matches = await fetchMatchHistory();
    const last10Matches = matches.slice(-10); // Get the last 10 matches
    const allEvents = [];
    let goalsMade = 0;
    let goalsTaken = 0;

    last10Matches.forEach(match => {
        allEvents.push(...match.events); // Collect all events
    });

    console.log(allEvents);

    drawGoalMarkers(allEvents, goalsMade, goalsTaken); // Draw goal markers for all events
}

// Function to draw goal markers on the canvas and count goals
function drawGoalMarkers(events, goalsMade, goalsTaken) {
    const canvas = document.getElementById('gameImageCanvas');
    const ctx = canvas.getContext('2d');
    const margin = 10;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Paint the background black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the field boundaries in white
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw the center line in white
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Draw goal markers and count goals
    events.forEach(event => {
        if (event.type === 'goal') {
            let { x, y } = event.coordinates;
            const direction = x > 0 ? 'right' : 'left';

            // Adjust coordinates to include margin and ensure they are within canvas boundaries
            x = Math.max(margin, Math.min(canvas.width - margin, x));
            y = Math.max(margin, Math.min(canvas.height - margin, y));

            // Ensure coordinates are within canvas boundaries
            x = Math.max(0, Math.min(canvas.width, x));
            y = Math.max(0, Math.min(canvas.height, y));

            ctx.fillStyle = direction === 'right' ? 'red' : 'yellow';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();

            // Count goals
            if (direction === 'right') {
                goalsMade++;
            } else if (direction === 'left') {
                goalsTaken++;
            }
        }
    });

    // Display the sum of goals made and taken on the canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Goals Made: ${goalsMade}`, canvas.width - 200, 30);
    ctx.fillText(`Goals Taken: ${goalsTaken}`, 10, 30);
}