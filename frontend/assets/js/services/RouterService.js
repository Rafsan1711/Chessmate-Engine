class RouterService {
    constructor(appContainerId) {
        this.appContainer = document.getElementById(appContainerId);
        this.routes = {
            'home': this.getHomePageHTML(),
            'explorer': this.getExplorerPageHTML(),
        };
        this.currentRoute = 'home';
    }

    /**
     * URL Hash (e.g., #explorer) অনুযায়ী পেজ লোড করে
     */
    loadRoute(route) {
        const routeKey = route.replace('#', '') || 'home';
        
        if (this.routes[routeKey]) {
            this.appContainer.innerHTML = this.routes[routeKey];
            this.currentRoute = routeKey;
            
            // নতুন পেজ লোড হলে নির্দিষ্ট JS ফাংশন কল করা
            if (routeKey === 'explorer' && typeof window.initializeExplorer === 'function') {
                setTimeout(window.initializeExplorer, 0); // DOM লোড হলে এক্সপ্লোরার ইনিশিয়ালাইজ করবে
            }
        } else {
            this.appContainer.innerHTML = `
                <div class="container page-content">
                    <h2>404 Not Found</h2>
                    <p>The page you are looking for does not exist.</p>
                </div>`;
        }
        
        this.updateNavLinks(routeKey);
    }
    
    /**
     * নেভিগেশন লিংকগুলোর Active ক্লাস আপডেট করে
     */
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
                <h2>Welcome to ChessMate AI</h2>
                <p>
                    Explore a vast database of opening moves derived from over 100,000 top-rated Lichess games.
                    Analyze win rates, draws, and black's winning chances for any position.
                </p>
                <p>
                    Built with a clean Node.js backend and a fast, modern JavaScript frontend.
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
                        <div id="status" style="margin-top: 15px; font-weight: 600; color: var(--color-secondary);"></div>
                    </div>

                    <!-- Stats Area -->
                    <div class="stats-area">
                        <h3>Position Analysis</h3>
                        <div id="loading" style="display: none; color: var(--color-primary);">
                            ⏳ Loading stats...
                        </div>
                        <div id="moveHistory" style="font-style: italic; font-size: 0.9em; margin-bottom: 15px; color: #95a5a6;">
                            Start position
                        </div>
                        <table id="statsTable">
                            <thead>
                                <tr>
                                    <th>Move</th>
                                    <th>Games</th>
                                    <th>Win Rate (W/D/B)</th>
                                </tr>
                            </thead>
                            <tbody id="statsBody">
                                <tr><td colspan="3">Select a move or start exploring.</td></tr>
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

// গ্লোবাল এক্সেসের জন্য ইনস্ট্যান্স এক্সপোর্ট করা
window.routerService = new RouterService('app-container');
