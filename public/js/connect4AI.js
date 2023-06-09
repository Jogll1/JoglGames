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

function evaluateBoard(board, col, pieceToCheck) {
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

    //set the score value
    let score = 0;

    //get the row of the last tile placed
    let tilesInColumn = 0;
    for (let r = 0; r < ROWS; r++) {
        if(board[r][col] != ' ') {
            tilesInColumn++;
        }
    }
    let row = ROWS - tilesInColumn; //get row of last placed tile

    //check if won
    terminalState = isTerminalState(board);
    if(terminalState == pieceToCheck) {
        return 1000;
    }  

    //check if in centre
    if(col == ((COLUMNS - 1) / 2)) {
        score += 4;
    }

    //check if in column 2 places either side of the middle
    if(col == ((COLUMNS - 1) / 2) - 2 || col == ((COLUMNS - 1) / 2) + 2) {
        score += 1;
    }

    //#region lines of 2 or 3
    //check for lines of 2 and 3 from the last placed piece
    let n = 1;

    //#region horizontal
    //horizontally right
    for (let i = 1; i < 4; i++) { //no point of checking past 3 places over
        if((col + i) < COLUMNS) { //check if the next column over is valid
            if(board[row][(col + i)] == pieceToCheck || board[row][(col + i)] == ' ') { //if the piece i columns over isn't the opponent's piece
                if(board[row][(col + i)] == pieceToCheck) { //if it is our piece
                    n += 1; //increment n
                }
            } 
            else { //if it is, break
                break;
            }
        }
        else { //if its not, break
            break;
        }
    }
    
    //calculate score of 
    if(n == 2) {
        score += 2;
        console.log("2 h r");
        n = 1;
    }
    else if(n == 3) {
        score += 3;
        console.log("3 h r");
        n = 1;
    }

    //horizontally left
    for (let i = 1; i < 4; i++) { //no point of checking past 3 places over
        if((col - i) >= 0) { //check if the previous column over is valid
            if(board[row][(col - i)] == pieceToCheck || board[row][(col - i)] == ' ') { //if the piece i columns previous isn't the opponent's piece
                if(board[row][(col - i)] == pieceToCheck) { //if it is our piece
                    n += 1; //increment n
                }
            } 
            else { //if it is, break
                break;
            }
        }
        else { //if its not, break
            break;
        }
    }

    //calculate score of 
    if(n == 2) {
        score += 2;
        console.log("2 h l");
        n = 1;
    }
    else if(n == 3) {
        score += 3;
        console.log("3 h l");
        n = 1;
    }
    //#endregion

    //#region vertical
    //vertically down
    for (let i = 1; i < 4; i++) { //no point of checking past 3 places over
        if((row + i) < ROWS) { //check if the next row down is valid
            if(board[(row + i)][col] == pieceToCheck || board[(row + i)][col] == ' ') { //if the piece i rows down isn't the opponent's piece
                if(board[(row + i)][col] == pieceToCheck) { //if it is our piece
                    n += 1; //increment n
                }
            } 
            else { //if it is, break
                break;
            }
        }
        else { //if its not, break
            break;
        }
    }

    //calculate score of 
    if(n == 2) {
        score += 2;
        console.log("2 v d");
        n = 1;
    }
    else if(n == 3) {
        score += 3;
        console.log("3 v d");
        n = 1;
    }

    //vertically up
    for (let i = 1; i < 4; i++) { //no point of checking past 3 places over
        if((row - i) >= 0) { //check if the next row up is valid
            if(board[(row - i)][col] == pieceToCheck || board[(row - i)][col] == ' ') { //if the piece i row up isn't the opponent's piece
                if(board[(row - i)][col] == pieceToCheck) { //if it is our piece
                    n += 1; //increment n
                }
            } 
            else { //if it is, break
                break;
            }
        }
        else { //if its not, break
            break;
        }
    }

    //calculate score of 
    if(n == 2) {
        score += 2;
        console.log("2 v u");
        n = 1;
    }
    else if(n == 3) {
        score += 3;
        console.log("3 v u");
        n = 1;
    }
    //#endregion

    //#region diagonally down
    //diagonally down right
    for (let i = 1; i < 4; i++) { //no point of checking past 3 places over
        if((col + i) < COLUMNS && (row + i) < ROWS) { //check if the next diagonal down right is valid
            if(board[(row + i)][(col + i)] == pieceToCheck || board[(row + i)][(col + i)] == ' ') { //if the piece i next diagonal down right isn't the opponent's piece
                if(board[(row + i)][(col + i)] == pieceToCheck) { //if it is our piece
                    n += 1; //increment n
                }
            } 
            else { //if it is, break
                break;
            }
        }
        else { //if its not, break
            break;
        }
    }

    //calculate score of 
    if(n == 2) {
        score += 2;
        console.log("2 d d r");
        n = 1;
    }
    else if(n == 3) {
        score += 3;
        console.log("3 d d r");
        n = 1;
    }

    //diagonally down left
    for (let i = 1; i < 4; i++) { //no point of checking past 3 places over
        if((col - i) >= 0 && (row + i) < ROWS) { //check if the next diagonal up left is valid
            if(board[(row + i)][(col - i)] == pieceToCheck || board[(row + i)][(col - i)] == ' ') { //if the piece i next diagonal up left isn't the opponent's piece
                if(board[(row + i)][(col - i)] == pieceToCheck) { //if it is our piece
                    n += 1; //increment n
                }
            } 
            else { //if it is, break
                break;
            }
        }
        else { //if its not, break
            break;
        }
    }

    //calculate score of 
    if(n == 2) {
        score += 2;
        console.log("2 d d l");
        n = 1;
    }
    else if(n == 3) {
        score += 3;
        console.log("3 d d l");
        n = 1;
    }
    //#endregion

    //#region diagonally up
    //diagonally up right
    for (let i = 1; i < 4; i++) { //no point of checking past 3 places over
        if((col + i) < COLUMNS && (row - i) >= 0) { //check if the next diagonal up right is valid
            if(board[(row - i)][(col + i)] == pieceToCheck || board[(row - i)][(col + i)] == ' ') { //if the piece i next diagonal up right isn't the opponent's piece
                if(board[(row - i)][(col + i)] == pieceToCheck) { //if it is our piece
                    n += 1; //increment n
                }
            } 
            else { //if it is, break
                break;
            }
        }
        else { //if its not, break
            break;
        }
    }

    //calculate score of 
    if(n == 2) {
        score += 2;
        console.log("2 d u r");
        n = 1;
    }
    else if(n == 3) {
        score += 3;
        console.log("3 d u r");
        n = 1;
    }

    //diagonally up left
    for (let i = 1; i < 4; i++) { //no point of checking past 3 places over
        if((col - i) >= 0 && (row - i) >= 0) { //check if the next diagonal up left is valid
            if(board[(row - i)][(col - i)] == pieceToCheck || board[(row - i)][(col - i)] == ' ') { //if the piece i next diagonal up left isn't the opponent's piece
                if(board[(row - i)][(col - i)] == pieceToCheck) { //if it is our piece
                    n += 1; //increment n
                }
            } 
            else { //if it is, break
                break;
            }
        }
        else { //if its not, break
            break;
        }
    }
    
    //calculate score of 
    if(n == 2) {
        score += 2;
        console.log("2 d u l");
        n = 1;
    }
    else if(n == 3) {
        score += 3;
        console.log("3 d u l");
        n = 1;
    }
    //#endregion

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