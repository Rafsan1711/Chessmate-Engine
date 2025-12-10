// File Path: frontend/assets/js/app.js

let explorerBoard = null;
let explorerStatsTable = null;

/**
 * Explorer Page Initialization
 */
window.initializeExplorer = function() {
    // StatustUpdate Callback function
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
        explorerBoard.undoMove();
        fetchStatsForCurrentPosition();
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

    const fen = explorerBoard.getFEN();
    explorerStatsTable.setLoading();
    
    const stats = await window.apiService.getOpeningStats(fen);
    
    explorerStatsTable.render(stats);
}

// --- নতুন ML Engine Page Init (Placeholder) ---
window.initializeEngine = function() {
    $('#engineStatus').text("Engine Loading: Model is not yet integrated. Please wait for the next step!");
    
    const onStatusUpdate = (statusText, pgn) => {
        $('#status').text(statusText);
        $('#engineHistory').text(pgn || 'Start new game');
    };
    
    // 1. Engine Board
    const engineBoard = new BoardComponent('myBoard', (move) => {
        // Player moved, now the engine should move.
        $('#engineStatus').text("AI Thinking... (Model integration pending)");
        // Logic for AI move generation will go here
    }, onStatusUpdate);

    // 2. New Game Button
    $('#newGameBtn').on('click', () => {
        engineBoard.reset();
    });
    
    $('#flipBtn').on('click', () => {
        engineBoard.flip();
    });
    
    // Note: ModelService.js and ONNX.js will be added in the next step.
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
