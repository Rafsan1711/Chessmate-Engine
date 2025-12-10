class BoardComponent {
    constructor(boardId, onMoveCallback, onStatusUpdate) {
        this.boardId = boardId;
        this.onMoveCallback = onMoveCallback;
        this.onStatusUpdate = onStatusUpdate;
        this.game = new Chess();
        this.board = null;
        
        // সাউন্ড ফাইল পাথ (সরাসরি)
        this.sounds = {
            move: new Audio('assets/audio/move.mp3'),
            capture: new Audio('assets/audio/capture.mp3'),
            check: new Audio('assets/audio/check.mp3'),
            checkmate: new Audio('assets/audio/checkmate.mp3'),
            castling: new Audio('assets/audio/castling.mp3'),
            promote: new Audio('assets/audio/promote.mp3'),
            incorrect: new Audio('assets/audio/incorrect-move.mp3')
        };

        this.init();
    }

    init() {
        // কনফিগারেশন
        var config = {
            draggable: true,
            position: 'start',
            moveSpeed: 200,
            snapbackSpeed: 50,
            snapSpeed: 100,
            
            // পিস থিম: সরাসরি পাথ (assets ফোল্ডার index.html এর সাপেক্ষে)
            pieceTheme: 'assets/img/pieces/{piece}.svg',

            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this)
        };

        this.board = Chessboard(this.boardId, config);
        this.updateStatus();
        
        // CSS Transition Fix
        setTimeout(() => { 
            $('#' + this.boardId + ' .chessboard-js-piece').css('transition','top 0.2s, left 0.2s'); 
        }, 1000);
    }
    
    onDragStart (source, piece) {
        if (this.game.game_over()) return false;
        // সাদা প্লেয়ার সাদার চাল দিবে, কালো প্লেয়ার কালোর
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
            return move; // মুভ রিটার্ন করা জরুরি
        }
        return null;
    }

    undoMove() {
        const move = this.game.undo();
        if (move) {
            this.board.position(this.game.fen());
            this.clearHighlights();
            this.updateStatus();
            return true;
        }
        return false;
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
    
    playSound(moveOrType) {
        let type = 'move';
        if (typeof moveOrType === 'string') {
            type = moveOrType;
        } else if (typeof moveOrType === 'object') {
            if (this.game.in_checkmate()) type = 'checkmate';
            else if (this.game.in_check()) type = 'check';
            else if (moveOrType.flags.includes('k') || moveOrType.flags.includes('q')) type = 'castling';
            else if (moveOrType.flags.includes('p')) type = 'promote';
            else if (moveOrType.captured) type = 'capture';
        }
        
        const audio = this.sounds[type];
        if (audio) {
            audio.currentTime = 0;
            // সাউন্ড লোড না হলে যেন এরর না দেয়
            audio.play().catch(e => console.warn("Audio missing or blocked:", type));
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
