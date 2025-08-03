document.getElementById("playBtn").addEventListener("click", gamePreferences);

var board = Chessboard("board");
// var board2 = Chessboard("board2", {
//     draggable: true,
//     dropOffBoard: "trash",
//     sparePieces: true,
// });
var firstBoardFEN = "";
var userFEN = "";
var rememberedFEN = "";

function gamePreferences() {
    // Show Preferences Screen
    document.getElementById("preferencesScreen").style.display = "flex";

    // blur
    document.getElementById("title").classList.add("blurred");
    document.getElementById("board").classList.add("blurred");
    document.getElementById("buttons-section").classList.add("blurred");
    document.getElementById("textbox").classList.add("blurred");

    document
        .getElementById("applySettings")
        .addEventListener("click", function () {
            closePreferences();
            startGame();
        });

    // Back button functionality
    document
        .getElementById("backButton")
        .addEventListener("click", closePreferences);
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

// function clearBoard() {
//     board2.clear();
//     document.getElementById("tryButton").style.display = "none";
//     document.getElementById("guessButton").style.display = "block";
//     document.getElementById("result").style.display = "none";
//     document.getElementById("timer").style.display = "none";
//     document.getElementById("startButton").style.display = "none";
//     document.getElementById("myBoard").style.display = "none";
//     document.getElementById("board2").style.display = "block";
//     document.getElementById("guessButton").addEventListener("click", guessFEN);
// }
//
// function guessFEN() {
//     var userFEN = board2.fen();
//     document.getElementById("guessButton").style.display = "none";
//     document.getElementById("result").style.display = "block";
//     var resultElement = document.getElementById("result");
//     if (firstBoardFEN === userFEN) {
//         resultElement.textContent = "Correct!";
//     } else {
//         resultElement.textContent = "Incorrect!";
//     }
//     document.getElementById("board2").style.display = "none";
//     document.getElementById("myBoard").style.display = "block";
//     document.getElementById("tryButton").style.display = "block";
//     document.getElementById("tryButton").addEventListener("click", startGame);
// }
//
// function startGame() {
//     var randomFenIndex = Math.floor(Math.random() * fenPositions.length);
//     rememberedFEN = fenPositions[randomFenIndex];
//     board.position(rememberedFEN);
//
//     document.getElementById("startButton").style.display = "none";
//     document.getElementById("timer").style.display = "block";
//     document.getElementById("tryButton").style.display = "none";
//     document.getElementById("result").style.display = "none";
//
//     var seconds = 10;
//     var timerElement = document.getElementById("timer");
//     var countdown = setInterval(function () {
//         timerElement.textContent = "Timer: " + seconds + " seconds";
//         seconds--;
//
//         if (seconds < 0) {
//             firstBoardFEN = board.fen();
//             clearInterval(countdown);
//             board2.start();
//             clearBoard();
//         }
//     }, 1000);
// }
