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
            selectedFEN = board.fen();

            // make position
            mkPos(selectedFEN);
        }
    }, 1000);
}

function mkPos(selectedFEN) {
    // Hide timer and show guessBtn
    document.getElementById("timer").style.display = "none";
    document.getElementById("guessBtn").style.display = "";

    board = Chessboard("board", {
        draggable: true,
        dropOffBoard: "trash",
        sparePieces: true,
    });
    document.getElementById("board").style.margin = "0 auto";

    document.getElementById("guessBtn").addEventListener("click", function () {
        guess(selectedFEN, board);
    });
}

function guess(selectedFEN, board) {
    var userFEN = board.fen();
    board = Chessboard("board").position(userFEN);

    // Convert FENs to position objects for comparison
    var correctPosition = Chessboard.fenToObj(selectedFEN);
    var userPosition = Chessboard.fenToObj(userFEN);

    // Remove any existing highlights
    $(".square-55d63").removeClass(
        "correct-piece incorrect-piece missing-piece extra-piece",
    );

    // Get all squares on the board
    var squares = [
        "a8",
        "b8",
        "c8",
        "d8",
        "e8",
        "f8",
        "g8",
        "h8",
        "a7",
        "b7",
        "c7",
        "d7",
        "e7",
        "f7",
        "g7",
        "h7",
        "a6",
        "b6",
        "c6",
        "d6",
        "e6",
        "f6",
        "g6",
        "h6",
        "a5",
        "b5",
        "c5",
        "d5",
        "e5",
        "f5",
        "g5",
        "h5",
        "a4",
        "b4",
        "c4",
        "d4",
        "e4",
        "f4",
        "g4",
        "h4",
        "a3",
        "b3",
        "c3",
        "d3",
        "e3",
        "f3",
        "g3",
        "h3",
        "a2",
        "b2",
        "c2",
        "d2",
        "e2",
        "f2",
        "g2",
        "h2",
        "a1",
        "b1",
        "c1",
        "d1",
        "e1",
        "f1",
        "g1",
        "h1",
    ];

    var correctCount = 0;
    var totalPieces = Object.keys(correctPosition).length;

    // Compare each square
    squares.forEach(function (square) {
        var correctPiece = correctPosition[square];
        var userPiece = userPosition[square];
        var squareElement = $('[data-square="' + square + '"]');

        if (correctPiece && userPiece) {
            // Both positions have pieces on this square
            if (correctPiece === userPiece) {
                // Correct piece
                squareElement.addClass("correct-piece");
                correctCount++;
            } else {
                // Wrong piece
                squareElement.addClass("incorrect-piece");
            }
        } else if (correctPiece && !userPiece) {
            // Missing piece (should be there but isn't)
            squareElement.addClass("missing-piece");
        } else if (!correctPiece && userPiece) {
            // Extra piece (shouldn't be there but is)
            squareElement.addClass("extra-piece");
        }
        // If neither has a piece, no highlighting needed
    });

    // Hide guess button and show results
    document.getElementById("guessBtn").style.display = "none";
    document.getElementById("result").style.display = "";

    var accuracy = Math.round((correctCount / totalPieces) * 100);

    if (userFEN === selectedFEN) {
        document.getElementById("result").innerHTML =
            "Perfect! All pieces correct!";
        document.getElementById("result").className = "result-perfect";
    } else {
        if (accuracy >= 80) {
            document.getElementById("result").className = "result-good";
        } else if (accuracy >= 60) {
            document.getElementById("result").className = "result-okay";
        } else {
            document.getElementById("result").className = "result-poor";
        }
        1;
        document.getElementById("result").innerHTML =
            correctCount + "/" + totalPieces + " ♟ Pieces Correct";
    }

    // Show back and next btns
    document.getElementById("stopBtn").style.display = "";
    document.getElementById("nextBtn").style.display = "";
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
