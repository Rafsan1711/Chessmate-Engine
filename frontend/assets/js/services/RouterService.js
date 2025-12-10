// File: frontend/assets/js/services/RouterService.js

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
            
            // JS Init Call
            if (routeKey === 'explorer' && window.initializeExplorer) setTimeout(window.initializeExplorer, 50);
            if (routeKey === 'play' && window.initializeEngine) setTimeout(window.initializeEngine, 50);
        }
        this.updateNavLinks(routeKey);
    }
    
    updateNavLinks(key) {
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[data-route="${key}"]`);
        if(activeLink) activeLink.classList.add('active');
    }

    getHomePageHTML() {
        return `
            <div class="container hero-section">
                <h2>ChessMate Openings</h2>
                <p>Analyze openings from 100,000+ master games.</p>
                <a href="#explorer" class="btn">Start Explorer</a>
            </div>`;
    }

    getExplorerPageHTML() {
        return `
            <div class="container">
                <div class="explorer-layout">
                    <!-- Board -->
                    <div class="board-area">
                        <div id="myBoard" style="width: 100%; max-width: 450px; margin:0 auto;"></div>
                        <div class="board-controls">
                            <button id="resetBtn" class="btn">Reset</button>
                            <button id="undoBtn" class="btn">Undo</button>
                            <button id="flipBtn" class="btn">Flip</button>
                        </div>
                        <div id="status" style="margin-top:10px; color:#f1c40f; font-weight:bold;"></div>
                    </div>

                    <!-- Stats -->
                    <div class="stats-area">
                        <h3>Opening Explorer</h3>
                        <div id="moveHistory" style="font-family:monospace; color:#ccc; margin-bottom:10px; min-height:20px;"></div>
                        
                        <table id="statsTable">
                            <thead>
                                <tr>
                                    <th>Move</th>
                                    <th>Games</th>
                                    <th>Win %</th>
                                    <th>Draw %</th>
                                    <th>Loss %</th>
                                </tr>
                            </thead>
                            <tbody id="statsBody">
                                <!-- JS will populate this -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;
    }

    getPlayPageHTML() {
        return `
            <div class="container">
                <h2>Play vs Engine</h2>
                <div class="explorer-layout">
                    <div class="board-area">
                        <div id="myBoard" style="width: 100%; max-width: 450px; margin:0 auto;"></div>
                        <div class="board-controls">
                            <button id="newGameBtn" class="btn">New Game</button>
                            <button id="flipBtn" class="btn">Flip</button>
                        </div>
                        <div id="status" style="margin-top:10px; color:#f1c40f;"></div>
                    </div>
                    <div class="stats-area">
                        <div id="engineStatus">Loading AI...</div>
                    </div>
                </div>
            </div>`;
    }
}
window.routerService = new RouterService('app-container');
