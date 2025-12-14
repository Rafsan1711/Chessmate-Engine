// --- কনফিগারেশন ---
// WASM ফাইলগুলো CDN থেকে লোড হবে
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/";

// থ্রেডিং ফিক্স (অবশ্যই ১ হতে হবে)
ort.env.wasm.numThreads = 1; 
ort.env.wasm.proxy = false;

const MODEL_PATH = "assets/chess_model.onnx"; 

class ModelService {
    constructor() {
        this.session = null;
        this.modelLoaded = false;
    }

    async loadModel(statusCallback) {
        if (this.modelLoaded) return true;

        if (statusCallback) statusCallback("Loading Engine resources...");
        
        try {
            // মডেল ফাইলের অস্তিত্ব চেক করা (Optional Fetch Check)
            const response = await fetch(MODEL_PATH, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`Model file not found (Status: ${response.status})`);
            }

            // মডেল সেশন তৈরি
            this.session = await ort.InferenceSession.create(MODEL_PATH);
            
            this.modelLoaded = true;
            console.log("✅ ONNX Model Loaded Successfully!");
            
            if (statusCallback) statusCallback("Engine Ready. You are White.");
            return true;

        } catch (error) {
            console.error("❌ Failed to load Model:", error);
            
            // সেইফ এরর মেসেজ হ্যান্ডলিং (ক্র্যাশ ফিক্স)
            let errorText = "Unknown Error";
            if (typeof error === "string") {
                errorText = error;
            } else if (error && error.message) {
                errorText = error.message;
            } else {
                errorText = JSON.stringify(error);
            }

            let userMsg = "Engine failed to load.";
            if (errorText.includes("404") || errorText.includes("not found")) {
                userMsg = "Error: 'chess_model.onnx' not found in assets.";
            } else if (errorText.includes("network") || errorText.includes("fetch")) {
                userMsg = "Network Error: Check connection.";
            } else if (errorText.includes("magic number")) {
                userMsg = "Error: Invalid ONNX file (Corrupted/LFS pointer).";
            }
            
            if (statusCallback) statusCallback(userMsg);
            return false;
        }
    }
    
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
            const score = results.evaluation.data[0];
            return fen.split(' ')[1] === 'b' ? -score : score;
        } catch (e) { return 0; }
    }
    
    async getBestMove(game) {
        if (!this.modelLoaded) {
            const moves = game.moves();
            if (moves.length === 0) return { move: null, score: 0 };
            return { move: moves[Math.floor(Math.random() * moves.length)], score: 0 };
        }
        
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
