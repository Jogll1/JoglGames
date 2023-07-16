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