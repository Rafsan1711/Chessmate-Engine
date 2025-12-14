let explorerBoard = null;
let explorerStatsTable = null;
let selectedModelKey = null; // 'nano' or 'core'

// --- Global UI Helpers ---
function showModelModal() {
    const modal = new bootstrap.Modal(document.getElementById('modelSelectModal'));
    modal.show();
}

window.selectModel = function(modelKey) {
    selectedModelKey = modelKey;
    
    // Close modal
    const modalEl = document.getElementById('modelSelectModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    
    // Initialize Engine with selected model
    initializeEngine();
};

// --- Explorer Page ---
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
    
    // Animation
    gsap.from(".board-area", { duration: 1, x: -50, opacity: 0, ease: "power3.out" });
    gsap.from(".stats-area", { duration: 1, x: 50, opacity: 0, ease: "power3.out", delay: 0.2 });
};

async function fetchStatsForCurrentPosition() {
    if (routerService.currentRoute !== 'explorer') return; 
    const fen = explorerBoard.getFEN();
    explorerStatsTable.setLoading();
    const stats = await window.apiService.getOpeningStats(fen);
    explorerStatsTable.render(stats, explorerBoard.getGame().turn());
}

// --- Play vs AI Page ---
window.initializeEngine = async function() {
    // Check if model selected
    if (!selectedModelKey) {
        showModelModal();
        return; // Wait for selection
    }

    const engineStatusElement = $('#engineStatus');
    const thinkingIndicator = $('.ai-thinking-border');
    
    const onStatusUpdate = (statusText, pgn) => {
        $('#status').text(statusText);
        $('#engineHistory').text(pgn || 'Start new game');
    };
    
    const engineBoard = new BoardComponent('myBoard', async (move) => {
        const gameInstance = engineBoard.getGame();
        
        if (gameInstance.game_over()) {
             engineStatusElement.html('<span class="text-danger">Game Over!</span>');
             return;
        }
        
        // AI Thinking UI
        engineStatusElement.html('<span class="text-info"><i class="fa-solid fa-brain fa-bounce me-2"></i>AI is thinking...</span>');
        thinkingIndicator.show(); // Show Glow
        
        setTimeout(async () => {
            // Pass the selected model key to getBestMove if needed, or handle in loadModel
            const { move: aiMove, score } = await window.modelService.getBestMove(gameInstance);
            
            thinkingIndicator.hide(); // Hide Glow
            
            if (aiMove) {
                engineBoard.makeMove(aiMove);
                let scoreText = (typeof score === 'number') ? score.toFixed(2) : score;
                engineStatusElement.html(`<span class="text-success"><i class="fa-solid fa-check me-2"></i>AI Move: <b>${aiMove.san}</b> (Eval: ${scoreText})</span>`);
                
                if (gameInstance.game_over()) engineStatusElement.html('<span class="text-danger">Game Over!</span>');
            } else {
                 engineStatusElement.text("Checkmate / Draw.");
            }
        }, 100);
        
    }, onStatusUpdate);

    // Initialize Service with Model Key
    const modelLoaded = await window.modelService.loadModel(selectedModelKey, (msg) => engineStatusElement.text(msg));
    
    $('#newGameBtn').on('click', () => {
        engineBoard.reset();
        engineStatusElement.text("Engine Ready.");
    });
    
    $('#flipBtn').on('click', () => { engineBoard.flip(); });
    
    // Animate Board Entry
    gsap.from(".board-container-wrapper", { duration: 0.8, scale: 0.9, opacity: 0, ease: "back.out(1.7)" });
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        routerService.loadRoute(hash);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
});
