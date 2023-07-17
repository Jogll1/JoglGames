//move patterns
const Pattern = function(board, isWhite, startRow, startCol) {
    startRow = parseInt(startRow);
    startCol = parseInt(startCol);

    this.getValidPawnMoves = function(isFirstTurn) {
        validMoves = []
        let distance = (isFirstTurn) ? 2 : 1; //set the distance it can move based on if it's its first turn

        for (let i = 1; i < distance + 1; i++) {
            let checkRow = startRow + parseInt((isWhite) ? -i : i);
            if(board[checkRow][startCol] == ' ') {
                validMoves.push(checkRow + "-" + startCol);
            }
            else {
                return;
            }
        }
        return validMoves;
    }

    // this.isValidRookMove = function() {
    //     //check for possible move spaces
    //     if(startCol == endCol || startRow == endRow) {
    //         return true;
    //     }
        
    //     //default to false
    //     return false;
    // };
};

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