// 1. লাইব্রেরি ইম্পোর্ট
importScripts("https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/ort.min.js");
importScripts("../lib/chess.js");

// --- কনফিগারেশন ---
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/";
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;

// --- CRITICAL FIX: আপনার গিটহাবের ফাইলের নাম অনুযায়ী পাথ ---
const MODELS = {
    'nano': "../../models/nexus-nano-ce/nexus-nano-ce.onnx",
    'core': "../../models/nexus-core-ce/nexus-core-ce.onnx"
};

// --- গ্লোবাল ভেরিয়েবল ---
let session = null;
let modelLoaded = false;
let currentModelKey = null;
let transpositionTable = new Map();

// --- PST টেবিল ---
const pieceWeights = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };
const pst_w = {
    p:[[100,100,100,100,105,100,100,100],[78,83,86,73,102,82,85,90],[7,29,21,44,40,31,44,7],[-17,16,-2,15,14,0,15,-13],[-26,3,10,9,6,1,0,-23],[-22,9,5,-11,-10,-2,3,-19],[-31,8,-7,-37,-36,-14,3,-31],[0,0,0,0,0,0,0,0]],
    n:[[-66,-53,-75,-75,-10,-55,-58,-70],[-3,-6,100,-36,4,62,-4,-14],[10,67,1,74,73,27,62,-2],[24,24,45,37,33,41,25,17],[-1,5,31,21,22,35,2,0],[-18,10,13,22,18,15,11,-14],[-23,-15,2,0,2,0,-23,-20],[-74,-23,-26,-24,-19,-35,-22,-69]],
    b:[[-59,-78,-82,-76,-23,-107,-37,-50],[-11,20,35,-42,-39,31,2,-22],[-9,39,-32,41,52,-10,28,-14],[25,17,20,34,26,25,15,10],[13,10,17,23,17,16,0,7],[14,25,24,15,8,25,20,15],[19,20,11,6,7,6,20,16],[-7,2,-15,-12,-14,-15,-10,-10]],
    r:[[35,29,33,4,37,33,56,50],[55,29,56,67,55,62,34,60],[19,35,28,33,45,27,25,15],[0,5,16,13,18,-4,-9,-6],[-28,-35,-16,-21,-13,-29,-46,-30],[-42,-28,-42,-25,-25,-35,-26,-46],[-53,-38,-31,-26,-29,-43,-44,-53],[-30,-24,-18,5,-2,-18,-31,-32]],
    q:[[6,1,-8,-104,69,24,88,26],[14,32,60,-10,20,76,57,24],[-2,43,32,60,72,63,43,2],[1,-16,22,17,25,20,-13,-6],[-14,-15,-2,-5,-1,-10,-20,-22],[-30,-6,-13,-11,-16,-11,-16,-27],[-36,-18,0,-19,-15,-15,-21,-38],[-39,-30,-31,-13,-31,-36,-34,-42]],
    k:[[4,54,47,-99,-99,60,83,-62],[-32,10,55,56,56,55,10,3],[-62,12,-57,44,-67,28,37,-31],[-55,50,11,-4,-19,13,0,-49],[-55,-43,-52,-28,-51,-47,-8,-50],[-47,-42,-43,-79,-64,-32,-29,-32],[-4,3,-14,-50,-57,-18,13,4],[17,30,-3,-14,6,-1,40,18]]
};
const pst_b = {
    p: pst_w.p.slice().reverse(),
    n: pst_w.n.slice().reverse(),
    b: pst_w.b.slice().reverse(),
    r: pst_w.r.slice().reverse(),
    q: pst_w.q.slice().reverse(),
    k: pst_w.k.slice().reverse()
};

// --- Message Handler ---
self.onmessage = async function(e) {
    const { type, data, modelKey } = e.data;

    if (type === 'LOAD_MODEL') {
        const path = MODELS[modelKey] || MODELS['core'];
        await loadModel(path);
    } 
    else if (type === 'THINK') {
        if (!modelLoaded) {
            self.postMessage({ type: 'ERROR', data: 'Model not loaded yet. Please wait.' });
            return;
        }
        try {
            const bestMove = await getBestMove(data.fen, data.depth);
            self.postMessage({ type: 'BEST_MOVE', data: bestMove });
        } catch (err) {
            self.postMessage({ type: 'ERROR', data: err.message });
        }
    }
};

async function loadModel(path) {
    try {
        session = null; // Clear previous
        transpositionTable.clear();
        
        session = await ort.InferenceSession.create(path);
        modelLoaded = true;
        self.postMessage({ type: 'MODEL_LOADED' });
    } catch (error) {
        self.postMessage({ type: 'ERROR', data: "Failed to load: " + path });
    }
}

function fenToTensor(fen) {
    const position = fen.split(' ')[0];
    const board = new Float32Array(12 * 8 * 8);
    const pieceToChannel = {'P':0, 'N':1, 'B':2, 'R':3, 'Q':4, 'K':5, 'p':6, 'n':7, 'b':8, 'r':9, 'q':10, 'k':11};
    const ranks = position.split('/');
    
    for (let rank = 0; rank < 8; rank++) {
        let file = 0;
        for (const char of ranks[rank]) {
            if (char >= '1' && char <= '8') file += parseInt(char);
            else {
                const channel = pieceToChannel[char];
                if (channel !== undefined) board[channel * 64 + rank * 8 + file] = 1.0;
                file++;
            }
        }
    }
    return new ort.Tensor('float32', board, [1, 12, 8, 8]);
}

async function evaluate(game) {
    const fen = game.fen();
    let totalScore = 0;

    // PST
    const board = game.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const pst = piece.color === 'w' ? pst_w : pst_b;
                if (pst[piece.type] && pst[piece.type][i]) {
                    const val = pieceWeights[piece.type] + pst[piece.type][i][j];
                    totalScore += piece.color === 'w' ? val : -val;
                }
            }
        }
    }
    let heuristicScore = totalScore / 1000; 

    // NN
    let nnScore = 0;
    try {
        const inputTensor = fenToTensor(fen);
        const results = await session.run({ board_state: inputTensor });
        nnScore = results.evaluation.data[0];
    } catch (e) { nnScore = 0; }

    let finalScore = (nnScore * 0.7) + (heuristicScore * 0.3);
    return game.turn() === 'b' ? -finalScore : finalScore;
}

async function getBestMove(fen, depth) {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    
    if (moves.length === 0) return { move: null, score: 0 };

    moves.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (a.captured) scoreA += 10;
        if (a.promotion) scoreA += 5;
        if (b.captured) scoreB += 10;
        if (b.promotion) scoreB += 5;
        return scoreB - scoreA;
    });

    let bestMove = moves[0];
    let bestValue = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
        game.move(move);
        const boardValue = - (await alphaBeta(game, depth - 1, -beta, -alpha));
        game.undo();

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
        alpha = Math.max(alpha, bestValue);
        if (alpha >= beta) break;
    }

    return { move: bestMove, score: bestValue };
}

async function alphaBeta(game, depth, alpha, beta) {
    const fen = game.fen();
    if (transpositionTable.has(fen)) {
        const entry = transpositionTable.get(fen);
        if (entry.depth >= depth) return entry.score;
    }

    if (depth === 0 || game.game_over()) {
        const score = await evaluate(game);
        transpositionTable.set(fen, { depth: 0, score: score });
        return score;
    }

    const moves = game.moves({ verbose: true });
    moves.sort((a, b) => (b.captured ? 10 : 0) - (a.captured ? 10 : 0));

    let value = -Infinity;

    for (const move of moves) {
        game.move(move);
        const evalScore = - (await alphaBeta(game, depth - 1, -beta, -alpha));
        game.undo();

        value = Math.max(value, evalScore);
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
    }
    
    transpositionTable.set(fen, { depth: depth, score: value });
    if (transpositionTable.size > 100000) transpositionTable.clear();

    return value;
}
