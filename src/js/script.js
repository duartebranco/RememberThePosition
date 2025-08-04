document.getElementById("playBtn").addEventListener("click", gamePreferences);
var board = Chessboard("board");

function gamePreferences() {
    // Show Preferences Screen
    document.getElementById("preferencesScreen").style.display = "flex";

    // blur
    document.getElementById("title").classList.add("blurred");
    document.getElementById("board").classList.add("blurred");
    document.getElementById("buttons-section").classList.add("blurred");
    document.getElementById("textbox").classList.add("blurred");

    // start button functionality
    document.getElementById("startBtn").addEventListener("click", function () {
        closePreferences();
        startGame();
    });

    // Back button functionality
    document
        .getElementById("backBtn")
        .addEventListener("click", closePreferences);
}

function startGame() {
    // user preferences
    var difficulty = document.getElementById("difficultySelect").value;
    var timeLimit = parseInt(document.getElementById("timeLimitSelect").value);

    var positionsArray;
    switch (difficulty) {
        case "easy":
            positionsArray = easy;
            break;
        case "normal":
            positionsArray = normal;
            break;
        case "hard":
            positionsArray = hard;
            break;
    }

    // Select random position
    var randomIndex = Math.floor(Math.random() * positionsArray.length);
    var selectedFEN = positionsArray[randomIndex];

    // Update board
    board.position(selectedFEN);

    // Hide the Play button and show timer
    document.getElementById("playBtn").style.display = "none";
    document.getElementById("timer").style.display = "block";

    var timerElement = document.getElementById("timer");
    var timerText = document.getElementById("timer-text");

    // Start countdown
    var seconds = 1;
    timerText.textContent = "Time: " + seconds + " seconds";

    var countdown = setInterval(function () {
        seconds--;
        timerText.textContent = "Time: " + seconds + " seconds";

        // Add visual warnings as time runs low
        if (seconds <= 5) {
            timerElement.className = "critical";
        } else if (seconds <= 10) {
            timerElement.className = "warning";
        }

        if (seconds <= 0) {
            clearInterval(countdown);
            timerText.textContent = "Time's up!";
            timerElement.className = "critical";

            // gessfunc
            guess();
        }
    }, 1000);
}

function guess() {
    // Hide timer and show guessBtn
    document.getElementById("timer").style.display = "none";
    document.getElementById("guessBtn").style.display = "";

    board = Chessboard("board", {
        draggable: true,
        dropOffBoard: "trash",
        sparePieces: true,
    });
}

function closePreferences() {
    // Hide Preferences Screen
    document.getElementById("preferencesScreen").style.display = "none";

    // Remove blur
    document.getElementById("title").classList.remove("blurred");
    document.getElementById("board").classList.remove("blurred");
    document.getElementById("buttons-section").classList.remove("blurred");
    document.getElementById("textbox").classList.remove("blurred");
}
