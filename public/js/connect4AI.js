//function to make ai move
function aiMove(board, depth, aiPiece) {
    //call minimax to get the best move (this returns a column number)
    //const bestMove = minimax(board, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true).index;
    const bestMove = 0;

    //console.log(bestMove);

    //column shouldn't be full so call setPiece, also game shouldn't be drawn
    // if(!isDraw) {
    //     setPiece(bestMove, aiPiece);
    //     console.log("ai played");
    // }

    //setPiece(bestMove, aiPiece);
}

//#region chatgpt test
//minimax function to get ai's best move
function minimax(board, depth, alpha, beta, isMaximisingPlayer) { //minimax with alpha beta pruning
    //if a player has won or drawn, or depth limit is reached
    terminalState = isTerminalState(board);

    if(isTerminalState || depth === 0) {
        if(terminalState === "R") { //ai wins, assign high score
            return {eval: 1000, index: null}; 
        }  
        else if(terminalState === "Y") { //player wins, assign low score
            return {eval: -1000, index: null}; 
        }
        else { //game is a draw, assign neutral score
            return {eval: 0, index: null}; 
        }
    }

    if(isMaximisingPlayer) { //if maximising player, meaning checking all the player's moves
        //initial values
        let maxEval = Number.NEGATIVE_INFINITY; //value of the current state of the board
        let bestMove = null; //best column to play in

        //generate all possible moves
        for (let col = 0; col < COLUMNS; col++) {
            if(board[0][col] === ' ') { //top of column is empty
                //apply the move to a copy of the game
                let boardCopy = JSON.parse(JSON.stringify(board)); //copy the board
                
                //get next available slot in row
                let row = 5;
                while(row >= 0 && boardCopy[row][col] !== ' ') {
                    row--;
                }

                //update the board copy
                boardCopy[row][col] = "R"; //for now, ai is always red and player is always yellow as player goes first

                //recursive call to minimax
                let eval = minimax(boardCopy, (depth - 1), alpha, beta, false).eval;

                //update best move and max eval
                if(eval > maxEval) {
                    maxEval = eval;
                    bestMove = col;
                }

                //perform alpha-beta pruning
                alpha = Math.max(alpha, eval);
                if(beta <= alpha) {
                    break;
                }
            }
        }

        console.log("max = " + maxEval);
        return { eval: maxEval, index: bestMove}; //return values
    } 
    else { //if minimising player, meaning checking all the ai's moves
        //initial values
        let minEval = Number.POSITIVE_INFINITY; //value of the current state of the board
        let bestMove = null; //best column to play in

        //generate all possible moves
        for (let col = 0; col < COLUMNS; col++) {
            if(board[0][col] === ' ') { //top of column is empty
                //apply the move to a copy of the game
                let boardCopy = JSON.parse(JSON.stringify(board)); //copy the board
                
                //get next available slot in row
                let row = 5;
                while(row >= 0 && boardCopy[row][col] !== ' ') {
                    row--;
                }

                //update the board copy
                boardCopy[row][col] = "Y"; //for now, ai is always red and player is always yellow as player goes first

                //recursive call to minimax
                let eval = minimax(boardCopy, (depth - 1), alpha, beta, true).eval;

                //update best move and max eval
                if(eval < minEval) {
                    minEval = eval;
                    bestMove = col;
                }

                //perform alpha-beta pruning
                beta = Math.min(beta, eval);
                if(beta <= alpha) {
                    break;
                }
            }
        }

        console.log("min = " + minEval);
        return { eval: minEval, index: bestMove}; //return values
    }
}
//#endregion

function minimax2(board, depth, alpha, beta, isMaximisingPlayer) {

}

function evaluateBoard(board, columnNo, pieceToCheck) {
    //this function will generate a score for any inputted go, 
    //column should be checked to see if its empty first

    //this is based on weighted values that i will assign
    //for example:
    //centre pieces: +4
    //lines of 2: +2
    //lines of 3: +5
    //win: +1000

    //get a copy of the board
    //let boardCopy = [...board];

    //get the value
    let score = 0;

    //check if in centre
    if(columnNo == ((COLUMNS - 1) / 2)) {
        score += 2;
    }

    //check for lines of 2
    //horizontally
    for (let c = 0; c < COLUMNS; c++) {
        
    }

    return score;
}

//function to check if a game is at a terminal state (win or draw)
function isTerminalState(board) {
    //check all directions - this can probably be optimised
    //#region Horizontally
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < (COLUMNS - 3); c++) {
            if(board[r][c] != ' ') {
                if(board[r][c] == board[r][c + 1] && board[r][c + 1] == board[r][c + 2] && board[r][c + 2] == board[r][c + 3]) {
                    return board[r][c];
                }
            }
        }
    }
    //#endregion

    //#region Vertically
    for (let c = 0; c < COLUMNS; c++) {
        for (let r = 0; r < (ROWS - 3); r++) {
            if(board[r][c] != ' ') {
                if(board[r][c] == board[r + 1][c] && board[r + 1][c] == board[r + 2][c] && board[r + 2][c] == board[r + 3][c]) {
                    return board[r][c];
                }
            }
        }
    }
    //#endregion

    //#region Diagonally (top-left to bottom-right)
    for (let r = 0; r < (ROWS - 3); r++) {
        for (let c = 0; c < (COLUMNS - 3); c++) {
            if(board[r][c] != ' ') {
                if(board[r][c] == board[r + 1][c + 1] && board[r + 1][c + 1] == board[r + 2][c + 2] && board[r + 2][c + 2] == board[r + 3][c + 3]) {
                    return board[r][c];
                }
            }
        }
    }
    //#endregion

    //#region Diagonally (bottom-left to top-right)
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c < (COLUMNS - 3); c++) {
            if(board[r][c] != ' ') {
                if(board[r][c] == board[r - 1][c + 1] && board[r - 1][c + 1] == board[r - 2][c + 2] && board[r - 2][c + 2] == board[r - 3][c + 3]) {
                    return board[r][c];
                }
            }
        }
    }

    //check for a draw
    if(isDraw) return "draw";

    //default
    return null;
}

//function to play a piece in a board array
function playPiece(board, columnNo, piece) {
    let tilesInColumn = 0;

    //work out which row to put the tile at based on how empty the column is
    for (let i = 0; i < ROWS; i++) {
        if(board[i][columnNo] != ' ') { //if the row at column is empty
            tilesInColumn++; //increment tilesInColumn
        }
    }

    board[(ROWS - tilesInColumn - 1)][columnNo] = piece;
}

//function to check for a draw
function isDraw(board) {
    let filledPositions = 0;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            if(board[r][c] != ' ') { //if the tile isn't empty
                filledPositions++;
            }
        }
    }

    if(filledPositions >= (ROWS * COLUMNS)) {
        return true; //return true if whole board is full
    }
    return false;
}

//get number of moves since the beginning of the game
function noMovesFromStart(board) {
    let filledPositions = 0;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            if(board[r][c] != ' ') { //if the tile isn't empty
                filledPositions++;
            }
        }
    }

    return filledPositions;
}