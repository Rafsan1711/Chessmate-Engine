// --- কনফিগারেশন ---
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/";
ort.env.wasm.numThreads = 1; 
ort.env.wasm.proxy = false;

// UPDATE: নতুন মডেল ফাইলের নাম
const MODEL_PATH = "assets/chess_model_v2.onnx"; 

class ModelService {
    constructor() {
        this.session = null;
        this.modelLoaded = false;
    }

    async loadModel(statusCallback) {
        if (this.modelLoaded) return true;

        if (statusCallback) statusCallback("Loading V2 Pro Engine (ResNet)...");
        
        try {
            const response = await fetch(MODEL_PATH, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`Model file not found (Status: ${response.status})`);
            }

            this.session = await ort.InferenceSession.create(MODEL_PATH);
            
            this.modelLoaded = true;
            console.log("✅ V2 ResNet Model Loaded Successfully!");
            
            if (statusCallback) statusCallback("Engine Ready (Pro V2). You are White.");
            return true;

        } catch (error) {
            console.error("❌ Failed to load Model:", error);
            
            let userMsg = "Engine failed to load.";
            if (error.message && error.message.includes("404")) {
                userMsg = "Error: 'chess_model_v2.onnx' missing in assets folder.";
            } else if (error.message && error.message.includes("fetch")) {
                userMsg = "Network Error: Please check your connection.";
            } else if (error.message && error.message.includes("magic number")) {
                userMsg = "Error: Model file corrupted (LFS Issue).";
            }
            
            if (statusCallback) statusCallback(userMsg);
            return false;
        }
    }
    
    // ResNet Input (Same Logic: 12x8x8)
    fenToTensor(fen) {
        const position = fen.split(' ')[0];
        const board = new Float32Array(12 * 8 * 8);
        const pieceToChannel = {'P':0, 'N':1, 'B':2, 'R':3, 'Q':4, 'K':5, 'p':6, 'n':7, 'b':8, 'r':9, 'q':10, 'k':11};
        const ranks = position.split('/');
        
        for (let rank = 0; rank < 8; rank++) {
            let file = 0;
            for (const char of ranks[rank]) {
                if (char >= '1' && char <= '8') {
                    file += parseInt(char);
                } else {
                    const channel = pieceToChannel[char];
                    if (channel !== undefined) board[channel * 64 + rank * 8 + file] = 1.0;
                    file++;
                }
            }
        }
        return new ort.Tensor('float32', board, [1, 12, 8, 8]);
    }

    async evaluate(fen) {
        if (!this.modelLoaded) return 0;
        try {
            const inputTensor = this.fenToTensor(fen);
            const results = await this.session.run({ board_state: inputTensor });
            
            // ResNet এর আউটপুট
            const score = results.evaluation.data[0];
            return fen.split(' ')[1] === 'b' ? -score : score;
        } catch (e) { return 0; }
    }
    
    async getBestMove(game) {
        if (!this.modelLoaded) {
            const moves = game.moves();
            if (moves.length === 0) return { move: null, score: 0 };
            // মডেল না থাকলে র‍্যান্ডম মুভ
            return { move: moves[Math.floor(Math.random() * moves.length)], score: 0 };
        }
        
        // Depth 2 সার্চ (ব্রাউজার ল্যাগ কমানোর জন্য)
        const moves = game.moves({ verbose: true });
        if (moves.length === 0) return { move: null, score: 0 };

        let bestMove = moves[0];
        let bestScore = -Infinity;
        
        for (const move of moves) {
            game.move(move);
            const evalVal = await this.evaluate(game.fen());
            const score = -evalVal;
            game.undo();
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return { move: bestMove, score: bestScore };
    }
}

window.modelService = new ModelService();
