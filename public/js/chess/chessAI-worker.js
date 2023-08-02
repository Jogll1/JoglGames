import { Chess } from 'chess.js'

//to bundle with chess.js so this works use npx rollup -c

//this script is ran in the background by a web worker
const ROWS = 8;
const COLUMNS = 8;

//#region old/needs-reworking code
//#region Minimax
//minimax function to get ai's best move
function minimax1(_board, _colour, _depth, _alpha, _beta, _maximisingPlayer) {
    if(_depth == 0) {
        return {eval: evaluateBoard(_board), bestMove: null};
    }

    //get a dictionary of all legal moves this player can make
    const myMoves = getAllLegalMoves(_board, _colour);
    const pieces = Object.keys(myMoves);

    //if game over
    if(pieces == 0) {
        //if checkmate
        if(inCheck(_board, _colour)) {
            return {eval: Number.NEGATIVE_INFINITY, bestMove: null};
        }

        //if draw
        return {eval: 0, bestMove: null};
    }

    if(_maximisingPlayer) {
        let maxEval = Number.NEGATIVE_INFINITY;
        let bestMove = {};

        for (let i = 0; i < pieces.length; i++) {
            for (let j = 0; j < myMoves[pieces[i]].length; j++) {
                //copy board
                let boardCopy = copy2DArray(_board);

                //perform move
                const move = myMoves[pieces[i]][j];
                const moveBoard = performMove(boardCopy, movedPieces, _colour, pieces[i], move.split('-')[0], move.split('-')[1]);

                const newEval = minimax1(moveBoard, _colour == "White" ? "Black" : "White", _depth - 1, _alpha, _beta, false).eval;

                if(newEval > maxEval || newEval == maxEval && Math.random > 0.5) {
                    maxEval = newEval;

                    delete bestMove[Object.keys(bestMove)[0]];
                    bestMove[pieces[i]] = myMoves[pieces[i]][j];
                }

                //set alpha to bigger of alpha and eval
                _alpha = Math.max(_alpha, newEval);

                //beta cutoff
                if(_beta <= _alpha) break;
            }
        }

        console.log(bestMove);
        return {eval: maxEval, bestMove: bestMove};
    }
    else {
        let minEval = Number.POSITIVE_INFINITY;
        let bestMove = {};

        for (let i = 0; i < pieces.length; i++) {
            for (let j = 0; j < myMoves[pieces[i]].length; j++) {
                //copy board
                let boardCopy = copy2DArray(_board);

                //perform move
                const move = myMoves[pieces[i]][j];
                const moveBoard = performMove(boardCopy, movedPieces, _colour, pieces[i], move.split('-')[0], move.split('-')[1]);

                const newEval = minimax1(moveBoard, _colour == "White" ? "Black" : "White", _depth - 1, _alpha, _beta, true).eval;

                if(newEval < minEval || newEval == maxEval && Math.random > 0.5) {
                    maxEval = newEval;

                    delete bestMove[Object.keys(bestMove)[0]];
                    bestMove[pieces[i]] = myMoves[pieces[i]][j];
                }

                //set alpha to bigger of alpha and eval
                _beta = Math.min(_beta, newEval);

                //alpha cutoff
                if(_beta <= _alpha) break;
            }
        }

        console.log(bestMove);
        return {eval: minEval, bestMove: bestMove};
    }
}

//function to get the value of the board
function evaluateBoard(_board) {
    let value = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            if(_board[r][c] != ' ') {
                value += getPieceValue(_board[r][c]) * parseInt((_board[r][c].includes('w')) ? 1 : -1);
            }
        }
    }
    
    return value;
}

//function to generate the best move from minimax
function getBestMove(_board, _colour) {
    const values = minimax1(_board, _colour, 3, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true).bestMove;
    if(values != null) {
        const keys = Object.keys(values);

        console.log(`values: ${keys[0]} => ${values[keys[0]]}`);

        return {pieceToMoveId: constructPieceId(keys[0]), tileToMoveToId: `SQ${values[keys[0]]}`};
    }
    else {
        return "game over";
    }
}
//#endregion

//#region AI Utility functions
//function to turn piece id in format wp4 to WhitePawn4
function constructPieceId(_pieceId) {
    const colour = _pieceId[0] == 'w' ? "White" : "Black";
    const num = _pieceId[2];
    let pieceId = "";
    if(_pieceId[1] == 'p') {
        pieceId = `${colour}Pawn${num}`;
    }
    else if(_pieceId[1] == 'N') {
        pieceId = `${colour}Knight${num}`;
    }
    else if(_pieceId[1] == 'R') {
        pieceId = `${colour}Rook${num}`;
    }
    else if(_pieceId[1] == 'B') {
        pieceId = `${colour}Bishop${num}`;
    }
    else if(_pieceId[1] == 'Q') {
        pieceId = `${colour}Queen${num}`;
    }
    else if(_pieceId[1] == 'K') {
        pieceId = `${colour}King${num}`;
    }

    return pieceId;
}

//function to get the value of a piece on the board
function getPieceValue(_pieceId) {
    //takes a pieceId in format 'wp4'
    switch (_pieceId[1]) {
        case 'p':
            return 10;
        case 'N':
            return 30;
        case 'B':
            return 30;
        case 'R':
            return 50;
        case 'Q':
            return 90;
        case 'K':
            return 900;
        default:
            return 0;
    }
}
//#endregion

//#region Other utility functions
function getRandomInt(_min, _max) {
    return Math.floor(Math.random() * (_max - _min + 1)) + _min;
}

//function to generate a copy of a 2d array
function copy2DArray(originalArray) {
    const numRows = originalArray.length;
    const numCols = originalArray[0].length;
  
    const copiedArray = new Array(numRows);
    for (let i = 0; i < numRows; i++) {
        copiedArray[i] = new Array(numCols);
    }
  
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            copiedArray[i][j] = originalArray[i][j];
        }
    }
  
    return copiedArray;
}
//#endregion
//#endregion

//#region chess utilities
//function to convert my way of storing chess moves to a fen string
function convertMyChessArrayToFEN(_board, _toMove, _castleBools, _epTargetSq, _halfMoveClock, _fullmoveNo) {
    //castle bools is an array like [kingsideW, queensideW, kingsideB, queensideB]
    //_epTargeSq is the square a pawn has just doubled moved over
    let fenString = '';
    const toMove = _toMove == "White" ? 'w' : 'b';

    //ranks
    let gapCounter = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            if (_board[r][c] == ' ') {
                gapCounter += 1;
            }
            else {
                if (gapCounter > 0) fenString = fenString.concat(gapCounter);
                gapCounter = 0;
                let toAppend = gapCounter;
                if (_board[r][c].includes('w')) {
                    toAppend = _board[r][c][1].toUpperCase();
                }
                else if (_board[r][c].includes('b')) {
                    toAppend = _board[r][c][1].toLowerCase();
                }
                fenString = fenString.concat(toAppend);
            }
        }
        if (gapCounter > 0) fenString = fenString.concat(gapCounter);
        fenString = (r < 7) ? fenString.concat('/') : fenString.concat(' ');
        gapCounter = 0;
    }

    //castling string
    let castlingString = '';
    const castlingChars = ['K', 'Q', 'k', 'q'];
    if(_castleBools.length > 0) {
        for(let i = 0; i < _castleBools.length; i++) {
            if(_castleBools[i]) {
                castlingString = castlingString.concat(castlingChars[i]);
            }
        }

        //if castling string still empty
        if(castlingString == '') {
            castlingString = '-';
        }
    }

    fenString = fenString.concat(`${toMove} ${castlingString} ${_epTargetSq} ${_halfMoveClock} ${_fullmoveNo}`);
    return fenString;
}
//#endregion

function chessJsTest() {
    const chess = new Chess();

    //possible solution
    //convert my game state into a fen then use it with this library?

    //import starting fen
    chess.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    const board = chess.board();

    return chess.pgn();
}

//#region -----------Web Worker stuff-----------
self.addEventListener('message', function(event) {
    console.log("yo");
    const board = event.data._board;
    const depth = event.data._depth;
    const colour = event.data._colour;
    const movedPieces = event.data._movedPieces;

    // const bestMove = getBestMove(board, movedPieces, colour, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true).bestMove;

    const msg = `msg: ${chessJsTest()}`;
    setTimeout(this.self.postMessage(msg), 2000); //supposed to speed it up by sending bestmove
})
//#endregion