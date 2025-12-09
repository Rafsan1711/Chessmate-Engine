class BoardComponent {
    constructor(boardId, onMoveCallback, onStatusUpdate) {
        this.boardId = boardId;
        this.onMoveCallback = onMoveCallback;
        this.onStatusUpdate = onStatusUpdate;
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
            // পিস থিম: এখানে আমরা স্থানীয় ফাইল না দিয়ে CDN ব্যবহার করছি
            pieceTheme: 'https://cdn.jsdelivr.net/npm/chessboardjs@1.0.0/img/chesspieces/wikipedia/{piece}.png'
        };

        this.board = Chessboard(this.boardId, config);
        this.updateStatus();
    }
    
    onDragStart (source, piece) {
      if (this.game.game_over()) return false;
      // শুধু খেলার পালের গুটিই ধরা যাবে (Ex: White to move, so no black piece)
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

      if (move === null) return 'snapback';
      
      this.updateStatus();
      if (this.onMoveCallback) {
          this.onMoveCallback(move); // Move হলে callback করবে
      }
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
        this.onStatusUpdate(status, this.game.pgn({ verbose: true }));
    }

    getFEN() {
        return this.game.fen();
    }
}

window.BoardComponent = BoardComponent; // গ্লোবালি এক্সপোর্ট করা
