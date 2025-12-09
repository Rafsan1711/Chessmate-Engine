class BoardComponent {
    constructor(boardId, onMoveCallback, onStatusUpdate) {
        this.boardId = boardId;
        this.onMoveCallback = onMoveCallback;
        this.onStatusUpdate = onStatusUpdate;
        // Game instance গ্লোবালি অ্যাক্সেস করার জন্য
        this.game = new Chess(); 
        this.board = null;
        this.init();
    }

    init() {
        var config = {
            draggable: true,
            position: 'start',
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this),
            // CDN থেকে পিস লোড করার জন্য Wikipedia Theme ব্যবহার
            pieceTheme: 'https://cdn.jsdelivr.net/npm/chessboardjs@1.0.0/img/chesspieces/wikipedia/{piece}.png'
        };

        this.board = Chessboard(this.boardId, config);
        this.updateStatus();
    }
    
    onDragStart (source, piece) {
      if (this.game.game_over()) return false;
      if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
      }
    }

    onDrop (source, target) {
      // চালটি বৈধ কিনা চেক করা
      var move = this.game.move({
        from: source,
        to: target,
        promotion: 'q' // Simplification
      });

      // **CRITICAL FIX:** অবৈধ চাল হলে 'snapback' রিটার্ন করলে Move Logic বন্ধ হবে
      if (move === null) {
          return 'snapback'; 
      }
      
      this.updateStatus();
      if (this.onMoveCallback) {
          this.onMoveCallback(move); 
      }
      // **CRITICAL FIX:** বৈধ চাল হলে কোনো কিছু রিটার্ন না করলে move হয়ে যায়
    }

    onSnapEnd () {
      this.board.position(this.game.fen());
    }
    
    makeMove(moveSAN) {
        var move = this.game.move(moveSAN);
        if (move) {
            this.board.position(this.game.fen());
            this.updateStatus();
            if (this.onMoveCallback) {
                this.onMoveCallback(move);
            }
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
    }
    
    flip() {
        this.board.flip();
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
        
        // **CRITICAL FIX:** game.pgn() স্ট্রিং রিটার্ন করে, তাই সরাসরি পাঠানো হলো
        this.onStatusUpdate(status, this.game.pgn());
    }

    getFEN() {
        return this.game.fen();
    }
}

window.BoardComponent = BoardComponent;
