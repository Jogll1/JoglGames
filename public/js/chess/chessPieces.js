//move patterns
const Pattern = function(isWhite, startRow, startCol, endRow, endCol) {
    startRow = parseInt(startRow);
    endRow = parseInt(endRow);

    this.isValidPawnMove = function(isFirstTurn) {
        let distance = (isFirstTurn) ? 2 : 1; //set the distance it can move based on if it's its first turn
        
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

        //default to false
        return false;
    };

    this.isValidRookMove = function() {
        //check for possible move spaces
        if(startCol == endCol || startRow == endRow) {
            return true;
        }
        
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