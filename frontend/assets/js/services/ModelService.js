class ModelService {
    constructor() {
        this.worker = null;
        this.modelLoaded = false;
        this.statusCallback = null;
        
        // ওয়ার্কার ইনিশিয়ালাইজেশন
        this.worker = new Worker('assets/js/services/engine.worker.js');
        
        // ওয়ার্কার থেকে মেসেজ হ্যান্ডলিং
        this.worker.onmessage = (e) => {
            const { type, data } = e.data;
            
            if (type === 'MODEL_LOADED') {
                this.modelLoaded = true;
                console.log("✅ Worker: Engine Ready.");
                if (this.statusCallback) this.statusCallback("Engine Ready (Pro V2).");
            } 
            else if (type === 'ERROR') {
                console.error("Worker Error:", data);
                if (this.statusCallback) this.statusCallback("Engine Error: " + data);
            }
        };
    }

    async loadModel(statusCallback) {
        this.statusCallback = statusCallback;
        if (this.modelLoaded) {
            statusCallback("Engine Ready.");
            return true;
        }

        statusCallback("Initializing Engine Worker...");
        // ওয়ার্কারকে মডেল লোড করতে বলা
        this.worker.postMessage({ type: 'LOAD_MODEL' });
        
        // আমরা ধরে নিচ্ছি ৫ সেকেন্ডের মধ্যে লোড হবে (UI ফিডব্যাকের জন্য)
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    }

    // ওপেনিং বুকের জন্য (এটা মেইন থ্রেডেই ফাস্ট চলে, তাই এখানেই রাখলাম)
    async getBookMove(fen) {
        try {
            const stats = await window.apiService.getOpeningStats(fen);
            if (!stats || !stats.moves) return null;

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
            return topMoves[0][0];
        } catch(e) { return null; }
    }

    async getBestMove(game) {
        // ১. আগে বুক চেক
        const bookMoveSan = await this.getBookMove(game.fen());
        if (bookMoveSan) {
            const moves = game.moves({ verbose: true });
            const matchedMove = moves.find(m => m.san === bookMoveSan);
            if (matchedMove) return { move: matchedMove, score: "Book" };
        }

        // ২. বুক না থাকলে ওয়ার্কারকে কাজ দেওয়া
        return new Promise((resolve) => {
            // ওয়ান-টাইম ইভেন্ট লিসেনার রেজাল্টের জন্য
            const handleResult = (e) => {
                const { type, data } = e.data;
                if (type === 'BEST_MOVE') {
                    this.worker.removeEventListener('message', handleResult);
                    // পুরনো গ্লোবাল লিসেনার আবার সেট করা
                    this.reattachGlobalListener(); 
                    resolve(data);
                }
            };
            
            // সাময়িকভাবে স্পেসিফিক লিসেনার অ্যাড করা
            this.worker.addEventListener('message', handleResult);
            
            // ওয়ার্কারকে চিন্তা করতে পাঠানো
            this.worker.postMessage({ 
                type: 'THINK', 
                data: { fen: game.fen(), depth: 3 } 
            });
        });
    }
    
    reattachGlobalListener() {
        // গ্লোবাল এরর/স্ট্যাটাস লিসেনার রি-অ্যাটাচ করা (যদি প্রয়োজন হয়)
        // সিম্পলিসিটির জন্য কনস্ট্রাক্টরের লিসেনারই যথেষ্ট
    }
}

window.modelService = new ModelService();
