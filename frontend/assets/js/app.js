let explorerBoard = null;
let explorerStatsTable = null;

/**
 * Explorer Page-এর জন্য Board/Stats কম্পোনেন্ট ইনিশিয়ালাইজ করে
 */
window.initializeExplorer = function() {
    // StatustUpdate Callback function
    const onStatusUpdate = (statusText, pgn) => {
        $('#status').text(statusText);
        $('#moveHistory').text(pgn || 'Start position');
    };
    
    // Move Select Callback function (when user clicks a move on the table)
    const onMoveSelect = (moveSAN) => {
        explorerBoard.makeMove(moveSAN);
    };

    // 1. Initialize Board
    explorerBoard = new BoardComponent('myBoard', fetchStatsForCurrentPosition, onStatusUpdate);
    
    // 2. Initialize Stats Table
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
    
    // 4. Initial data load
    fetchStatsForCurrentPosition();
};

/**
 * বর্তমান FEN এর জন্য API কল করে ডেটা লোড করে
 */
async function fetchStatsForCurrentPosition() {
    if (routerService.currentRoute !== 'explorer') return; 

    const fen = explorerBoard.getFEN();
    explorerStatsTable.setLoading();
    
    const stats = await window.apiService.getOpeningStats(fen);
    
    explorerStatsTable.render(stats);
}

/**
 * Main Application Init
 */
document.addEventListener('DOMContentLoaded', () => {
    // HashChange Event Listener (Routing)
    const handleHashChange = () => {
        const hash = window.location.hash;
        routerService.loadRoute(hash);
    };

    // প্রথম লোডের সময়
    handleHashChange();
    
    // Hash change হলে
    window.addEventListener('hashchange', handleHashChange);
});
