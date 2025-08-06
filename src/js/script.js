/**
 * Chess Position Memory Game
 * A game where players memorize chess positions and recreate them
 */

// Game configuration constants
const GAME_CONFIG = {
    TIMER_WARNING_THRESHOLD: 10,
    TIMER_CRITICAL_THRESHOLD: 5,
    BOARD_GAME_MAX_WIDTH: "45%",
    BOARD_GAME_MARGIN: "20px auto",
    BOARD_SETUP_MARGIN: "0 auto",
};

// Game state management
class ChessMemoryGame {
    constructor() {
        this.board = null;
        this.selectedFEN = "";
        this.difficulty = "normal";
        this.timeLimit = 30;
        this.timerInterval = null;
        this.eventListeners = new Map();

        this.init();
    }

    /**
     * Initialize the game
     * @returns {boolean} Success status
     */
    init() {
        try {
            this.board = Chessboard("board");
            this.setupEventListeners();
            this.setupWindowResize();
            return true;
        } catch (error) {
            console.error("Failed to initialize game:", error);
            return false;
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        this.addEventListenerOnce("playBtn", "click", () =>
            this.showGamePreferences(),
        );
    }

    /**
     * Setup window resize handler
     */
    setupWindowResize() {
        $(window).resize(() => {
            if (this.board && typeof this.board.resize === "function") {
                this.board.resize();
            }
        });
    }

    /**
     * Add event listener only once to prevent duplicates
     * @param {string} elementId - Element ID
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    addEventListenerOnce(elementId, event, handler) {
        const key = `${elementId}-${event}`;

        // Remove existing listener if it exists
        if (this.eventListeners.has(key)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.removeEventListener(
                    event,
                    this.eventListeners.get(key),
                );
            }
        }

        // Add new listener
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.set(key, handler);
        }
    }

    /**
     * Show game preferences screen
     * @returns {boolean} Success status
     */
    showGamePreferences() {
        try {
            // Show preferences screen
            const preferencesScreen =
                document.getElementById("preferencesScreen");
            if (!preferencesScreen)
                throw new Error("Preferences screen not found");

            preferencesScreen.style.display = "flex";
            this.applyBlurEffect(true);

            // Setup preference screen buttons
            this.addEventListenerOnce("startBtn", "click", () => {
                this.closePreferences();
                this.startGame();
            });

            this.addEventListenerOnce("backBtn", "click", () =>
                this.closePreferences(),
            );

            return true;
        } catch (error) {
            console.error("Failed to show game preferences:", error);
            return false;
        }
    }

    /**
     * Apply or remove blur effect from main elements
     * @param {boolean} apply - Whether to apply blur
     */
    applyBlurEffect(apply) {
        const elements = ["title", "board", "buttons-section", "textbox"];
        const action = apply ? "add" : "remove";

        elements.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.classList[action]("blurred");
            }
        });
    }

    /**
     * Get user preferences from form
     * @returns {Object} User preferences
     */
    getUserPreferences() {
        const difficultySelect = document.getElementById("difficultySelect");
        const timeLimitSelect = document.getElementById("timeLimitSelect");

        return {
            difficulty: difficultySelect ? difficultySelect.value : "normal",
            timeLimit: timeLimitSelect
                ? parseInt(timeLimitSelect.value) || 30
                : 30,
        };
    }

    /**
     * Get positions array based on difficulty
     * @param {string} difficulty - Game difficulty
     * @returns {Array} Positions array
     */
    getPositionsArray(difficulty) {
        const positionsMap = {
            easy: typeof easy !== "undefined" ? easy : [],
            normal: typeof normal !== "undefined" ? normal : [],
            hard: typeof hard !== "undefined" ? hard : [],
        };

        return positionsMap[difficulty] || positionsMap["normal"];
    }

    /**
     * Start the game
     * @returns {boolean} Success status
     */
    startGame() {
        try {
            this.setupGameUI();

            // Get user preferences
            const preferences = this.getUserPreferences();
            this.difficulty = preferences.difficulty;
            this.timeLimit = preferences.timeLimit;

            // Select random position
            const positionsArray = this.getPositionsArray(this.difficulty);
            if (positionsArray.length === 0) {
                throw new Error(
                    `No positions available for difficulty: ${this.difficulty}`,
                );
            }

            const randomIndex = Math.floor(
                Math.random() * positionsArray.length,
            );
            this.selectedFEN = positionsArray[randomIndex];

            // Update board and start memorization phase
            this.board.position(this.selectedFEN);
            this.startMemorizationTimer();

            return true;
        } catch (error) {
            console.error("Failed to start game:", error);
            return false;
        }
    }

    /**
     * Setup game UI elements
     */
    setupGameUI() {
        // Hide title, show game header
        const title = document.getElementById("title");
        const gameHeader = document.getElementById("gameHeader");
        const board = document.getElementById("board");
        const playBtn = document.getElementById("playBtn");

        if (title) title.style.display = "none";
        if (gameHeader) gameHeader.style.display = "flex";
        if (playBtn) playBtn.style.display = "none";

        // Setup stop button to work throughout the entire game(s)
        this.addEventListenerOnce("stopBtn", "click", () => this.resetGame());

        // Resize board for game
        if (board) {
            board.style.maxWidth = GAME_CONFIG.BOARD_GAME_MAX_WIDTH;
            board.style.margin = GAME_CONFIG.BOARD_GAME_MARGIN;
        }

        if (this.board && typeof this.board.resize === "function") {
            this.board.resize();
        }
    }

    /**
     * Start the memorization timer
     */
    startMemorizationTimer() {
        const timerElement = document.getElementById("timer");
        const timerText = document.getElementById("timer-text");

        if (!timerElement || !timerText) {
            console.error("Timer elements not found");
            return;
        }

        // Show timer
        timerElement.style.display = "";

        let seconds = this.timeLimit;
        timerText.textContent = `Time: ${seconds} seconds`;

        this.timerInterval = setInterval(() => {
            seconds--;
            timerText.textContent = `Time: ${seconds} seconds`;

            // Apply visual warnings
            this.updateTimerVisuals(timerElement, seconds);

            if (seconds <= 0) {
                this.endMemorizationPhase(timerElement, timerText);
            }
        }, 1000);
    }

    /**
     * Update timer visual state based on remaining time
     * @param {HTMLElement} timerElement - Timer element
     * @param {number} seconds - Remaining seconds
     */
    updateTimerVisuals(timerElement, seconds) {
        timerElement.className = "";

        if (seconds <= GAME_CONFIG.TIMER_CRITICAL_THRESHOLD) {
            timerElement.className = "critical";
        } else if (seconds <= GAME_CONFIG.TIMER_WARNING_THRESHOLD) {
            timerElement.className = "warning";
        }
    }

    /**
     * End memorization phase and start position setup
     * @param {HTMLElement} timerElement - Timer element
     * @param {HTMLElement} timerText - Timer text element
     */
    endMemorizationPhase(timerElement, timerText) {
        clearInterval(this.timerInterval);
        timerText.textContent = "Time's up!";
        timerElement.className = "critical";

        // Store the position that was shown
        this.selectedFEN = this.board.fen();

        // Start position setup phase
        this.startPositionSetup();
    }

    /**
     * Start the position setup phase
     * @returns {boolean} Success status
     */
    startPositionSetup() {
        try {
            // Hide timer, show guess button
            const timer = document.getElementById("timer");
            const guessBtn = document.getElementById("guessBtn");
            const board = document.getElementById("board");

            if (timer) timer.style.display = "none";
            if (guessBtn) guessBtn.style.display = "";
            if (board) board.style.margin = GAME_CONFIG.BOARD_SETUP_MARGIN;

            // Properly destroy the existing board instance
            if (this.board && typeof this.board.destroy === "function") {
                this.board.destroy();
            }

            // Clear the board container
            const boardElement = document.getElementById("board");
            if (boardElement) {
                boardElement.innerHTML = "";
            }

            // Small delay to ensure DOM is ready before creating new board
            setTimeout(() => {
                // Create new draggable board
                this.board = Chessboard("board", {
                    draggable: true,
                    dropOffBoard: "trash",
                    sparePieces: true,
                });

                // Setup guess button after board is ready
                this.addEventListenerOnce("guessBtn", "click", () =>
                    this.evaluateGuess(),
                );
            }, 100);

            return true;
        } catch (error) {
            console.error("Failed to start position setup:", error);
            return false;
        }
    }

    /**
     * Evaluate the user's guess
     * @returns {Object} Evaluation results
     */
    evaluateGuess() {
        try {
            const userFEN = this.board.fen();
            this.board = Chessboard("board", userFEN);

            // Convert FENs to position objects for comparison
            const correctPosition = Chessboard.fenToObj(this.selectedFEN);
            const userPosition = Chessboard.fenToObj(userFEN);

            // Clear existing highlights
            this.clearHighlights();

            // Evaluate positions
            const evaluation = this.comparePositions(
                correctPosition,
                userPosition,
            );

            // Update UI with results
            this.displayResults(evaluation);
            this.setupPostGameButtons();

            return evaluation;
        } catch (error) {
            console.error("Failed to evaluate guess:", error);
            return { correctCount: 0, totalPieces: 0, accuracy: 0 };
        }
    }

    /**
     * Clear all square highlights
     */
    clearHighlights() {
        $(".square-55d63").removeClass(
            "correct-piece incorrect-piece missing-piece extra-piece",
        );
    }

    /**
     * Compare correct and user positions
     * @param {Object} correctPosition - Correct position object
     * @param {Object} userPosition - User's position object
     * @returns {Object} Comparison results
     */
    comparePositions(correctPosition, userPosition) {
        const squares = this.getAllSquares();
        let correctCount = 0;
        const totalPieces = Object.keys(correctPosition).length;

        squares.forEach((square) => {
            const correctPiece = correctPosition[square];
            const userPiece = userPosition[square];
            const squareElement = $(`[data-square="${square}"]`);

            if (correctPiece && userPiece) {
                if (correctPiece === userPiece) {
                    squareElement.addClass("correct-piece");
                    correctCount++;
                } else {
                    squareElement.addClass("incorrect-piece");
                }
            } else if (correctPiece && !userPiece) {
                squareElement.addClass("missing-piece");
            } else if (!correctPiece && userPiece) {
                squareElement.addClass("extra-piece");
            }
        });

        const accuracy = Math.round((correctCount / totalPieces) * 100);

        return { correctCount, totalPieces, accuracy };
    }

    /**
     * Get all chess board squares
     * @returns {Array} Array of square names
     */
    getAllSquares() {
        const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
        const squares = [];

        ranks.forEach((rank) => {
            files.forEach((file) => {
                squares.push(file + rank);
            });
        });

        return squares;
    }

    /**
     * Display game results
     * @param {Object} evaluation - Evaluation results
     */
    displayResults(evaluation) {
        const resultElement = document.getElementById("result");
        const guessBtn = document.getElementById("guessBtn");

        if (guessBtn) guessBtn.style.display = "none";
        if (resultElement) resultElement.style.display = "";

        const { correctCount, totalPieces, accuracy } = evaluation;

        if (correctCount === totalPieces && totalPieces > 0) {
            resultElement.innerHTML = "Perfect! All pieces correct!";
            resultElement.className = "result-perfect";
        } else {
            resultElement.className = this.getResultClass(accuracy);
            resultElement.innerHTML = `${correctCount}/${totalPieces} ♟ Pieces Correct`;
        }
    }

    /**
     * Get CSS class based on accuracy percentage
     * @param {number} accuracy - Accuracy percentage
     * @returns {string} CSS class name
     */
    getResultClass(accuracy) {
        if (accuracy >= 80) return "result-good";
        if (accuracy >= 60) return "result-okay";
        return "result-poor";
    }

    /**
     * Setup post-game buttons
     */
    setupPostGameButtons() {
        const stopBtn = document.getElementById("stopBtn");
        const nextBtn = document.getElementById("nextBtn");

        if (stopBtn) stopBtn.style.display = "";
        if (nextBtn) nextBtn.style.display = "";

        this.addEventListenerOnce("nextBtn", "click", () => {
            // Hide post-game UI elements
            document
                .getElementById("result")
                ?.style.setProperty("display", "none");
            document
                .getElementById("nextBtn")
                ?.style.setProperty("display", "none");

            // Clear board highlights and reset board
            this.clearHighlights();

            // Start new game
            this.startGame();
        });
    }

    /**
     * Reset the game to initial state
     */
    resetGame() {
        // Clear any running timers
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Reload the page to reset everything
        location.reload();
    }

    /**
     * Close ferences screen
     * @returns {boolean} Success status
     */
    closePreferences() {
        try {
            const preferencesScreen =
                document.getElementById("preferencesScreen");
            if (preferencesScreen) {
                preferencesScreen.style.display = "none";
            }

            this.applyBlurEffect(false);
            return true;
        } catch (error) {
            console.error("Failed to close preferences:", error);
            return false;
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Remove all event listeners
        this.eventListeners.forEach((handler, key) => {
            const [elementId, event] = key.split("-");
            const element = document.getElementById(elementId);
            if (element) {
                element.removeEventListener(event, handler);
            }
        });

        this.eventListeners.clear();
    }
}

// Main initialization function
function initializeGame() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            window.chessMemoryGame = new ChessMemoryGame();
        });
    } else {
        window.chessMemoryGame = new ChessMemoryGame();
    }
}

// Initialize the game
initializeGame();

// Export for potential module use
if (typeof module !== "undefined" && module.exports) {
    module.exports = { ChessMemoryGame, initializeGame };
}
