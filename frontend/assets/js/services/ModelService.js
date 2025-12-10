// File Path: frontend/assets/js/services/ModelService.js

// 1. WASM ফাইলের লোকেশন সেট করা (CDN থেকে) - এটা "Model failed to load" ফিক্স করবে
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/";

// 2. আপনার লোকাল মডেলের পাথ
const MODEL_PATH = "assets/chess_model.onnx"; 
const AI_DEPTH = 2; // ফাস্ট রেসপন্সের জন্য ২ বা ৩ রাখুন

class ModelService {
    constructor() {
        this.session = null;
        this.modelLoaded = false;
    }

    async loadModel(statusCallback) {
        if (this.modelLoaded) return true;

        if (statusCallback) statusCallback("Loading Engine resources...");
        
        try {
            // মডেল লোড করার চেষ্টা
            console.log(`Attempting to load model from: ${window.location.origin}/${MODEL_PATH}`);
            
            this.session = await ort.InferenceSession.create(MODEL_PATH);
            
            this.modelLoaded = true;
            console.log("✅ ONNX Model Loaded Successfully!");
            
            if (statusCallback) statusCallback("Engine Ready.");
            return true;
        } catch (error) {
            console.error("❌ Failed to load ONNX Model:", error);
            
            // এরর ডিটেইলস দেখানো
            let errorMsg = "Engine Error.";
            if (error.message.includes("404")) {
                errorMsg = "Error: 'chess_model.onnx' not found in assets folder.";
            } else if (error.message.includes("failed to fetch")) {
                errorMsg = "Error: Network issue or wrong path.";
            }
            
            if (statusCallback) statusCallback(errorMsg);
            return false;
        }
    }
    
    // FEN থেকে টেনসর কনভার্শন
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
                    if (channel !== undefined) {
                        board[channel * 64 + rank * 8 + file] = 1.0;
                    }
                    file++;
                }
            }
        }
        return new ort.Tensor('float32', board, [1, 12, 8, 8]);
    }

    // পজিশন ইভালুয়েশন
    async evaluate(fen) {
        if (!this.modelLoaded) return 0;
        try {
            const inputTensor = this.fenToTensor(fen);
            const results = await this.session.run({ board_state: inputTensor });
            
            // মডেলের আউটপুট (সাধারণত সাদার পারস্পেক্টিভে থাকে)
            const score = results.evaluation.data[0];
            
            // যার চাল তার পারস্পেক্টিভে স্কোর রিটার্ন করা
            const turn = fen.split(' ')[1];
            return turn === 'b' ? -score : score;
        } catch (e) { 
            console.error("Inference Error:", e);
            return 0; 
        }
    }
    
    // সেরা চাল বের করা (Minimax)
    async getBestMove(game) {
        if (!this.modelLoaded) {
            // ফলব্যাক: র‍্যান্ডম মুভ
            console.warn("Model not loaded, playing random move.");
            const moves = game.moves();
            return { move: moves[Math.floor(Math.random() * moves.length)], score: 0 };
        }
        
        // সব ভ্যালিড মুভ
        const moves = game.moves({ verbose: true });
        
        // গেম শেষ হলে
        if (moves.length === 0) return { move: null, score: 0 };

        let bestMove = null;
        let bestScore = -Infinity;
        
        // সিম্পল ১-লেভেল সার্চ (ব্রাউজার হ্যাং না করার জন্য)
        // Claude AI কে বলবেন এখানে "Web Worker" বা "Alpha-Beta Pruning" যোগ করতে
        for (const move of moves) {
            game.move(move);
            
            // আমি চাল দেওয়ার পর অপোনেন্ট (Human) খেলবে, তাই আমি অপোনেন্টের স্কোর মিনিমাইজ করতে চাই
            // অথবা Negamax লজিকে: -evaluate()
            const evalScore = await this.evaluate(game.fen());
            const myScore = -evalScore; 
            
            game.undo();
            
            if (myScore > bestScore) {
                bestScore = myScore;
                bestMove = move;
            }
        }
        
        return { move: bestMove, score: bestScore };
    }
}

// গ্লোবাল ইনস্ট্যান্স
window.modelService = new ModelService();
