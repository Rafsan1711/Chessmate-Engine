let explorerBoard = null;
let explorerStatsTable = null;

// --- Explorer Init ---
window.initializeExplorer = function() {
    const onStatusUpdate = (statusText, pgn) => {
        $('#status').text(statusText);
        $('#moveHistory').text(pgn || 'Start position');
    };
    
    const onMoveSelect = (moveSAN) => {
        explorerBoard.makeMove(moveSAN);
    };

    explorerBoard = new BoardComponent('myBoard', fetchStatsForCurrentPosition, onStatusUpdate);
    explorerStatsTable = new StatsTableComponent('statsBody', onMoveSelect);

    $('#resetBtn').on('click', () => { explorerBoard.reset(); fetchStatsForCurrentPosition(); });
    $('#undoBtn').on('click', () => { if(explorerBoard.undoMove()) fetchStatsForCurrentPosition(); });
    $('#flipBtn').on('click', () => { explorerBoard.flip(); });
    
    fetchStatsForCurrentPosition();
};

async function fetchStatsForCurrentPosition() {
    if (routerService.currentRoute !== 'explorer') return; 
    const fen = explorerBoard.getFEN();
    explorerStatsTable.setLoading();
    const stats = await window.apiService.getOpeningStats(fen);
    explorerStatsTable.render(stats);
}

// --- Engine Init (Updated) ---
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
        
        // 1. UI আপডেট হতে সময় দেওয়া
        engineStatusElement.text("AI Thinking...");
        
        // 2. ছোট ডিলে দিয়ে AI কল করা যাতে পিস স্টাক না হয়
        setTimeout(async () => {
            const { move: aiMove, score } = await window.modelService.getBestMove(gameInstance);
            
            if (aiMove) {
                engineBoard.makeMove(aiMove);
                // স্কোর ফরম্যাটিং
                let scoreText = (typeof score === 'number') ? score.toFixed(2) : score;
                engineStatusElement.text(`AI Move: ${aiMove.san} (${scoreText})`);
                
                if (gameInstance.game_over()) engineStatusElement.text("Game Over!");
            } else {
                 engineStatusElement.text("Checkmate / Draw.");
            }
        }, 100); // 100ms delay for UI refresh
        
    }, onStatusUpdate);

    // Load Model
    const modelLoaded = await window.modelService.loadModel((msg) => engineStatusElement.text(msg));
    
    $('#newGameBtn').on('click', () => {
        engineBoard.reset();
        engineStatusElement.text(modelLoaded ? "Engine Ready." : "Engine Error.");
    });
    
    $('#flipBtn').on('click', () => { engineBoard.flip(); });
    
    if (modelLoaded) engineStatusElement.text("Engine Ready. White to Move.");
};

document.addEventListener('DOMContentLoaded', () => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        routerService.loadRoute(hash);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
});
