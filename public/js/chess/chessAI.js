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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
            value += getPieceValue(_board[r][c]) * parseInt((_board[r][c].includes('w')) ? 1 : -1);
        }
    }
    return value;
}

//function to calculate best move based on value of the board
function getBestMove(_board, _colour) {
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
    let bestValue = 0;
    let bestMove = {};
    if(pieces.length > 0) {
        for (let i = 0; i < pieces.length; i++) {
            for (let j = 0; j < myMoves[pieces[i]].length; j++) {
                console.log(`${pieces[i]} : ${myMoves[pieces[i]][j]}`);

                let boardCopy = copy2DArray(_board);
                const move = myMoves[pieces[i]][j];
                boardCopy = performMove(boardCopy, _colour, pieces[i], move.split('-')[0], move.split('-')[1]);

                const value = parseInt(evaluateBoard(boardCopy));
                console.log(`value if play: ${value}`);

                //if bestMove empty
                const bestMoveKeys = Object.keys(bestMove);
                //change best move if best moves is empty, the new value is better than the old, or randomely change if they are equal
                if (bestMoveKeys.length === 0 || Math.abs(bestValue) < Math.abs(value) || (Math.abs(bestValue) === Math.abs(value) && getRandomInt(0, 1) === 0)) {
                    bestValue = value;
                    delete bestMove[bestMoveKeys[0]];
                    bestMove[pieces[i]] = move;
                    console.log(`new best value: ${value}`);
                }
            }
        }

        const bestMoveKeys = Object.keys(bestMove);
        console.log(`best move: ${bestMoveKeys[0]} => SQ${bestMove[bestMoveKeys[0]]}`)
        return {pieceToMoveId: constructPieceId(bestMoveKeys[0]), tileToMoveToId: `SQ${bestMove[bestMoveKeys[0]]}`};
    }
    else {
        return "game over";
    }
}

//function to test a move
function performMove(_board, _ourColour, _pieceId, _endRow, _endCol) {
    const index = findIndex2DArray(_board, _pieceId);
    let newBoard = _board;

    newBoard[index.row][index.column] = " ";
    newBoard[_endRow][_endCol] = _pieceId;

    return newBoard;
}