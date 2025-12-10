// File Path: frontend/assets/js/components/BoardComponent.js

class BoardComponent {
    constructor(boardId, onMoveCallback, onStatusUpdate) {
        this.boardId = boardId;
        this.onMoveCallback = onMoveCallback;
        this.onStatusUpdate = onStatusUpdate;
        this.game = new Chess();
        this.board = null;
        
        // --- সাউন্ড সেটআপ ---
        this.sounds = {
            move: new Audio('assets/audio/move.mp3'),
            capture: new Audio('assets/audio/capture.mp3'),
            check: new Audio('assets/audio/check.mp3')
        };
        this.init();
    }

    init() {
        var config = {
            draggable: true,
            position: 'start',
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this),
            // --- লোকাল পিস ইমেজ পাথ ফাইনাল ফিক্স ---
            pieceTheme: 'assets/img/pieces/{piece}.svg' 
        };

        this.board = Chessboard(this.boardId, config);
        this.updateStatus();
    }
    
    // ... (onDragStart, onDrop, onSnapEnd, makeMove, undoMove, reset, flip অপরিবর্তিত) ...
    onDragStart (source, piece) {
      if (this.game.game_over()) return false;
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
        this.game.undo();
        this.board.position(this.game.fen());
        this.clearHighlights();
        this.updateStatus();
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
    
    // --- হেল্পার ফাংশন ---
    
    playSound(move) {
        this.sounds.check.currentTime = 0;
        this.sounds.capture.currentTime = 0;
        this.sounds.move.currentTime = 0;
        
        if (this.game.in_check()) {
            this.sounds.check.play();
        } else if (move.captured) {
            this.sounds.capture.play();
        } else {
            this.sounds.move.play();
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
