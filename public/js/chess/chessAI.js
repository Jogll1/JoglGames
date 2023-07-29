function randomMove(_board, _colour) {
    console.log(evaluateBoard(_board));
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
        return 'game over';
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
            value += getPieceValue(_board[r][c]) * parseInt((_board[r][c].includes('w')) ? 1 : -1);
        }
    }
    return value;
}