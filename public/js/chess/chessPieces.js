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
                    return validMoves;
                }
            }
        }
        
        return validMoves;
    }
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