// File Path: frontend/assets/js/services/RouterService.js

class RouterService {
    constructor(appContainerId) {
        this.appContainer = document.getElementById(appContainerId);
        this.currentRoute = 'home';
        this.routes = {
            'home': this.getHomePageHTML(),
            'explorer': this.getExplorerPageHTML(),
            'play': this.getPlayPageHTML(), 
        };
    }

    loadRoute(route) {
        const routeKey = route.replace('#', '') || 'home';
        
        if (this.routes[routeKey]) {
            this.appContainer.innerHTML = this.routes[routeKey];
            this.currentRoute = routeKey;
            
            // ইনিশিয়ালাইজেশন
            if (routeKey === 'explorer' && typeof window.initializeExplorer === 'function') {
                setTimeout(window.initializeExplorer, 50); 
            } else if (routeKey === 'play' && typeof window.initializeEngine === 'function') {
                setTimeout(window.initializeEngine, 50);
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
                    Explore our vast opening database or challenge our ML-Powered Engine.
                </p>
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <a href="#explorer" class="btn" style="background-color: var(--color-primary);">Explore Database</a>
                    <a href="#play" class="btn" style="background-color: var(--color-error);">Play vs Engine</a>
                </div>
            </div>
        `;
    }

    getExplorerPageHTML() {
        // Explorer Page: Openings Stats (PGN Table)
        return `
            <div class="container page-content">
                <h2>Opening Explorer</h2>
                <p>Click on a move row to play it and see the next position's statistics.</p>
                <div class="explorer-layout">
                    
                    <!-- Chess Board Area -->
                    <div class="board-area">
                        <div id="myBoard" style="width: 400px; margin: 0 auto;"></div>
                        <div class="board-controls">
                            <button id="resetBtn">Reset</button>
                            <button id="undoBtn">Undo</button>
                            <button id="flipBtn">Flip</button>
                        </div>
                        <div id="status" class="status-box" style="margin-top: 15px;"></div>
                    </div>

                    <!-- Stats Area -->
                    <div class="stats-area">
                        <h3>Move-by-Move Analysis</h3>
                        <div id="loading" style="display: none;">
                            <span class="spinner"></span> 
                            <span>Loading stats...</span>
                        </div>
                        <div id="moveHistory">Start position</div>
                        
                        <table id="statsTable">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Move</th>
                                    <th>Total Games</th>
                                    <th class="win-rate-bar-col">Win/Draw/Loss</th>
                                </tr>
                            </thead>
                            <tbody id="statsBody">
                                <tr><td colspan="4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getPlayPageHTML() {
        // Play Page: Player vs Engine
        return `
            <div class="container page-content">
                <h2>Play vs ChessMate AI Engine</h2>
                <p>Play against a neural network trained on Lichess data.</p>
                
                <div class="explorer-layout">
                    <div class="board-area">
                        <div id="myBoard" style="width: 400px; margin: 0 auto;"></div>
                        <div class="board-controls">
                            <button id="newGameBtn">New Game</button>
                            <button id="flipBtn">Flip</button>
                        </div>
                        <div id="status" class="status-box" style="margin-top: 15px;"></div>
                    </div>
                    
                    <div class="stats-area">
                        <h3>Game Status</h3>
                        <div id="engineStatus" style="color: var(--color-info);">
                            Engine Status: Ready to Load Model
                        </div>
                        <div id="engineHistory" style="margin-top: 15px; font-family: monospace;">
                            Game PGN will appear here.
                        </div>
                        <p style="margin-top: 20px;">
                            <a href="#explorer" class="btn" style="background-color: var(--color-success); padding: 10px 20px;">Explore Position</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}

window.routerService = new RouterService('app-container');
