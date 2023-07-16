//move patterns
const Pattern = function(board, startRow, startCol, endRow, endCol) {
    this.isValidPawnMove = function(isFirstTurn) {
        let distance = (isFirstTurn) ? 2 : 1; //set the distance it can move based on if it's its first turn
 
        //check for possible move spaces
        if(endRow < startRow && startRow - distance <= endRow && startCol == endCol) {
            return true;
        }
        
        return false;
    };
};

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
    constructor(isFirstTurn, color) {
        super(color);
        this.isFirstTurn = isFirstTurn;
    }

    move() {
        console.log((this.isFirstTurn) ? "First turn" : "Not first turn");
    }
}