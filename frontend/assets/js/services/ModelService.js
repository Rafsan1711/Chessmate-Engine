// WASM পাথ সেটআপ
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/";

// --- CRITICAL FIX: Threading Disable ---
// এই দুটি লাইন আপনার "env.wasm.numThreads" এরর ফিক্স করবে
ort.env.wasm.numThreads = 1; 
ort.env.wasm.proxy = false;
// -------------------------------------

// মডেল পাথ
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
            // মডেল লোড করা
            this.session = await ort.InferenceSession.create(MODEL_PATH);
            
            this.modelLoaded = true;
            console.log("✅ ONNX Model Loaded!");
            
            if (statusCallback) statusCallback("Engine Ready. You are White.");
            return true;
        } catch (error) {
            console.error("❌ Failed to load Model:", error);
            
            let msg = "Engine Error.";
            // নির্দিষ্ট এরর মেসেজ
            if (error.message && error.message.includes("404")) {
                msg = "Error: 'assets/chess_model.onnx' not found.";
            } else if (error.name === "NotSupportedError") {
                msg = "Browser not supported (WebAssembly missing).";
            }
            
            if (statusCallback) statusCallback(msg);
            return false;
        }
    }
    
    // FEN to Tensor
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
            // মডেল না থাকলে র‍্যান্ডম মুভ
            const moves = game.moves();
            return { move: moves[Math.floor(Math.random() * moves.length)], score: 0 };
        }
        
        // মডেল থাকলে সব মুভ চেক করা
        const moves = game.moves({ verbose: true });
        let bestMove = null;
        let bestScore = -Infinity;
        
        // সব মুভ লুপ করা
        for (const move of moves) {
            game.move(move);
            // Negamax: -evaluate()
            const score = - (await this.evaluate(game.fen()));
            game.undo();
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        // যদি কোনো কারণে মুভ না পাওয়া যায় (যেমন চেকমেট), তবুও সেফটি চেক
        if (!bestMove && moves.length > 0) bestMove = moves[0];

        return { move: bestMove, score: bestScore };
    }
}

window.modelService = new ModelService();
