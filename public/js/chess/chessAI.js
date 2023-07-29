function randomMove(_board, _colour) {
    const checkColour = (_colour == "White") ? 'w' : 'b';
    let myMoves = {};

    for (let r = 0; r < ch_ROWS; r++) {
        for (let c = 0; c < ch_COLUMNS; c++) {
            if(_board[r][c].includes(checkColour)) {
                let pieceMoves = getValidMoves(_board, r, c, true);
                if(pieceMoves.length > 0) {
                    myMoves[_board[r][c]] = pieceMoves;
                }
            }
        }
    }

    const pieces = Object.keys(myMoves);
    if(pieces.length > 0) {
        const ran = getRandomInt(0, pieces.length - 1);
        const ranPieceId = pieces[ran];
        const ranTileId = myMoves[pieces[ran]][getRandomInt(0, myMoves[ranPieceId].length - 1)];
    
        return {pieceToMoveId: constructPieceId(ranPieceId), tileToMoveToId: `SQ${ranTileId}`};
    }
    else {
        return "game over";
    }
}

function getRandomInt(_min, _max) {
    return Math.floor(Math.random() * (_max - _min + 1)) + _min;
}

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

//function to get the value of the board
function evaluateBoard(_board) {
    let value = 0;
    for (let r = 0; r < ch_ROWS; r++) {
        for (let c = 0; c < ch_COLUMNS; c++) {
            if(_board[r][c] != ' ') {
                value += getPieceValue(_board[r][c]) * parseInt((_board[r][c].includes('w')) ? 1 : -1);
            }
        }
    }
    return value;
}

//function to generate a dictionary of legal moves for a colour
function getAllLegalMoves(_board, _colour) {
    const checkColour = (_colour == "White") ? 'w' : 'b';
    let myMoves = {};

    for (let r = 0; r < ch_ROWS; r++) {
        for (let c = 0; c < ch_COLUMNS; c++) {
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

//minimax function to get ai's best move
function minimax1(_board, _colour, _depth, _alpha, _beta) {
    if(depth == 0) {
        return evaluateBoard(_board);
    }

    //get a dictionary of all legal moves this player can make
    const myMoves = getAllLegalMoves(_board, _colour);
    const pieces = Object.keys(myMoves);

    //if game over
    if(pieces == 0) {
        //if checkmate
        if(inCheck) {
            return -Infinity;
        }

        //if draw
        return 0;
    }

    for (let i = 0; i < pieces.length; i++) {
        const coords = myMoves[pieces[i]].split('-');
        const boardCopy = copy2DArray(_board);
        const moveBoard = performMove(boardCopy, _colour, pieces[i], coords[0], coords[1]);

        const eval = minimax1(moveBoard, _colour == "White" ? "Black" : "White", _depth - 1, _alpha, _beta);

        if(eval >= _beta) {
            //prune branch
            return _beta;
        }

        _alpha = Math.max(_alpha, eval);
    }

    return _alpha;
}

//function to test a move
function performMove(_board, _colour, _pieceId, _endRow, _endCol) {
    const index = findIndex2DArray(_board, _pieceId);
    let newBoard = _board;

    newBoard[index.row][index.column] = " ";
    newBoard[_endRow][_endCol] = _pieceId;

    return newBoard;
}

//function to check if a king in check
function inCheck(_board, _colour) {
    const colourCheck = _colour == "White" ? 'w' : 'b';
    const kingCheck = `${colourCheck}K`;

    const underThreatTiles = getUnderThreatTiles(_board, _colour);
    return underThreatTiles.some(tile => _board[tile.split('-')[0]][tile.split('-')[1]].includes(kingCheck));
}