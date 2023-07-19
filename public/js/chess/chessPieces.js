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
        console.log(`our colour: ${ourColour}`)

        let checkRow = startRow + parseInt((isWhite) ? -1 : 1)
        if(checkRow >= 0 && checkRow <= 7) {
            //right
            let checkCol = startCol + 1;
            if(checkCol <= 7) {
                let oppColour = (board[checkRow][checkCol].includes(("w"))) ? "White" : "Black";
                console.log(`piece in check place 1: ${board[checkRow][checkCol]}`)
                //if piece in place and its not our colour
                if(board[checkRow][checkCol] != ' ' && ourColour != oppColour) {
                    validMoves.push(checkRow + "-" + checkCol);
                    console.log("take");
                }
            }

            //left
            checkCol = startCol - 1;
            if(checkCol >= 0) {
                let oppColour = (board[checkRow][checkCol].includes(("w"))) ? "White" : "Black";
                console.log(`piece in check place 1: ${board[checkRow][checkCol]}`)
                //if piece in place and its not our colour
                if(board[checkRow][checkCol] != ' '  && ourColour != oppColour) {
                    validMoves.push(checkRow + "-" + checkCol);
                    console.log("take");
                }
            }
        }
        
        return validMoves;
    }

    this.getValidRookMoves = function() {
        validMoves = []

        //moving up
        for (let i = 1; i < 8; i++) {
            const element = array[i];
            
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