//function to make ai move
function aiMove(board, depth, aiPiece) {
    //call minimax to get the best move (this returns a column number)
    //const bestMove = minimax(board, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true).index;
    const bestMove = 0;

    console.log(bestMove);

    //column shouldn't be full so call setPiece, also game shouldn't be drawn
    // if(!isDraw) {
    //     setPiece(bestMove, aiPiece);
    //     console.log("ai played");
    // }

    setPiece(bestMove, aiPiece);
}

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

//#region test
//simplified minimax function to get ai's best move
// function negamax(board, depth, alpha, beta) {
//     //check for draw
//     if(isDraw) return 0;

//     //check if player can win next go:
//     //create copy of the board
//     let boardCopy = JSON.parse(JSON.stringify(board));
//     //play a piece in each column of the copy
//     //check if that played piece is a terminal state
//     for (let col = 0; col < COLUMNS; col++) {
//         if(!isColumnFull(boardCopy)) {
//             playPiece(boardCopy, col, "R"); //play ai's turn

//             if(isTerminalState(boardCopy)) {
//                 return (ROWS * COLUMNS + 1 - noMovesFromStart(boardCopy)) / 2; //possible logic error
//             }
//         }
//     }

//     let max = (ROWS*COLUMNS - 1 - noMovesFromStart(boardCopy)) / 2; //init bestScore with lower bound of score

//     if(beta > max) {
//         beta = max; //no need for beta to be bigger than max score

//         if(alpha >= beta) return beta; //prune the exploration
//     }

//     //compute all next moves and keep the next one
//     for (let col = 0; col < COLUMNS; col++) {
//         if(!isColumnFull(col)) { //if you can play this move
//             playPiece(boardCopy, col, "Y"); //play opponent's turn
//             let score = -negamax(boardCopy, depth, -beta, -alpha); //opponent's score is negative ai's

//             if(score >= beta) return score; //prune the exploration if we find a move better than what we weer looking for
//             if(score > alpha) alpha = score; //reduce the score window
//         }
//     }

//     return alpha;
// }
//#endregion

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