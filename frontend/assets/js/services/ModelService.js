// File Path: frontend/assets/js/services/ModelService.js

// আপনার আপলোড করা মডেলের URL এখানে বসানো হলো
const MODEL_URL = "https://huggingface.co/models/Rafs-an09002/chessmate-model/resolve/main/chess_model.onnx";
const AI_DEPTH = 3; // AI কত চাল সামনে ভাববে (ফ্রি সার্ভারের জন্য ৩-৪ ভালো)

class ModelService {
    constructor() {
        this.session = null;
        this.modelLoaded = false;
        this.modelURL = MODEL_URL;
    }

    async loadModel(statusCallback) {
        if (this.modelLoaded) return true;

        statusCallback("Loading AI Model (7MB)...");
        
        // ort (onnxruntime-web) CDN থেকে লোড হবে
        try {
            this.session = await ort.InferenceSession.create(this.modelURL);
            this.modelLoaded = true;
            statusCallback("Model Loaded Successfully. Engine Ready.");
            return true;
        } catch (error) {
            console.error("Failed to load ONNX Model:", error);
            statusCallback("ERROR: Model failed to load. Using basic evaluation.");
            return false;
        }
    }
    
    /**
     * FEN to 12x8x8 Tensor conversion (ML Input)
     */
    fenToTensor(fen) {
        const position = fen.split(' ')[0];
        const board = new Float32Array(12 * 8 * 8); // 12 channels * 64 squares
        
        const pieceToChannel = {
            'P': 0, 'N': 1, 'B': 2, 'R': 3, 'Q': 4, 'K': 5,
            'p': 6, 'n': 7, 'b': 8, 'r': 9, 'q': 10, 'k': 11
        };
        
        const ranks = position.split('/');
        let squareIndex = 0;
        
        for (let rank = 0; rank < 8; rank++) {
            let file = 0;
            for (const char of ranks[rank]) {
                if (char >= '1' && char <= '8') {
                    file += parseInt(char);
                } else {
                    const channel = pieceToChannel[char];
                    if (channel !== undefined) {
                        // Index: channel * 64 + rank * 8 + file (H x W first)
                        const index = channel * 64 + rank * 8 + file;
                        board[index] = 1.0;
                    }
                    file++;
                }
            }
        }
        
        // (1, 12, 8, 8) tensor
        return new ort.Tensor('float32', board, [1, 12, 8, 8]);
    }

    /**
     * মডেল ব্যবহার করে একটি পজিশনের মান (Evaluation) অনুমান করা
     * @returns {number} Evaluation score (-1 to 1)
     */
    async evaluate(fen) {
        if (!this.modelLoaded) {
            return this.evaluateMaterial(new Chess(fen)); // Fallback
        }
        
        try {
            const inputTensor = this.fenToTensor(fen);
            const feeds = { board_state: inputTensor };
            const results = await this.session.run(feeds);
            const evaluation = results.evaluation.data[0];
            
            // Turn based adjustment: যদি কালোর চাল হয়, আমরা Evaluation উল্টে দেব
            const turn = fen.split(' ')[1];
            return turn === 'b' ? -evaluation : evaluation;

        } catch (error) {
            console.error("Evaluation error:", error);
            return 0; 
        }
    }
    
    /**
     * Minimax Search দিয়ে Best Move বের করা
     * @param {Chess} game - chess.js instance
     * @returns {Promise<object>} { move: MoveObject, score: number }
     */
    async getBestMove(game) {
        const result = await this.minimaxRoot(game, AI_DEPTH, true);
        return result;
    }

    /**
     * Minimax Entry Point
     */
    async minimaxRoot(game, depth, isMaximizingPlayer) {
        const moves = game.moves({ verbose: true });
        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of moves) {
            game.move(move);
            const score = await this.minimax(game, depth - 1, -Infinity, Infinity, !isMaximizingPlayer);
            game.undo();

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return { move: bestMove, score: bestScore };
    }
    
    /**
     * Minimax with Alpha-Beta Pruning (Recursive)
     */
    async minimax(game, depth, alpha, beta, isMaximizingPlayer) {
        if (depth === 0 || game.game_over()) {
            // Base Case: Evaluate the position using the ML model
            const evaluation = await this.evaluate(game.fen());
            return evaluation; 
        }

        const moves = game.moves({ verbose: true });
        
        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                game.move(move);
                const evaluation = await this.minimax(game, depth - 1, alpha, beta, false);
                game.undo();
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else { // Minimizing Player (Black)
            let minEval = Infinity;
            for (const move of moves) {
                game.move(move);
                const evaluation = await this.minimax(game, depth - 1, alpha, beta, true);
                game.undo();
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }
    
    /**
     * Fallback Material Evaluation (in case model fails to load)
     */
    evaluateMaterial(game) {
        const pieceValues = {'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 0};
        let score = 0;
        game.board().forEach(row => {
            row.forEach(square => {
                if (square) {
                    const value = pieceValues[square.type];
                    score += square.color === 'w' ? value : -value;
                }
            });
        });
        // Normalize to [-1, 1] range (roughly)
        return score / 5000; 
    }
}

window.modelService = new ModelService();
