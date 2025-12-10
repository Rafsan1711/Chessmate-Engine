// আপনার দেওয়া সলিড পিস লোডার লজিক
const pieceCandidates = {
    'wK':['assets/img/pieces/wK.svg','assets/img/pieces/wKing.svg'],
    'wQ':['assets/img/pieces/wQ.svg','assets/img/pieces/wQueen.svg'],
    'wR':['assets/img/pieces/wR.svg','assets/img/pieces/wRook.svg'],
    'wB':['assets/img/pieces/wB.svg','assets/img/pieces/wBishop.svg'],
    'wN':['assets/img/pieces/wN.svg','assets/img/pieces/wKnight.svg'],
    'wP':['assets/img/pieces/wP.svg','assets/img/pieces/wPawn.svg'],
    'bK':['assets/img/pieces/bK.svg','assets/img/pieces/bKing.svg'],
    'bQ':['assets/img/pieces/bQ.svg','assets/img/pieces/bQueen.svg'],
    'bR':['assets/img/pieces/bR.svg','assets/img/pieces/bRook.svg'],
    'bB':['assets/img/pieces/bB.svg','assets/img/pieces/bBishop.svg'],
    'bN':['assets/img/pieces/bN.svg','assets/img/pieces/bKnight.svg'],
    'bP':['assets/img/pieces/bP.svg','assets/img/pieces/bPawn.svg']
};

const pieceImgResolved = {};

function loadImage(url){ 
    return new Promise((resolve,reject)=>{ 
        var img=new Image(); 
        img.onload=function(){resolve(url)}; 
        img.onerror=function(){reject(url)}; 
        img.src=url; 
    }); 
}

async function resolveAllPieces(){
    if (Object.keys(pieceImgResolved).length > 0) return pieceImgResolved;
    
    const keys = Object.keys(pieceCandidates);
    for (let i=0; i<keys.length; i++){
        const k = keys[i];
        for (let j=0; j<pieceCandidates[k].length; j++){
            try {
                const url = pieceCandidates[k][j];
                await loadImage(url);
                pieceImgResolved[k] = url;
                break; 
            } catch(e){}
        }
    }
    // ফলব্যাক
    let defaultAny = null;
    for (let k in pieceImgResolved) { defaultAny = pieceImgResolved[k]; break; }
    for (let k in pieceCandidates) { if (!pieceImgResolved[k]) pieceImgResolved[k] = defaultAny; }
    
    return pieceImgResolved;
}

class BoardComponent {
    constructor(boardId, onMoveCallback, onStatusUpdate) {
        this.boardId = boardId;
        this.onMoveCallback = onMoveCallback;
        this.onStatusUpdate = onStatusUpdate;
        this.game = new Chess();
        this.board = null;
        this.isLocked = false; 

        this.init();
    }

    async init() {
        // পিস লোড না হওয়া পর্যন্ত অপেক্ষা
        await resolveAllPieces();

        const config = {
            draggable: true,
            position: 'start',
            moveSpeed: 200,
            
            // আপনার দেওয়া লজিক অনুযায়ী পিস থিম
            pieceTheme: function(piece) {
                return pieceImgResolved[piece] || 'assets/img/pieces/wP.svg';
            },

            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this)
        };

        this.board = Chessboard(this.boardId, config);
        this.updateStatus();
    }
    
    onDragStart (source, piece) {
        if (this.isLocked || this.game.game_over()) return false;
        
        // শুধু নিজের গুটি ধরা যাবে
        if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    }

    onDrop (source, target) {
        var move = this.game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (move === null) {
            this.playSound('incorrect');
            return 'snapback';
        }
        
        this.playSound(move);
        this.updateStatus();
        this.highlightLastMove(move.from, move.to);
        
        if (this.onMoveCallback) {
            this.onMoveCallback(move); 
        }
    }

    onSnapEnd () {
        this.board.position(this.game.fen());
    }

    makeMove(moveSAN) {
        var move = this.game.move(moveSAN);
        if (move) {
            this.board.position(this.game.fen());
            this.playSound(move);
            this.updateStatus();
            this.highlightLastMove(move.from, move.to);
            return move;
        }
        return null;
    }

    undoMove() {
        this.game.undo();
        this.board.position(this.game.fen());
        this.updateStatus();
    }

    reset() {
        this.game.reset();
        this.board.start();
        this.updateStatus();
        this.isLocked = false;
    }
    
    flip() {
        this.board.flip();
    }
    
    // HTML Audio Tag ব্যবহার করে সাউন্ড প্লে (আপনার কোড অনুযায়ী)
    playSound(moveOrType) {
        let id = 'moveSound';
        
        if (typeof moveOrType === 'string') {
            if(moveOrType === 'incorrect') id = 'incorrectMoveSound';
        } else if (typeof moveOrType === 'object') {
            if (this.game.in_checkmate()) id = 'checkmateSound';
            else if (this.game.in_check()) id = 'checkSound';
            else if (moveOrType.flags.includes('c') || moveOrType.flags.includes('e')) id = 'captureSound'; // capture/en-passant
            else if (moveOrType.flags.includes('k') || moveOrType.flags.includes('q')) id = 'castlingSound';
            else if (moveOrType.flags.includes('p')) id = 'promoteSound';
        }
        
        const el = document.getElementById(id);
        if (el) {
            el.currentTime = 0;
            el.play().catch(e => console.log("Audio play blocked:", e));
        }
    }
    
    highlightLastMove(source, target) {
        $(`#${this.boardId} .square-55d63`).removeClass('highlight-square');
        $(`#${this.boardId} .square-${source}`).addClass('highlight-square');
        $(`#${this.boardId} .square-${target}`).addClass('highlight-square');
    }

    updateStatus () {
        let status = '';
        let moveColor = this.game.turn() === 'w' ? 'White' : 'Black';

        if (this.game.in_checkmate()) {
            status = 'Game over, ' + moveColor + ' is checkmated.';
        } else if (this.game.in_draw()) {
            status = 'Game over, drawn.';
        } else {
            status = moveColor + ' to move';
        }
        
        this.onStatusUpdate(status, this.game.pgn());
    }

    getFEN() {
        return this.game.fen();
    }
    
    getGame() {
        return this.game;
    }
}

window.BoardComponent = BoardComponent;
