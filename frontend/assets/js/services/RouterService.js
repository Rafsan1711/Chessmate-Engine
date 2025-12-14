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
            
            // Re-trigger visual effects
            if (window.AOS) AOS.refresh();
            
            if (routeKey === 'explorer' && window.initializeExplorer) setTimeout(window.initializeExplorer, 50);
            if (routeKey === 'play' && window.initializeEngine) setTimeout(window.initializeEngine, 50);
        }
        this.updateNavLinks(routeKey);
    }
    
    updateNavLinks(key) {
        document.querySelectorAll('.nav-links .nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-route="${key}"]`);
        if(activeLink) activeLink.classList.add('active');
    }

    getHomePageHTML() {
        return `
            <div class="container hero-section text-center text-white d-flex flex-column justify-content-center" style="min-height: 80vh;">
                <div data-aos="fade-up">
                    <h1 class="display-1 fw-bold mb-4">Gambit<span class="text-primary-gradient">Flow</span></h1>
                    <p class="lead mb-5 text-muted" style="max-width: 600px; margin: 0 auto;">
                        Next-Generation Chess Intelligence powered by Deep Residual Networks. 
                        Analyze with elite data or challenge the neural engine.
                    </p>
                    <div class="d-flex justify-content-center gap-3">
                        <a href="#play" class="btn btn-primary btn-lg btn-glow rounded-pill px-5">Play vs AI</a>
                        <a href="#explorer" class="btn btn-outline-light btn-lg rounded-pill px-5">Explorer</a>
                    </div>
                </div>
            </div>`;
    }

    getExplorerPageHTML() {
        return `
            <div class="container pb-5">
                <div class="row g-5">
                    <div class="col-lg-6 d-flex justify-content-center" data-aos="fade-right">
                        <div class="board-container-wrapper">
                            <div id="myBoard"></div>
                            <!-- Controls -->
                            <div class="d-flex justify-content-center gap-2 mt-3">
                                <button id="resetBtn" class="btn btn-sm btn-outline-secondary" data-tippy-content="Reset Board"><i class="fa-solid fa-rotate-right"></i></button>
                                <button id="undoBtn" class="btn btn-sm btn-outline-secondary" data-tippy-content="Undo Move"><i class="fa-solid fa-arrow-rotate-left"></i></button>
                                <button id="flipBtn" class="btn btn-sm btn-outline-secondary" data-tippy-content="Flip Board"><i class="fa-solid fa-retweet"></i></button>
                            </div>
                            <div id="status" class="text-center mt-2 text-info"></div>
                        </div>
                    </div>
                    <div class="col-lg-6" data-aos="fade-left">
                        <div class="glass-card p-4 h-100">
                            <h3 class="fw-bold mb-4"><i class="fa-solid fa-database me-2 text-primary"></i>Opening Explorer</h3>
                            <div class="bg-dark rounded p-2 mb-3 border border-secondary border-opacity-25">
                                <small class="text-muted d-block mb-1">PGN History:</small>
                                <div id="moveHistory" class="text-white font-monospace text-break">Start</div>
                            </div>
                            <div class="stats-table-container">
                                <table class="table table-dark table-hover mb-0" id="statsTable">
                                    <thead class="sticky-top">
                                        <tr>
                                            <th>Move</th>
                                            <th class="text-end">Games</th>
                                            <th>Win Rate (W/D/B)</th>
                                        </tr>
                                    </thead>
                                    <tbody id="statsBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    getPlayPageHTML() {
        return `
            <div class="container pb-5">
                <div class="row g-5">
                    <div class="col-lg-6 d-flex justify-content-center position-relative">
                        <div class="board-container-wrapper">
                            <div class="ai-thinking-border"></div> <!-- Glow Effect -->
                            <div id="myBoard"></div>
                            <div class="d-flex justify-content-between mt-3">
                                <div id="engineStatus" class="d-flex align-items-center fw-bold text-white">Select Model...</div>
                                <div class="d-flex gap-2">
                                    <button id="newGameBtn" class="btn btn-sm btn-danger"><i class="fa-solid fa-plus me-1"></i>New</button>
                                    <button id="flipBtn" class="btn btn-sm btn-outline-light"><i class="fa-solid fa-retweet"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="glass-card p-4">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h3 class="fw-bold m-0"><i class="fa-solid fa-robot me-2 text-warning"></i>Game Room</h3>
                                <button class="btn btn-sm btn-outline-info" onclick="showModelModal()">Switch Model</button>
                            </div>
                            
                            <div class="alert alert-dark border-0 d-flex align-items-center gap-3">
                                <i class="fa-solid fa-microchip fa-2x text-muted"></i>
                                <div>
                                    <h6 class="m-0 fw-bold">Active Engine</h6>
                                    <small class="text-muted" id="activeModelDisplay">None selected</small>
                                </div>
                            </div>

                            <hr class="border-secondary opacity-25">
                            
                            <h6 class="text-muted mb-3">Live Log</h6>
                            <div id="engineHistory" class="p-3 bg-dark rounded text-white-50 font-monospace small" style="height: 200px; overflow-y: auto;">
                                Waiting for game start...
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
}
window.routerService = new RouterService('app-container');
