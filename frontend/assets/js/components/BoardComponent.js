// File Path: frontend/assets/js/components/BoardComponent.js

// --- পিস রেজোলভার লজিক (আপনার টেমপ্লেট থেকে) ---
const pieceCandidates = {
    'wK':['assets/img/pieces/wK.svg','assets/img/pieces/wKing.svg','assets/img/pieces/WK.svg'],
    'wQ':['assets/img/pieces/wQ.svg','assets/img/pieces/wQueen.svg','assets/img/pieces/WQ.svg'],
    'wR':['assets/img/pieces/wR.svg','assets/img/pieces/wRook.svg','assets/img/pieces/WR.svg'],
    'wB':['assets/img/pieces/wB.svg','assets/img/pieces/wBishop.svg','assets/img/pieces/WB.svg'],
    'wN':['assets/img/pieces/wN.svg','assets/img/pieces/wKnight.svg','assets/img/pieces/WN.svg'],
    'wP':['assets/img/pieces/wP.svg','assets/img/pieces/wPawn.svg','assets/img/pieces/WP.svg'],
    'bK':['assets/img/pieces/bK.svg','assets/img/pieces/bKing.svg','assets/img/pieces/BK.svg'],
    'bQ':['assets/img/pieces/bQ.svg','assets/img/pieces/bQueen.svg','assets/img/pieces/BQ.svg'],
    'bR':['assets/img/pieces/bR.svg','assets/img/pieces/bRook.svg','assets/img/pieces/BR.svg'],
    'bB':['assets/img/pieces/bB.svg','assets/img/pieces/bBishop.svg','assets/img/pieces/BB.svg'],
    'bN':['assets/img/pieces/bN.svg','assets/img/pieces/bKnight.svg','assets/img/pieces/BN.svg'],
    'bP':['assets/img/pieces/bP.svg','assets/img/pieces/bPawn.svg','assets/img/pieces/BP.svg']
};
const pieceImgResolved = {};

function loadImage(url){ 
    return new Promise((resolve,reject)=>{ 
        var img=new Image(); 
        img.onload=function(){resolve(url)}; 
        img.onerror=function(){reject(url)}; 
        // ক্যাশ ফিক্স: query string যোগ করা হলো
        img.src=url + "?v=" + new Date().getTime(); 
    }); 
}

async function resolveAllPieces(){
    if (Object.keys(pieceImgResolved).length > 0) return pieceImgResolved;
    
    for (const key of Object.keys(pieceCandidates)){
      for (const candidate of pieceCandidates[key]){
          try{ 
              const ok = await loadImage(candidate); 
              pieceImgResolved[key] = ok;
              break; 
          } catch(e){
              // ট্রাই পরের ক্যান্ডিডেট
          }
      }
    }
    
    // Fallback: যদি কোনো পিস না লোড হয়, অন্য একটা পিস দিয়ে রিপ্লেস করা
    let defaultAny=null; 
    for (const k in pieceImgResolved) if (pieceImgResolved[k]) { defaultAny = pieceImgResolved[k]; break; }
    for (const k2 in pieceImgResolved) if (!pieceImgResolved[k2]) pieceImgResolved[k2] = defaultAny;
    
    return pieceImgResolved;
}

// --- কম্পোনেন্ট ক্লাস ---

class BoardComponent {
    constructor(boardId, onMoveCallback, onStatusUpdate) {
        this.boardId = boardId;
        this.onMoveCallback = onMoveCallback;
        this.onStatusUpdate = onStatusUpdate;
        this.game = new Chess();
        this.board = null;
        this.isReady = false;
        
        // --- সাউন্ড রেফারেন্স ---
        // index.html এ দেওয়া IDs ব্যবহার করা হলো
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
        // পিস লোডার ইনিট
        await resolveAllPieces();
        
        const self = this;
        var config = {
            draggable: true,
            position: 'start',
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this),
            // কাস্টম pieceTheme ফাংশন
            pieceTheme: function(piece) {
                return pieceImgResolved[piece] || 'assets/img/pieces/wK.svg'; // ফলব্যাক
            }
        };

        this.board = Chessboard(this.boardId, config);
        this.updateStatus();
        this.isReady = true;
    }
    
    onDragStart (source, piece) {
      if (!this.isReady || this.game.game_over()) return false;
      //... (বাকি লজিক)
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
            if (this.onMoveCallback) {
                this.onMoveCallback(move);
            }
            return move;
        }
        return null;
    }

    undoMove() {
        const move = this.game.undo();
        if (move) {
            this.board.position(this.game.fen());
            this.clearHighlights();
            this.updateStatus();
        }
        return move;
    }

    reset() {
        this.game.reset();
        this.board.start();
        this.clearHighlights();
        this.updateStatus();
    }
    
    flip() {
        this.board.flip();
    }
    
    // --- সাউন্ড ফাংশন (আপনার টেমপ্লেটের মতো) ---
    playSound(moveOrType) {
        let type = moveOrType;
        if (typeof moveOrType === 'object') {
            if (this.game.in_checkmate()) type = 'checkmate';
            else if (this.game.in_check()) type = 'check';
            else if (moveOrType.flags.includes('k') || moveOrType.flags.includes('q')) type = 'castling';
            else if (moveOrType.flags.includes('p')) type = 'promote';
            else if (moveOrType.captured) type = 'capture';
            else type = 'move';
        }
        
        const el = this.sounds[type];
        if (el) { el.currentTime = 0; el.play().catch(()=>{}); }
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
        // FEN Fix: Only return first 4 parts for API consistency
        return this.game.fen().split(' ').slice(0, 4).join(' ');
    }
    
    getGame() {
        return this.game;
    }
}

window.BoardComponent = BoardComponent;
