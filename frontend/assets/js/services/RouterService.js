class RouterService {
    constructor(appContainerId) {
        this.appContainer = document.getElementById(appContainerId);
        this.currentRoute = 'home';
        this.routes = {
            'home': this.getHomePageHTML(),
            'explorer': this.getExplorerPageHTML(),
        };
    }

    loadRoute(route) {
        const routeKey = route.replace('#', '') || 'home';
        
        if (this.routes[routeKey]) {
            this.appContainer.innerHTML = this.routes[routeKey];
            this.currentRoute = routeKey;
            
            // UI আপডেটের পর Explorer ইনিশিয়ালাইজ করবে
            if (routeKey === 'explorer' && typeof window.initializeExplorer === 'function') {
                // jQuery-কে ইনিশিয়ালাইজ করার সুযোগ দিতে setTimeout ব্যবহার করা হলো
                setTimeout(window.initializeExplorer, 50); 
            }
        } else {
            this.appContainer.innerHTML = `<div class="container page-content"><h2>404 Not Found</h2></div>`;
        }
        
        this.updateNavLinks(routeKey);
    }
    
    updateNavLinks(activeKey) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('data-route') === activeKey) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // --- HTML Templates ---
    
    getHomePageHTML() {
        return `
            <div class="container page-content hero-section">
                <h2>Master Chess Openings</h2>
                <p>
                    Explore ${window.globalData ? Object.keys(window.globalData).length.toLocaleString() : '140,000+'} unique positions 
                    from over 100,000 high-rated Lichess games.
                    Analyze win rates, draws, and black's winning chances for any position.
                </p>
                <a href="#explorer" class="btn">Start Exploring Now</a>
            </div>
        `;
    }

    getExplorerPageHTML() {
        return `
            <div class="container page-content">
                <h2>Opening Explorer</h2>
                <div class="explorer-layout">
                    
                    <!-- Chess Board Area -->
                    <div class="board-area">
                        <div id="myBoard" style="width: 400px; margin: 0 auto;"></div>
                        <div class="board-controls">
                            <button id="resetBtn">Reset</button>
                            <button id="undoBtn">Undo</button>
                            <button id="flipBtn">Flip</button>
                        </div>
                        <div id="status" class="status-box" style="margin-top: 15px;">White to move</div>
                    </div>

                    <!-- Stats Area -->
                    <div class="stats-area">
                        <h3>Position Analysis</h3>
                        <div id="loading" style="display: none;">
                            <span class="spinner"></span> 
                            <span>Loading stats...</span>
                        </div>
                        <div id="moveHistory">Start position</div>
                        
                        <table id="statsTable">
                            <thead>
                                <tr>
                                    <th>Move</th>
                                    <th>Games</th>
                                    <th>Win/Draw/Loss %</th>
                                </tr>
                            </thead>
                            <tbody id="statsBody">
                                <tr><td colspan="3">Loading...</td></tr>
                            </tbody>
                        </table>
                        <div style="font-size: 0.8em; margin-top: 10px; color: #95a5a6;">
                            Click on a move row to play it on the board.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.routerService = new RouterService('app-container');
