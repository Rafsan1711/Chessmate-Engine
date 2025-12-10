// File: frontend/assets/js/components/BoardComponent.js

// --- ১. আপনার Example Code থেকে নেওয়া পিস এবং সাউন্ড লজিক ---
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

// ইমেজ লোডার প্রমিস
function loadImage(url){ 
    return new Promise((resolve,reject)=>{ 
        var img=new Image(); 
        img.onload=function(){resolve(url)}; 
        img.onerror=function(){reject(url)}; 
        img.src=url; 
    }); 
}

// সব পিস রিজলভ করা
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
                break; // একটা পেলে লুপ ব্রেক
            } catch(e){}
        }
    }
    // ফলব্যাক: যদি কিছু মিসিং থাকে
    let defaultAny = null;
    for (let k in pieceImgResolved) { defaultAny = pieceImgResolved[k]; break; }
    for (let k in pieceCandidates) { if (!pieceImgResolved[k]) pieceImgResolved[k] = defaultAny; }
    
    return pieceImgResolved;
}

// --- ২. মেইন ক্লাস ---
class BoardComponent {
    constructor(boardId, onMoveCallback, onStatusUpdate) {
        this.boardId = boardId;
        this.onMoveCallback = onMoveCallback;
        this.onStatusUpdate = onStatusUpdate;
        
        this.game = new Chess();
        this.board = null;
        this.inputLocked = false; // ইউজার ইনপুট লক করার জন্য

        // সাউন্ড এলিমেন্ট (index.html থেকে)
        this.sounds = {
            move: document.getElementById('moveSound'),
            capture: document.getElementById('captureSound'),
            check: document.getElementById('checkSound'),
            checkmate: document.getElementById('checkmateSound'),
            incorrect: document.getElementById('incorrectMoveSound')
        };

        this.init();
    }

    async init() {
        // আগে পিসগুলো লোড হবে, তারপর বোর্ড আসবে (Sync issue fix)
        await resolveAllPieces();

        const config = {
            draggable: true,
            position: 'start',
            moveSpeed: 200,
            snapbackSpeed: 50,
            snapSpeed: 100,
            
            // আপনার কোডের pieceTheme লজিক
            pieceTheme: function(piece) {
                return pieceImgResolved[piece];
            },

            // আপনার কোডের onDragStart (Black move preventer)
            onDragStart: (source, piece) => {
                if (this.inputLocked) return false;
                if (this.game.game_over()) return false;
                
                // সাদা প্লেয়ার শুধু সাদা গুটি ধরবে, কালো প্লেয়ার কালো গুটি
                if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
                    (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
                    return false;
                }
                return true;
            },

            onDrop: (source, target) => {
                if (this.inputLocked) return 'snapback';
                
                // মুভ ভ্যালিডেশন
                const move = this.game.move({
                    from: source,
                    to: target,
                    promotion: 'q'
                });

                // অবৈধ মুভ
                if (move === null) {
                    this.playSound('incorrect');
                    return 'snapback';
                }

                // বৈধ মুভ
                this.playSound(move);
                this.updateStatus();
                
                // কলব্যাক পাঠানো (Stats আপডেট করার জন্য)
                if (this.onMoveCallback) {
                    this.onMoveCallback(move);
                }
            },

            onSnapEnd: () => {
                this.board.position(this.game.fen());
            }
        };

        // বোর্ড তৈরি
        this.board = Chessboard(this.boardId, config);
        this.updateStatus();
        
        // CSS Transition fix (from your code)
        setTimeout(() => { 
            $('#' + this.boardId + ' .chessboard-js-piece').css('transition','top 0.25s, left 0.25s'); 
        }, 1000);
    }

    // --- মেথড ---

    makeMove(moveSAN) {
        const move = this.game.move(moveSAN);
        if (move) {
            this.board.position(this.game.fen());
            this.playSound(move);
            this.updateStatus();
            
            if (this.onMoveCallback) {
                // এটি লুপ এড়ানোর জন্য, যদি অটো মুভ হয় তবে কলব্যাক অফ রাখা যেতে পারে
                // কিন্তু এখানে আমরা এক্সপ্লোরার আপডেটের জন্য ডাকছি
                this.onMoveCallback(move);
            }
        }
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
        this.inputLocked = false;
    }

    flip() {
        this.board.flip();
    }

    getFEN() {
        return this.game.fen();
    }
    
    getGame() {
        return this.game;
    }

    // --- হেল্পার ---

    playSound(moveOrType) {
        let type = 'move';
        if (typeof moveOrType === 'string') {
            type = moveOrType;
        } else if (typeof moveOrType === 'object') {
            if (this.game.in_checkmate()) type = 'checkmate';
            else if (this.game.in_check()) type = 'check';
            else if (moveOrType.captured) type = 'capture';
        }
        
        const audio = this.sounds[type] || this.sounds['move'];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    updateStatus() {
        let status = '';
        const moveColor = this.game.turn() === 'w' ? 'White' : 'Black';

        if (this.game.in_checkmate()) {
            status = 'Game over, ' + moveColor + ' is in checkmate.';
        } else if (this.game.in_draw()) {
            status = 'Game over, drawn position';
        } else {
            status = moveColor + ' to move';
            if (this.game.in_check()) {
                status += ', ' + moveColor + ' is in check';
            }
        }
        
        // PGN এবং স্ট্যাটাস পাঠানো
        if (this.onStatusUpdate) {
            this.onStatusUpdate(status, this.game.pgn());
        }
    }
}

// উইন্ডোতে এক্সপোর্ট
window.BoardComponent = BoardComponent;
