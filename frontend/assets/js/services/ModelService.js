class ModelService {
    constructor() {
        this.worker = null;
        this.modelLoaded = false;
        this.currentModelKey = null;
        this.statusCallback = null;
        
        // ওয়ার্কার ইনিশিয়ালাইজেশন
        this.worker = new Worker('assets/js/services/engine.worker.js');
        
        // ওয়ার্কার থেকে মেসেজ হ্যান্ডলিং
        this.worker.onmessage = (e) => {
            const { type, data } = e.data;
            
            if (type === 'MODEL_LOADED') {
                this.modelLoaded = true;
                console.log(`✅ Worker: ${this.currentModelKey} Engine Ready.`);
                
                // UI আপডেট
                if (this.statusCallback) this.statusCallback(`Engine Ready (${this.currentModelKey.toUpperCase()}).`);
                
                // Active Model নাম UI তে আপডেট করা (যদি এলিমেন্ট থাকে)
                const activeLabel = document.getElementById('activeModelDisplay');
                if(activeLabel) activeLabel.innerText = this.currentModelKey === 'core' ? 'Nexus-Core (ResNet)' : 'Nexus-Nano (CNN)';

            } 
            else if (type === 'ERROR') {
                console.error("Worker Error:", data);
                if (this.statusCallback) this.statusCallback("Engine Error: " + data);
            }
        };
    }

    async loadModel(modelKey, statusCallback) {
        this.statusCallback = statusCallback;
        
        // যদি ইতিমধ্যে লোড করা থাকে
        if (this.modelLoaded && this.currentModelKey === modelKey) {
            statusCallback(`Engine Ready (${modelKey.toUpperCase()}).`);
            return true;
        }

        this.currentModelKey = modelKey;
        this.modelLoaded = false;
        statusCallback(`Initializing ${modelKey.toUpperCase()} Engine...`);
        
        // ওয়ার্কারকে স্পেসিফিক মডেল লোড করতে বলা
        this.worker.postMessage({ type: 'LOAD_MODEL', modelKey: modelKey });
        
        // UI ল্যাগের জন্য সামান্য ডিলে
        return new Promise(resolve => setTimeout(() => resolve(true), 1500));
    }

    // ওপেনিং বুক (মেইন থ্রেডেই চলে কারণ এটি API কল করে)
    async getBookMove(game) {
        try {
            const fen = game.fen();
            const stats = await window.apiService.getOpeningStats(fen);
            
            if (!stats || !stats.moves) return null;

            // সেরা চালগুলো সর্ট করা
            let moves = Object.entries(stats.moves)
                .sort(([,a], [,b]) => (b.white + b.black + b.draw) - (a.white + a.black + a.draw));
            
            if (moves.length === 0) return null;

            // Top 3 moves থেকে Weighted Random Pick
            const topMoves = moves.slice(0, 3);
            const totalGames = topMoves.reduce((sum, [, data]) => sum + (data.white+data.black+data.draw), 0);
            
            let randomVal = Math.random() * totalGames;
            for (let [moveSan, data] of topMoves) {
                randomVal -= (data.white + data.black + data.draw);
                if (randomVal <= 0) return moveSan;
            }
            return topMoves[0][0]; // Fallback
        } catch(e) { return null; }
    }

    async getBestMove(game) {
        // ১. আগে বুক চেক (এটি ০ সেকেন্ডে রেসপন্স দেয়)
        const bookMoveSan = await this.getBookMove(game);
        if (bookMoveSan) {
            const moves = game.moves({ verbose: true });
            const matchedMove = moves.find(m => m.san === bookMoveSan);
            if (matchedMove) return { move: matchedMove, score: "Book" };
        }

        // ২. বুক না থাকলে ওয়ার্কারকে কাজ দেওয়া
        return new Promise((resolve) => {
            // রেজাল্ট হ্যান্ডলার
            const handleResult = (e) => {
                const { type, data } = e.data;
                if (type === 'BEST_MOVE') {
                    this.worker.removeEventListener('message', handleResult);
                    resolve(data);
                }
            };
            
            this.worker.addEventListener('message', handleResult);
            
            // ওয়ার্কারকে চিন্তা করতে পাঠানো (Depth 3 is standard for web)
            this.worker.postMessage({ 
                type: 'THINK', 
                data: { fen: game.fen(), depth: 3 } 
            });
        });
    }
}

window.modelService = new ModelService();
