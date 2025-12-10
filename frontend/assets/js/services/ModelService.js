// WASM পাথ সেটআপ
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/";

// মডেল পাথ (Render এ assets ফোল্ডার রুটে থাকে)
const MODEL_PATH = "assets/chess_model.onnx"; 

class ModelService {
    constructor() {
        this.session = null;
        this.modelLoaded = false;
    }

    async loadModel(statusCallback) {
        if (this.modelLoaded) return true;
        if (statusCallback) statusCallback("Loading Engine...");
        
        try {
            this.session = await ort.InferenceSession.create(MODEL_PATH);
            this.modelLoaded = true;
            if (statusCallback) statusCallback("Engine Ready.");
            return true;
        } catch (error) {
            console.error("Model Error:", error);
            if (statusCallback) statusCallback("Engine failed. Check console.");
            return false;
        }
    }
    
    // ইনপুট টেনসর
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
        
        for (const move of moves) {
            game.move(move);
            // বর্তমান বোর্ডের স্কোর (AI এর চালের পর)
            // আমরা চাই অপোনেন্টের স্কোর মিনিমাম হোক -> Negamax Logic
            const inputTensor = this.fenToTensor(game.fen());
            const results = await this.session.run({ board_state: inputTensor });
            let score = results.evaluation.data[0];
            
            // যদি কালোর চাল হয়, স্কোর উল্টে দাও (কারণ মডেল সাদার সাপেক্ষে ট্রেন করা)
            if (game.turn() === 'b') score = -score;
            
            // Negate score for minimax
            score = -score;

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
