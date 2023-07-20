//move patterns
const Pattern = function(board, isWhite, startRow, startCol) {
    startRow = parseInt(startRow);
    startCol = parseInt(startCol);

    this.getValidPawnMoves = function(isFirstTurn) {
        validMoves = []
        let distance = (isFirstTurn) ? 2 : 1; //set the distance it can move based on if it's its first turn
        
        //moving
        for (let i = 1; i < distance + 1; i++) {
            let checkRow = startRow + parseInt((isWhite) ? -i : i);
            if(checkRow >= 0 && checkRow <= 7) { //check if on board
                if(board[checkRow][startCol] == ' ') {
                    validMoves.push(checkRow + "-" + startCol);
                }
                else {
                    break;
                }
            }
        }

        //capturing
        let ourColour = (board[startRow][startCol].includes(("w"))) ? "White" : "Black";

        let checkRow = startRow + parseInt((isWhite) ? -1 : 1)
        if(checkRow >= 0 && checkRow <= 7) {
            //right
            let checkCol = startCol + 1;
            if(checkCol <= 7) {
                let oppColour = (board[checkRow][checkCol].includes(("w"))) ? "White" : "Black";
                //if piece in place and its not our colour
                if(board[checkRow][checkCol] != ' ' && ourColour != oppColour) {
                    validMoves.push(checkRow + "-" + checkCol);
                }
            }

            //left
            checkCol = startCol - 1;
            if(checkCol >= 0) {
                let oppColour = (board[checkRow][checkCol].includes(("w"))) ? "White" : "Black";
                //if piece in place and its not our colour
                if(board[checkRow][checkCol] != ' '  && ourColour != oppColour) {
                    validMoves.push(checkRow + "-" + checkCol);
                }
            }
        }
        
        return validMoves;
    }

    this.getValidRookMoves = function() {
        validMoves = []

        deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        for (let i = 0; i < deltas.length; i++) {
            addValidLineMoves(board, startRow, startCol, deltas[i][0], deltas[i][1], validMoves);
        }

        return validMoves;
    }

    this.getValidBishopMoves = function() {
        validMoves = []

        deltas = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
        for (let i = 0; i < deltas.length; i++) {
            addValidLineMoves(board, startRow, startCol, deltas[i][0], deltas[i][1], validMoves);
        }

        return validMoves;
    }

    this.getValidQueenMoves = function() {
        validMoves = []

        deltas = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]
        for (let i = 0; i < deltas.length; i++) {
            addValidLineMoves(board, startRow, startCol, deltas[i][0], deltas[i][1], validMoves);
        }

        return validMoves;
    }
};

//function for generating valid moves in straight lines
function addValidLineMoves(board, startRow, startCol, rowDelta, colDelta, validMoves) {
    checkRow = startRow + rowDelta;
    checkCol = startCol + colDelta;

    const ourColour = (board[startRow][startCol].includes(("w"))) ? "White" : "Black";

    while (checkRow >= 0 && checkRow <= 7 && checkCol >= 0 && checkCol <= 7) {
        //moving
        if (board[checkRow][checkCol] === ' ') {
            validMoves.push(checkRow + "-" + checkCol);
            checkRow += rowDelta;
            checkCol += colDelta;
        } else {
            //taking
            //if a piece is in the way, allow for it to be taken if opposite colour
            const oppColour = (board[checkRow][checkCol].includes(("w"))) ? "White" : "Black";
            if(ourColour != oppColour) {
                validMoves.push(checkRow + "-" + checkCol);
            }
            break;
        }
    }
}

//#region oop test
class Piece {
    constructor(isWhite) {
        this.isWhite = isWhite;
    }

    getColour() {
        return (this.isWhite) ? "White" : "Black";
    }

    move() {
        console.log("Move piece");
    }
}

class Pawn extends Piece {
    constructor(isWhite, isFirstTurn) {
        super(isWhite);
        this.isFirstTurn = isFirstTurn;
    }

    move() {
        console.log((this.isFirstTurn) ? "First turn" : "Not first turn");
    }
}
//#endregion