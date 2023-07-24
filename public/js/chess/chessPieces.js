//move patterns
const Pattern = function(board, isWhite, startRow, startCol, runRecursively) {
    startRow = parseInt(startRow);
    startCol = parseInt(startCol);

    const ourColour = (board[startRow][startCol].includes('w')) ? "White" : "Black";

    //get under threat tiles
    let underThreatTiles = [];
    if(runRecursively) {
        underThreatTiles = getUnderThreatTiles(board, ourColour);
    }

    let kingUnderThreat = underThreatTiles.some(tile => board[tile.split('-')[0]][tile.split('-')[1]].includes('K'));

    //need to add
    //check
    //stalemate
    //checkmate

    this.getValidPawnMoves = function(_isFirstTurn) {
        pawnValidMoves = []
        let distance = (_isFirstTurn) ? 2 : 1; //set the distance it can move based on if it's its first turn
        
        //moving
        for (let i = 1; i < distance + 1; i++) {
            let checkRow = startRow + parseInt((isWhite) ? -i : i);
            if(checkRow >= 0 && checkRow <= 7) { //check if on board
                if(board[checkRow][startCol] == ' ') {
                    pawnValidMoves.push(checkRow + "-" + startCol);
                }
                else {
                    break;
                }
            }
        }

        //capturing
        let checkRow = startRow + parseInt((isWhite) ? -1 : 1)
        if(checkRow >= 0 && checkRow <= 7) {
            //right
            let checkCol = startCol + 1;
            if(checkCol <= 7) {
                let oppColour = (board[checkRow][checkCol].includes('w')) ? "White" : "Black";
                //if piece in place and its not our colour
                if(board[checkRow][checkCol] != ' ' && ourColour != oppColour) {
                    pawnValidMoves.push(checkRow + "-" + checkCol);
                }
            }

            //left
            checkCol = startCol - 1;
            if(checkCol >= 0) {
                let oppColour = (board[checkRow][checkCol].includes('w')) ? "White" : "Black";
                //if piece in place and its not our colour
                if(board[checkRow][checkCol] != ' '  && ourColour != oppColour) {
                    pawnValidMoves.push(checkRow + "-" + checkCol);
                }
            }
        }

        //en passant
        //if last piece in ch_movedPieces is a pawn and its only in there once
        //this pawn needs be next to that pawn
        deltas = [-1, 1];
        for (let i = 0; i < deltas.length; i++) {
            let checkCol = startCol + deltas[i];
            if(checkCol >= 0 && checkCol <= 7) {
                const oppColour = (board[startRow][checkCol].includes('w')) ? "White" : "Black";
                if(oppColour != ourColour && board[startRow][checkCol].includes('p')) {
                    //check the pawn we are checking has only moved once
                    instances = 0
                    for (let j = 0; j < ch_movedPieces.get().length; j++) {
                        if(ch_movedPieces.get()[j] == board[startRow][checkCol]) {
                            instances += 1;
                        }
                    }

                    //if the pawn next to this pawn is in moved pieces only once and is at the end 
                    if(instances == 1 && ch_movedPieces.get()[ch_movedPieces.get().length - 1] == board[startRow][checkCol]) {
                        //allow en passant
                        const takeRow = parseInt(startRow + ((ourColour == "White") ? -1 : 1));
                        if(board[takeRow][checkCol] == ' ') {
                            pawnValidMoves.push(takeRow + "-" + checkCol);
                        }
                    }
                }
            }
        }
        
        //only let this piece move normally if king isn't under threat and we can't break check with a move
        if(!kingUnderThreat) {
            return pawnValidMoves;
        }
        else {
            return movesThatBreakCheck(board, pawnValidMoves, startRow, startCol)
        }
    }

    this.getValidRookMoves = function() {
        rookValidMoves = []

        deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        for (let i = 0; i < deltas.length; i++) {
            addValidLineMoves(board, startRow, startCol, deltas[i][0], deltas[i][1], rookValidMoves);
        }

        //only let this piece move normally if king isn't under threat and we can't break check with a move
        if(!kingUnderThreat) {
            return rookValidMoves;
        }
        else {
            return movesThatBreakCheck(board, rookValidMoves, startRow, startCol)
        }
    }

    this.getValidBishopMoves = function() {
        bishopValidMoves = []

        deltas = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
        for (let i = 0; i < deltas.length; i++) {
            addValidLineMoves(board, startRow, startCol, deltas[i][0], deltas[i][1], bishopValidMoves);
        }

        //only let this piece move normally if king isn't under threat and we can't break check with a move
        if(!kingUnderThreat) {
            return bishopValidMoves;
        }
        else {
            return movesThatBreakCheck(board, bishopValidMoves, startRow, startCol)
        }
    }

    this.getValidQueenMoves = function() {
        queenValidMoves = []

        deltas = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]
        for (let i = 0; i < deltas.length; i++) {
            addValidLineMoves(board, startRow, startCol, deltas[i][0], deltas[i][1], queenValidMoves);
        }

        //only let this piece move normally if king isn't under threat and we can't break check with a move
        if(!kingUnderThreat) {
            return queenValidMoves;
        }
        else {
            return movesThatBreakCheck(board, queenValidMoves, startRow, startCol)
        }
    }

    this.getValidKnightMoves = function() {
        knightValidMoves = []
        
        deltas = [[-2, 1], [-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1]]
        for (let i = 0; i < deltas.length; i++) {
            let checkRow = startRow + deltas[i][0];
            let checkCol = startCol + deltas[i][1];

            if(checkRow >= 0 && checkRow <= 7 && checkCol >= 0 && checkCol <= 7) {
                const oppColour = (board[checkRow][checkCol].includes(("w"))) ? "White" : "Black";
                if (board[checkRow][checkCol] == ' ') {
                    //moving
                    knightValidMoves.push(checkRow + "-" + checkCol);
                }
                else {
                    //capturing
                    if(ourColour != oppColour) {
                        knightValidMoves.push(checkRow + "-" + checkCol);
                    }
                }
            }
        }

        //only let this piece move normally if king isn't under threat and we can't break check with a move
        if(!kingUnderThreat) {
            return knightValidMoves;
        }
        else {
            return movesThatBreakCheck(board, knightValidMoves, startRow, startCol)
        }
    }

    this.getValidKingMoves = function(_isFirstTurn) {
        kingValidMoves = []

        deltas = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]
        for (let i = 0; i < deltas.length; i++) {
            let checkRow = startRow + deltas[i][0];
            let checkCol = startCol + deltas[i][1];

            if(checkRow >= 0 && checkRow <= 7 && checkCol >= 0 && checkCol <= 7) {
                const oppColour = (board[checkRow][checkCol].includes(("w"))) ? "White" : "Black";
                if(!underThreatTiles.includes(`${checkRow}-${checkCol}`)) {
                    if (board[checkRow][checkCol] == ' ') {
                        //moving
                        kingValidMoves.push(checkRow + "-" + checkCol);
                    }
                    else {
                        //capturing
                        if(ourColour != oppColour) {
                            kingValidMoves.push(checkRow + "-" + checkCol);
                        }
                    }
                }
            }
        }

        //castling
        //if king hasnt moved
        if(_isFirstTurn) {
            const row = (ourColour === "White") ? 7 : 0;

            //queenside
            const isRookNotMovedQ = (ourColour === "White") ? !ch_movedPieces.get().includes('wR0') : !ch_movedPieces.get().includes('bR0');
            const spacesFreeQ = (board[row][1] == ' ' && board[row][2] == ' ' && board[row][3] == ' ');

            if (isRookNotMovedQ && spacesFreeQ) {
                const threat1 = `${row}-1`;
                const threat2 = `${row}-2`;
                const threat3 = `${row}-3`;
              
                if (!underThreatTiles.includes(threat1) && !underThreatTiles.includes(threat2) && !underThreatTiles.includes(threat3)) {
                    // castle
                    kingValidMoves.push(row + "-2"); //place king moves to
                    kingValidMoves.push(row + "-0"); //option to capture rook instead
                }
            }

            //kingside
            const isRookNotMovedK = (ourColour === "White") ? !ch_movedPieces.get().includes('wR1') : !ch_movedPieces.get().includes('bR1');
            const spacesFreeK = (board[row][5] == ' ' && board[row][6] == ' ');

            if (isRookNotMovedK && spacesFreeK) {
                const threat1 = `${row}-5`;
                const threat2 = `${row}-6`;
              
                if (!underThreatTiles.includes(threat1) && !underThreatTiles.includes(threat2)) {
                    // castle
                    kingValidMoves.push(row + "-6"); //place king moves to
                    kingValidMoves.push(row + "-7"); //option to capture rook instead
                }
            }
        }

        return kingValidMoves;
    }
};

//function for generating valid moves in straight lines
function addValidLineMoves(_board, _startRow, _startCol, _rowDelta, _colDelta, _validMoves) {
    checkRow = _startRow + _rowDelta;
    checkCol = _startCol + _colDelta;

    const ourColour = (_board[_startRow][_startCol].includes(("w"))) ? "White" : "Black";

    while (checkRow >= 0 && checkRow <= 7 && checkCol >= 0 && checkCol <= 7) {
        //moving
        if (_board[checkRow][checkCol] == ' ') {
            _validMoves.push(checkRow + "-" + checkCol);
            checkRow += _rowDelta;
            checkCol += _colDelta;
        } else {
            //taking
            //if a piece is in the way, allow for it to be taken if opposite colour
            const oppColour = (_board[checkRow][checkCol].includes(("w"))) ? "White" : "Black";
            if(ourColour != oppColour) {
                _validMoves.push(checkRow + "-" + checkCol);
            }
            break;
        }
    }
}

//function to get a list of all tiles that are under threat
function getUnderThreatTiles(_board, _ourColour) {
    tiles = []

    const colourCheck = (_ourColour == "White") ? 'w' : 'b';

    for (let r = 0; r < ch_ROWS; r++) {
        for (let c = 0; c < ch_COLUMNS; c++) {
            if(!_board[r][c].includes(colourCheck) && _board[r][c] !== ' ') {
                tiles = tiles.concat(getValidMoves(_board, r, c, false));
            }
        }
    }

    return tiles;
}

//function to check if moving a piece will stop a check
function movesThatBreakCheck(_board, _moves, _startRow, _startCol) {
    //moves is an array of positions in the format 'r-c'
    //simulate a move on the board (so we can check if king is no longer in check)
    let breakMoves = []
    _startRow = parseInt(_startRow);
    _startCol = parseInt(_startCol);

    const pieceId = _board[_startRow][_startCol];
    const ourColour = (pieceId.includes('w')) ? "White" : "Black";

    for (let i = 0; i < _moves.length; i++) {
        const values = _moves[i].split('-');
        let boardCopy = copy2DArray(_board);
        boardCopy[_startRow][_startCol] = ' ';
        boardCopy[values[0]][values[1]] = pieceId;

        const underThreatTiles = getUnderThreatTiles(boardCopy, ourColour);

        let kingUnderThreat = underThreatTiles.some(tile => boardCopy[tile.split('-')[0]][tile.split('-')[1]].includes('K'));

        if(!kingUnderThreat) {
            breakMoves.push(_moves[i]);
        }
    }

    return breakMoves;
}