//piece parent class
class Piece {
    constructor(colour, type) {
        this.colour = colour; //peice colour (black or white)
        this.type = type; //piece type
    }
}

//pawn class
class Pawn extends Piece {
    constructor(colour) {
        super(colour, "Pawn");
    }
  
    isValidMove(startRow, startCol, endRow, endCol, isFirstTurn) {
        //pawn valid move logic
        if(isFirstTurn) {
            //if first turn allow to move 2 spaces
            if(endRow === startRow - 2 || endRow === startRow - 1 && startCol === endCol) {
                return true;
            }
        }
        else {
            //allow to move 1 space forward
            if(endRow === startRow - 1 && startCol === endCol) {
                return true;
            }
        }

        return false;
    }
}