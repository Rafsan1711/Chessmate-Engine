// পিস লোডার কনফিগ
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
    // Fallback logic
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

        // সাউন্ড এলিমেন্ট
        this.sounds = {
            move: document.getElementById('moveSound'),
            capture: document.getElementById('captureSound'),
            check: document.getElementById('checkSound'),
            checkmate: document.getElementById('checkmateSound'),
            castling: document.getElementById('castlingSound'),
            promote: document.getElementById('promoteSound'),
            incorrect: document.getElementById('incorrectMoveSound')
        };

        this.init();
    }

    async init() {
        await resolveAllPieces();

        const config = {
            draggable: true,
            position: 'start',
            moveSpeed: 200,
            pieceTheme: function(piece) {
                return pieceImgResolved[piece] || 'assets/img/pieces/wP.svg';
            },
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this)
        };

        this.board = Chessboard(this.boardId, config);
        this.updateStatus();

        // Responsive Resize (FIXED)
        window.addEventListener('resize', () => {
            if (this.board) this.board.resize();
        });
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
        const move = this.game.undo();
        if (move) {
            this.board.position(this.game.fen());
            this.updateStatus();
            return true;
        }
        return false;
    }

    reset() {
        this.game.reset();
        this.board.start();
        this.updateStatus();
        this.isLocked = false;
        this.clearHighlights();
    }
    
    flip() {
        this.board.flip();
    }
    
    playSound(moveOrType) {
        let type = 'move';
        
        if (typeof moveOrType === 'string') {
            type = moveOrType;
        } else if (typeof moveOrType === 'object') {
            if (this.game.in_checkmate()) type = 'checkmate';
            else if (this.game.in_check()) type = 'check';
            else if (moveOrType.flags.includes('c') || moveOrType.flags.includes('e')) type = 'capture';
            else if (moveOrType.flags.includes('k') || moveOrType.flags.includes('q')) type = 'castling';
            else if (moveOrType.flags.includes('p')) type = 'promote';
        }
        
        const audio = this.sounds[type] || this.sounds['move'];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }
    
    highlightLastMove(source, target) {
        this.clearHighlights();
        $(`#${this.boardId} .square-${source}`).addClass('highlight-square');
        $(`#${this.boardId} .square-${target}`).addClass('highlight-square');
        if (this.game.in_check()) {
             $(`#${this.boardId} .square-55d63`).addClass('in-check');
        }
    }
    
    clearHighlights() {
        $(`#${this.boardId} .square-55d63`).removeClass('highlight-square in-check');
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
            if (this.game.in_check()) {
                status += ', in Check!';
            }
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
