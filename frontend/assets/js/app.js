// File Path: frontend/assets/js/app.js

let explorerBoard = null;
let explorerStatsTable = null;

/**
 * Explorer Page Initialization
 */
window.initializeExplorer = function() {
    const onStatusUpdate = (statusText, pgn) => {
        $('#status').text(statusText);
        $('#moveHistory').text(pgn || 'Start position');
    };
    
    const onMoveSelect = (moveSAN) => {
        explorerBoard.makeMove(moveSAN);
    };

    // 1. Initialize Board
    explorerBoard = new BoardComponent('myBoard', fetchStatsForCurrentPosition, onStatusUpdate);
    explorerStatsTable = new StatsTableComponent('statsBody', onMoveSelect);

    // 3. Setup Event Listeners
    $('#resetBtn').on('click', () => {
        explorerBoard.reset();
        fetchStatsForCurrentPosition();
    });
    
    $('#undoBtn').on('click', () => {
        if (explorerBoard.undoMove()) {
            fetchStatsForCurrentPosition();
        }
    });
    
    $('#flipBtn').on('click', () => {
        explorerBoard.flip();
    });
    
    fetchStatsForCurrentPosition();
};

/**
 * Explorer Data Fetch
 */
async function fetchStatsForCurrentPosition() {
    if (routerService.currentRoute !== 'explorer') return; 

    // FEN Fix: BoardComponent now returns only the 4-part FEN
    const fen = explorerBoard.getFEN();
    explorerStatsTable.setLoading();
    
    const stats = await window.apiService.getOpeningStats(fen);
    
    explorerStatsTable.render(stats, explorerBoard.getGame().turn());
}

// --- ML Engine Page Init (Final Logic) ---
window.initializeEngine = async function() {
    const engineStatusElement = $('#engineStatus');
    
    const onStatusUpdate = (statusText, pgn) => {
        $('#status').text(statusText);
        $('#engineHistory').text(pgn || 'Start new game');
    };
    
    const engineBoard = new BoardComponent('myBoard', async (move) => {
        const gameInstance = engineBoard.getGame();
        
        if (gameInstance.game_over()) {
             engineStatusElement.text("Game Over!");
             return;
        }
        
        engineStatusElement.text("AI Thinking... (Depth 3)");
        
        // Call ML Model
        const { move: aiMove, score } = await window.modelService.getBestMove(gameInstance);
        
        if (aiMove) {
            setTimeout(() => {
                engineBoard.makeMove(aiMove);
                engineStatusElement.text(`AI Move: ${aiMove.san} (Eval: ${score.toFixed(2)})`);
                
                if (gameInstance.game_over()) {
                    engineStatusElement.text("Game Over!");
                }
            }, 500);
        } else {
             engineStatusElement.text("Game Over or AI Error. Click New Game.");
        }
        
    }, onStatusUpdate);

    // Load Model on Page Init
    const modelLoaded = await window.modelService.loadModel((msg) => engineStatusElement.text(msg));
    
    // New Game Button
    $('#newGameBtn').on('click', () => {
        engineBoard.reset();
        engineStatusElement.text(modelLoaded ? "Engine Ready. White to Move." : "Engine Error. Basic play available.");
        
        // Start AI if it's black's turn (optional)
        // if (engineBoard.getGame().turn() === 'b') { ... }
    });
    
    $('#flipBtn').on('click', () => {
        engineBoard.flip();
    });
    
    if (modelLoaded) engineStatusElement.text("Engine Ready. White to Move.");
};

/**
 * Main Application Init
 */
document.addEventListener('DOMContentLoaded', () => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        routerService.loadRoute(hash);
    };

    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
});
