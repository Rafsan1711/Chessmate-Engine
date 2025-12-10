// --- কনফিগারেশন (একদম শুরুতে থাকতে হবে) ---
// 1. WASM ফাইলগুলো CDN থেকে লোড হবে
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/";

// 2. থ্রেডিং ফিক্স (খুবই জরুরি)
// ব্রাউজারে মাল্টি-থ্রেডিং এরর এড়াতে আমরা ১টি থ্রেড ব্যবহার করব
ort.env.wasm.numThreads = 1; 
ort.env.wasm.proxy = false;

// 3. মডেল পাথ
const MODEL_PATH = "assets/chess_model.onnx"; 

class ModelService {
    constructor() {
        this.session = null;
        this.modelLoaded = false;
    }

    async loadModel(statusCallback) {
        if (this.modelLoaded) return true;

        if (statusCallback) statusCallback("Connecting to Engine...");
        
        try {
            // মডেল লোড করার চেষ্টা (রি-ট্রাই সহ)
            // অনেক সময় নেটওয়ার্ক স্লো থাকলে প্রথমবার ফেইল করে
            this.session = await ort.InferenceSession.create(MODEL_PATH);
            
            this.modelLoaded = true;
            console.log("✅ ONNX Model Loaded Successfully!");
            
            if (statusCallback) statusCallback("Engine Ready. You are White.");
            return true;
        } catch (error) {
            console.error("❌ Failed to load Model:", error);
            
            let msg = "Engine failed to load.";
            if (error.message.includes("404")) msg = "Error: 'chess_model.onnx' missing in assets.";
            else if (error.message.includes("Failed to fetch")) msg = "Network Error: Check internet connection.";
            
            if (statusCallback) statusCallback(msg);
            return false;
        }
    }
    
    // FEN to Tensor কনভার্টার
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
            // কালোর চাল হলে স্কোর উল্টে যাবে
            return fen.split(' ')[1] === 'b' ? -score : score;
        } catch (e) { return 0; }
    }
    
    async getBestMove(game) {
        // মডেল না থাকলে সেফটি চেক
        if (!this.modelLoaded) {
            console.warn("Model not loaded yet.");
            const moves = game.moves();
            if(moves.length === 0) return { move: null, score: 0 };
            return { move: moves[Math.floor(Math.random() * moves.length)], score: 0 };
        }
        
        const moves = game.moves({ verbose: true });
        if (moves.length === 0) return { move: null, score: 0 };

        let bestMove = moves[0];
        let bestScore = -Infinity;
        
        // সব মুভ চেক করা
        for (const move of moves) {
            game.move(move);
            // Negamax Logic: -evaluate()
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
