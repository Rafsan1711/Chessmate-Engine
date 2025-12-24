let explorerBoard = null;
let explorerStatsTable = null;
let selectedModelKey = null;

// --- Global UI Helpers ---
function showModelModal() {
    const modalElement = document.getElementById('modelSelectModal');
    if(modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

window.selectModel = function(modelKey) {
    selectedModelKey = modelKey;
    
    const modalEl = document.getElementById('modelSelectModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if(modal) modal.hide();
    
    initializeEngine();
};

// --- Explorer Page ---
window.initializeExplorer = function() {
    // GSAP Safety Check: উপাদানগুলো না থাকলে এনিমেশন চালাবে না
    if (!document.querySelector("#myBoard") || !document.querySelector("#statsBody")) return;

    const onStatusUpdate = (statusText, pgn) => {
        const statusEl = $('#status');
        const moveHistEl = $('#moveHistory');
        if(statusEl.length) statusEl.text(statusText);
        if(moveHistEl.length) moveHistEl.text(pgn || 'Start position');
    };
    
    const onMoveSelect = (moveSAN) => {
        if(explorerBoard) explorerBoard.makeMove(moveSAN);
    };

    explorerBoard = new BoardComponent('myBoard', fetchStatsForCurrentPosition, onStatusUpdate);
    explorerStatsTable = new StatsTableComponent('statsBody', onMoveSelect);

    $('#resetBtn').on('click', () => { if(explorerBoard) { explorerBoard.reset(); fetchStatsForCurrentPosition(); }});
    $('#undoBtn').on('click', () => { if(explorerBoard && explorerBoard.undoMove()) fetchStatsForCurrentPosition(); });
    $('#flipBtn').on('click', () => { if(explorerBoard) explorerBoard.flip(); });
    
    fetchStatsForCurrentPosition();
    
    // Animation (Safe)
    if (document.querySelector(".board-area")) {
        gsap.from(".board-area", { duration: 1, x: -50, opacity: 0, ease: "power3.out" });
    }
    if (document.querySelector(".stats-area")) {
        gsap.from(".stats-area", { duration: 1, x: 50, opacity: 0, ease: "power3.out", delay: 0.2 });
    }
};

async function fetchStatsForCurrentPosition() {
    if (routerService.currentRoute !== 'explorer' || !explorerBoard) return; 
    const fen = explorerBoard.getFEN();
    if(explorerStatsTable) explorerStatsTable.setLoading();
    const stats = await window.apiService.getOpeningStats(fen);
    if(explorerStatsTable) explorerStatsTable.render(stats);
}

// --- Play vs AI Page ---
window.initializeEngine = async function() {
    // Model Selection Modal Trigger
    if (!selectedModelKey) {
        // একটু দেরি করে মডাল দেখানো যাতে DOM রেডি হয়
        setTimeout(showModelModal, 500);
        return;
    }

    if (!document.querySelector("#myBoard")) return;

    const engineStatusElement = $('#engineStatus');
    const thinkingIndicator = $('.ai-thinking-border');
    
    const onStatusUpdate = (statusText, pgn) => {
        if(engineStatusElement.length) engineStatusElement.text(statusText);
        const hist = $('#engineHistory');
        if(hist.length) hist.text(pgn || 'Start new game');
    };
    
    const engineBoard = new BoardComponent('myBoard', async (move) => {
        const gameInstance = engineBoard.getGame();
        
        if (gameInstance.game_over()) {
             engineStatusElement.html('<span class="text-danger">Game Over!</span>');
             return;
        }
        
        // AI Thinking UI
        engineStatusElement.html('<span class="text-info"><i class="fa-solid fa-brain fa-bounce me-2"></i>AI is thinking...</span>');
        if(thinkingIndicator.length) thinkingIndicator.show(); 
        
        // ছোট ডিলে দিয়ে AI কল করা
        setTimeout(async () => {
            const result = await window.modelService.getBestMove(gameInstance);
            
            if(thinkingIndicator.length) thinkingIndicator.hide(); 
            
            if (result && result.move) {
                engineBoard.makeMove(result.move);
                let scoreText = (typeof result.score === 'number') ? result.score.toFixed(2) : result.score;
                engineStatusElement.html(`<span class="text-success"><i class="fa-solid fa-check me-2"></i>AI Move: <b>${result.move.san}</b> (Eval: ${scoreText})</span>`);
                
                if (gameInstance.game_over()) engineStatusElement.html('<span class="text-danger">Game Over!</span>');
            } else {
                 engineStatusElement.text("Checkmate / Draw.");
            }
        }, 100);
        
    }, onStatusUpdate);

    // Initialize Service with Model Key
    const modelLoaded = await window.modelService.loadModel(selectedModelKey, (msg) => {
        if(engineStatusElement.length) engineStatusElement.text(msg);
    });
    
    $('#newGameBtn').on('click', () => {
        if(engineBoard) engineBoard.reset();
        if(engineStatusElement.length) engineStatusElement.text("Engine Ready.");
    });
    
    $('#flipBtn').on('click', () => { if(engineBoard) engineBoard.flip(); });
    
    // Animate Board Entry
    if (document.querySelector(".board-container-wrapper")) {
        gsap.from(".board-container-wrapper", { duration: 0.8, scale: 0.9, opacity: 0, ease: "back.out(1.7)" });
    }
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
