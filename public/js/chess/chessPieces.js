//move patterns
const Pattern = function(board, startRow, startCol, endRow, endCol) {
    this.isValidPawnMove = function(isFirstTurn) {
        let distance = (isFirstTurn) ? 2 : 1; //set the distance it can move based on if it's its first turn
 
        //check if empty space to move to
        // console.log(`start row = ${startRow}, distance = ${distance}`)
        if(startRow - distance <= endRow && startCol == endCol) {
            return true;
        }
        
        return false;
    };
};