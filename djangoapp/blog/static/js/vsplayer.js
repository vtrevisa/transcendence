// vsplayer.js

// Global object to store match data
let matchData = {
    id: '', // Add an ID field
    player1: {
        username: '',
        nickname: '',
        score: 0,
    },
    player2: {
        nickname: '',
        score: 0,
    },
    startTime: '',
    endTime: '',
    events: [], // Array to store events like goals, fouls, etc.
};

// Game variables and canvas setup
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
let team1Score = 0;
let team2Score = 0;
let player1Nickname = "Player 1";
let player2Nickname = "Player 2";
let player3Nickname = "Player 3";
let player4Nickname = "Player 4";
let gameStarted = false;
let gameEnded = true;
let balls = [];
let player1, player2, player3, player4;
let mode = '1v1'; // Global variable to store the game mode
let side = -1;

const defaultPaddleSpeed = 12;
let player1Y = canvas.height / 2 - 30;
let player2Y = canvas.height / 2 - 30;
let player3Y = canvas.height / 4 - 30;
let player4Y = canvas.height / 4 - 30;
const maxScore = 5;

// Load all necessary containers
const gameContainer = document.getElementById('gameContainer');
const scoreDisplay = document.getElementById('scoreDisplay');
const buttonContainer = document.querySelector('.button-container');
const tButtonContainer = document.querySelector('.tButton-container');

// Global mapping object
const nicknameToUsernameMap = {};

// Initialize game settings
let gameSettings = {
    enableObstacles: false,
    enableMultipleBalls: false,
    numberOfBalls: 1,
    ballSpeed: 10,
    paddleSpeed: 12
};

async function startVsPlayerGame(selectedMode) {
    mode = selectedMode; // Set the global mode variable
    window.isTournamentMode = (mode === 'tournament');

    if (mode === '2v2') {
        player1Nickname = document.getElementById('player1Nickname4').value || "Player 1";
        player2Nickname = document.getElementById('player2Nickname4').value || "Player 2";
        player3Nickname = document.getElementById('player3Nickname4').value || "Player 3";
        player4Nickname = document.getElementById('player4Nickname4').value || "Player 4";

    } else {
        player1Nickname = document.getElementById('player1Nickname').value || "Player 1";
        player2Nickname = document.getElementById('player2Nickname').value || "Player 2";
    }
    if (window.isOnline) {
        // Fetch username for Player 1 and Player 2 from the server only if the user is logged
        const player1Username = await fetchUsernameByNickname(player1Nickname);
        const player2Username = await fetchUsernameByNickname(player2Nickname);
        // Populate the mapping object
        if (player1Username)
            nicknameToUsernameMap[player1Nickname] = player1Username;
        if (player2Username)
            nicknameToUsernameMap[player2Nickname] = player2Username;
    }
    hideAllContainers();
    gameContainer.style.display = 'block';
    scoreDisplay.style.display = 'block';  // Make sure score is visible at the start

    if (mode === 'tournament') {
        buttonContainer.style.display = 'none';
        tButtonContainer.style.display = 'none';
    } else {
        buttonContainer.style.display = 'block';
        tButtonContainer.style.display = 'none';
    }

    resetGame();
    draw();

    gameStarted = false;
    gameEnded = false;
}

function resetGame() {
    team1Score = 0;
    team2Score = 0;
    resetBall();
    draw();
    updateScore();
    gameStarted = false; // Ensure gameStarted is set to false
    gameEnded = false; // Ensure gameEnded is set to false
    resetGameData(); // Reset match data
}

// Function to log ball angle and direction
function logBallAngleAndDirection(angle, direction) {
    matchData.events.push({
        type: 'ball_start',
        angle: angle,
        direction: direction,
        timestamp: new Date().toISOString(),
    });
}

// Function to log goal coordinates
function logGoalCoordinates(x, y) {
    matchData.events.push({
        type: 'goal',
        coordinates: { x: x, y: y },
        timestamp: new Date().toISOString(),
    });
}

function resetGameData() {
    matchData = {
        player1: {
            username: '',
            nickname: '',
            score: 0,
        },
        player2: {
            username: '',
            nickname: '',
            score: 0,
        },
        startTime: '',
        endTime: '',
        events: [], // Reset events array
    };
}

// Function to start the game with the current settings
function startGame() {
    if (window.gameSettings) {
        gameSettings = window.gameSettings;
    }
    resetBall(); // Initialize balls with the current settings

    if (mode === '2v2') {
        player1.speed = gameSettings.paddleSpeed;
        player2.speed = gameSettings.paddleSpeed;
        player3.speed = gameSettings.paddleSpeed;
        player4.speed = gameSettings.paddleSpeed;
        
    } else {
        player1.speed = gameSettings.paddleSpeed;
        player2.speed = gameSettings.paddleSpeed;
    }
    gameStarted = true;
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (gameStarted) {
        updateGame();
        requestAnimationFrame(gameLoop);
    }
}

function updateGame() {
    moveBall();
    detectCollision();
    draw();
    if (team1Score >= maxScore || team2Score >= maxScore) {
        gameStarted = false;
        gameEnded = true;
        if (mode === 'tournament')
            endTournamentGame();
        else
            endGame(mode);
        return;
    }
    updateScore(); // Update score display if game is still ongoing
}

function resetBall() {
    balls = []; // Array to hold multiple balls

    for (let i = 0; i < (gameSettings.enableMultipleBalls ? gameSettings.numberOfBalls : 1); i++) {
        const ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 8
        };

        // Set random direction for ball velocity
        const speed = gameSettings.ballSpeed; // Use the ball speed from settings
        let angle = ((Math.random() - 0.5) * (Math.PI / 2)); // Random angle in radians
        
        ball.vx = speed * Math.cos(angle) * side;
        ball.vy = speed * Math.sin(angle);
        side *= -1; // Alternate between left and right sides


        balls.push(ball);

        // Log ball angle and direction
        const direction = ball.vx > 0 ? 'right' : 'left';
        if (mode !== 'tournament')
            logBallAngleAndDirection(angle, direction);
    }

    if (mode === '2v2') {
        player1 = { x: 10, y: canvas.height / 4 - 30, width: 10, height: 60, speed: gameSettings.paddleSpeed }; // Top left
        player2 = { x: canvas.width - 20, y: canvas.height / 4 - 30, width: 10, height: 60, speed: gameSettings.paddleSpeed }; // Top right
        player3 = { x: 10, y: (3 * canvas.height) / 4 - 30, width: 10, height: 60, speed: gameSettings.paddleSpeed }; // Bottom left
        player4 = { x: canvas.width - 20, y: (3 * canvas.height) / 4 - 30, width: 10, height: 60, speed: gameSettings.paddleSpeed }; // Bottom right
    } else {
        player1 = { x: 10, y: canvas.height / 2 - 30, width: 10, height: 60, speed: gameSettings.paddleSpeed };
        player2 = { x: canvas.width - 20, y: canvas.height / 2 - 30, width: 10, height: 60, speed: gameSettings.paddleSpeed };
        player3 = null;
        player4 = null;
    }
}

function moveBall() {
    balls.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off top and bottom walls
        if (ball.y <= ball.radius || ball.y >= canvas.height - ball.radius) {
            ball.vy *= -1;
        }

        // Left and right scoring
        if (ball.x <= 0) {
            team2Score++;
            if (mode !== 'tournament')
                logGoalCoordinates(ball.x, ball.y); // Log goal coordinates
            updateScore();
            resetBall();
        }
        if (ball.x >= canvas.width) {
            team1Score++;
            if (mode !== 'tournament')
                logGoalCoordinates(ball.x, ball.y); // Log goal coordinates
            updateScore();
            resetBall();
        }
    });

    // Update paddle positions
    player1.y = player1Y;
    player2.y = player2Y;
    if (mode === '2v2') {
        player3.y = player3Y;
        player4.y = player4Y;
    }
}

function detectCollision() {
    balls.forEach(ball => {
        // Check collision with player 1 paddle
        if (ball.x - ball.radius < player1.x + player1.width &&
            ball.x + ball.radius > player1.x &&
            ball.y - ball.radius < player1.y + player1.height &&
            ball.y + ball.radius > player1.y) {
            ball.vx *= -1; // Reverse ball direction
            ball.x = player1.x + player1.width + ball.radius; // Adjust ball position
        }

        // Check collision with player 2 paddle
        if (ball.x - ball.radius < player2.x + player2.width &&
            ball.x + ball.radius > player2.x &&
            ball.y - ball.radius < player2.y + player2.height &&
            ball.y + ball.radius > player2.y) {
            ball.vx *= -1; // Reverse ball direction
            ball.x = player2.x - ball.radius; // Adjust ball position
        }

        // Check collision with player 3 and player 4 paddles if in 2v2 mode
        if (mode === '2v2') {
            // Check collision with player 3 paddle
            if (ball.x - ball.radius < player3.x + player3.width &&
                ball.x + ball.radius > player3.x &&
                ball.y - ball.radius < player3.y + player3.height &&
                ball.y + ball.radius > player3.y) {
                ball.vx *= -1; // Reverse ball direction
                ball.x = player3.x + player3.width + ball.radius; // Adjust ball position
            }

            // Check collision with player 4 paddle
            if (ball.x - ball.radius < player4.x + player4.width &&
                ball.x + ball.radius > player4.x &&
                ball.y - ball.radius < player4.y + player4.height &&
                ball.y + ball.radius > player4.y) {
                ball.vx *= -1; // Reverse ball direction
                ball.x = player4.x - ball.radius; // Adjust ball position
            }
        }

        // Check collision with obstacles if enabled
        if (gameSettings.enableObstacles) {
            const obstacleWidth = 20;
            const obstacleHeight = 60;
            const obstacleX = canvas.width / 2 - obstacleWidth / 2;
            const topObstacleY = canvas.height / 4 - obstacleHeight / 2;
            const bottomObstacleY = (3 * canvas.height) / 4 - obstacleHeight / 2;

            // Top obstacle collision
            if (ball.x + ball.radius > obstacleX && ball.x - ball.radius < obstacleX + obstacleWidth &&
                ball.y + ball.radius > topObstacleY && ball.y - ball.radius < topObstacleY + obstacleHeight) {
                ball.vx *= -1; // Reverse ball direction
            }

            // Bottom obstacle collision
            if (ball.x + ball.radius > obstacleX && ball.x - ball.radius < obstacleX + obstacleWidth &&
                ball.y + ball.radius > bottomObstacleY && ball.y - ball.radius < bottomObstacleY + obstacleHeight) {
                ball.vx *= -1; // Reverse ball direction
            }
        }
    });
}

function updateScore() {
    if (mode === '2v2') {
        scoreDisplay.textContent = `${player1Nickname} & ${player3Nickname}: ${team1Score} | ${player2Nickname} & ${player4Nickname}: ${team2Score}`;
    } else {
        scoreDisplay.textContent = `${player1Nickname}: ${team1Score} | ${player2Nickname}: ${team2Score}`;
    }
}

function draw() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each ball
    balls.forEach(ball => {
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fillStyle = "#0095DD";
        context.fill();
        context.closePath();
    });

    // Draw paddles
    context.fillStyle = "#0095DD";
    if (mode === '2v2') {
        context.fillRect(player1.x, player1.y, player1.width, player1.height); // Top left
        context.fillRect(player2.x, player2.y, player2.width, player2.height); // Top right
        context.fillRect(player3.x, player3.y, player3.width, player3.height); // Bottom left
        context.fillRect(player4.x, player4.y, player4.width, player4.height); // Bottom right
    } else {
        context.fillRect(player1.x, player1.y, player1.width, player1.height);
        context.fillRect(player2.x, player2.y, player2.width, player2.height);
    }

    // Draw net
    context.fillStyle = "#0095DD";
    context.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);

    // Draw obstacles if enabled
    if (gameSettings.enableObstacles) {
        const obstacleWidth = 20;
        const obstacleHeight = 60;
        const obstacleX = canvas.width / 2 - obstacleWidth / 2;
        const topObstacleY = canvas.height / 4 - obstacleHeight / 2;
        const bottomObstacleY = (3 * canvas.height) / 4 - obstacleHeight / 2;

        context.fillStyle = "#FF0000"; // Red color for obstacles
        context.fillRect(obstacleX, topObstacleY, obstacleWidth, obstacleHeight);
        context.fillRect(obstacleX, bottomObstacleY, obstacleWidth, obstacleHeight);
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === ' ' && !gameStarted && !gameEnded) {
        startGame();
    }
    if (gameStarted) {
        if (event.key === 'w' && player1Y > 0) {
            player1Y -= gameSettings.paddleSpeed; // Move player 1 up
        }
        if (event.key === 's' && player1Y < canvas.height - 60) { // Use the actual paddle height
            player1Y += gameSettings.paddleSpeed; // Move player 1 down
        }
        if (event.key === 'ArrowUp' && player2Y > 0) {
            player2Y -= gameSettings.paddleSpeed; // Move player 2 up
        }
        if (event.key === 'ArrowDown' && player2Y < canvas.height - 60) { // Use the actual paddle height
            player2Y += gameSettings.paddleSpeed; // Move player 2 down
        }

        if (mode === '2v2') {
            if (event.key === 'i' && player3Y > 0) {
                player3Y -= gameSettings.paddleSpeed; // Move player 3 up
            }
            if (event.key === 'k' && player3Y < canvas.height - 60) { // Use the actual paddle height
                player3Y += gameSettings.paddleSpeed; // Move player 3 down
            }
            if (event.key === '8' && player4Y > 0) {
                player4Y -= gameSettings.paddleSpeed; // Move player 4 up
            }
            if (event.key === '2' && player4Y < canvas.height - 60) { // Use the actual paddle height
                player4Y += gameSettings.paddleSpeed; // Move player 4 down
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const context = canvas.getContext('2d');
        const height = canvas.height; // Ensure canvas is defined
        const width = canvas.width; // Ensure canvas is defined

        // Example of drawing something on the canvas
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);

        // Other game-related code...
    } else {
        console.error('Canvas element not found');
    }
});

// Function to end the game and store match data
function endGame() {
    gameStarted = false;
    gameEnded = true;
    matchData.endTime = new Date().toISOString();
    matchData.player1.score = team1Score;
    matchData.player2.score = team2Score;

    // Generate a unique ID for the match
    matchData.id = `match_${Date.now()}`;

    // Determine the outcome
    const player1_won = team1Score >= maxScore;
    const outcome = player1_won ? 'won' : 'lost';
    const winner = player1_won ? player1Nickname : player2Nickname;

    // Retrieve match information
    const matchTime = new Date().toISOString(); // Format the date correctly
    const matchScore = `${team1Score} - ${team2Score}`;

    // Retrieve usernames from nicknames
    const player1Username = nicknameToUsernameMap[player1Nickname];

    // Add additional match details
    matchData.player1.username = player1Username;
    if (mode === '2v2') {
        matchData.player1.nickname = `${player1Nickname} / ${player3Nickname}`;
        matchData.player2.nickname = `${player2Nickname} / ${player4Nickname}`;
    } else {
        matchData.player1.nickname = player1Nickname;
        matchData.player2.nickname = player2Nickname;
    }
    matchData.winner = winner;
    matchData.date = matchTime;
    matchData.details = matchScore;

    if (window.isOnline){
        updateStatusCounter(player1Username, outcome);
        recordGameHistory(matchData);
    }
}