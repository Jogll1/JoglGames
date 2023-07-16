//move patterns
const Pattern = function(isWhite, startRow, startCol, endRow, endCol) {
    this.isValidPawnMove = function(isFirstTurn) {
        let distance = (isFirstTurn) ? 2 : 1; //set the distance it can move based on if it's its first turn
        
        startRow = parseInt(startRow);
        endRow = parseInt(endRow);

        //check for possible move spaces
        if(isWhite) {
            if(endRow < startRow && startRow - distance <= endRow && startCol == endCol) {
                return true;
            }
        }
        else { //is black
            if(endRow > startRow && endRow <= (startRow + distance) && startCol == endCol) {
                return true;
            }
        }

        //need to make it so cant jump through pieces
        
        //default to false
        return false;
    };
};

//oop test
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