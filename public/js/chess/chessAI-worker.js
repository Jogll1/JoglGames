//this script is ran in the background by a web worker
const ROWS = 8;
const COLUMNS = 8;

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
                const moveBoard = performMove(boardCopy, _colour, pieces[i], move.split('-')[0], move.split('-')[1]);

                const eval = minimax1(moveBoard, _colour == "White" ? "Black" : "White", _depth - 1, _alpha, _beta, false).eval;

                if(eval > maxEval || eval == maxEval && Math.random > 0.5) {
                    maxEval = eval;

                    delete bestMove[Object.keys(bestMove)[0]];
                    bestMove[pieces[i]] = myMoves[pieces[i]][j];
                }

                //set alpha to bigger of alpha and eval
                _alpha = Math.max(_alpha, eval);

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
                const moveBoard = performMove(boardCopy, _colour, pieces[i], move.split('-')[0], move.split('-')[1]);

                const eval = minimax1(moveBoard, _colour == "White" ? "Black" : "White", _depth - 1, _alpha, _beta, true).eval;

                if(eval < minEval || eval == maxEval && Math.random > 0.5) {
                    maxEval = eval;

                    delete bestMove[Object.keys(bestMove)[0]];
                    bestMove[pieces[i]] = myMoves[pieces[i]][j];
                }

                //set alpha to bigger of alpha and eval
                _beta = Math.min(_beta, eval);

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

//function to check if a king in check
function inCheck(_board, _colour) {
    const colourCheck = _colour == "White" ? 'w' : 'b';
    const kingCheck = `${colourCheck}K`;

    const underThreatTiles = getUnderThreatTiles(_board, _colour);
    return underThreatTiles.some(tile => _board[tile.split('-')[0]][tile.split('-')[1]].includes(kingCheck));
}

//function to generate a dictionary of legal moves for a colour
function getAllLegalMoves(_board, _colour) {
    const checkColour = (_colour == "White") ? 'w' : 'b';
    let myMoves = {};

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            if(_board[r][c].includes(checkColour)) {
                let pieceMoves = getValidMoves(_board, r, c, true);
                if(pieceMoves.length > 0) {
                    myMoves[_board[r][c]] = pieceMoves;
                }
            }
        }
    }

    return myMoves;
}

//function to test a move
function performMove(_board, _colour, _pieceId, _endRow, _endCol) {
    const index = findIndex2DArray(_board, _pieceId);
    let newBoard = copy2DArray(_board);

    newBoard[index.row][index.column] = " ";
    newBoard[_endRow][_endCol] = _pieceId;

    return newBoard;
}

//function to get all valid moves based on the piece type
function getValidMoves(_board, _startRow, _startCol, _runRecursively) {
    //piece id should be like wp2
    let _validMoves = [];

    

    return _validMoves;
}

//function to get a list of all tiles that are under threat
function getUnderThreatTiles(_board, _ourColour) {
    //_ourColour is for the player who is checking if their king is in check for example
    let tiles = []

    const colourCheck = (_ourColour == "White") ? 'w' : 'b';

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            if(!_board[r][c].includes(colourCheck) && _board[r][c] !== ' ') {
                tiles = tiles.concat(getValidMoves(_board, r, c, false));
            }
        }
    }

    return tiles;
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

//#region -----------Web Worker stuff-----------
self.addEventListener('message', function(event) {
    const board = event.data._board;
    const depth = event.data._depth;
    const colour = event.data._colour;

    const bestMove = getBestMove(board, colour, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true).bestMove;

    setTimeout(this.self.postMessage(bestMove), 2000); //supposed to speed it up by sending bestmove
})
//#endregion