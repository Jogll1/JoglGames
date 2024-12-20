//this script is ran in the background by a web worker
const ROWS = 6;
const COLUMNS = 7;

//minimax function to get ai's best move
function minimax3(board, depth, alpha, beta, maximisingPlayer) {
    //this array holds the order of most valuable columns
    //using this array optimises alpha beta pruning by trying to put most valuable moves first
    const colOrder = [3, 4, 2, 5, 1, 6, 0];

    //get terminal state
    let terminalState = isTerminalState(board);

    //determine score based on terminal state or if depth is 0
    if(depth == 0 || terminalState !== null) {
        if (terminalState !== null) {
            if(terminalState == "R") { //if ai won
                return {eval: 10000000000000, index: null};
            }
            else if(terminalState == "Y") { //if player won
                return {eval: -10000000000000, index: null};
            }
            else { //draw
                return {eval: 0, index: null};
            }
        }
        else { //depth is 0
            return {eval: scoreBoard(board), index: null};
        }
    }

    if(maximisingPlayer) {
        let maxEval = Number.NEGATIVE_INFINITY;
        let bestMove = 1;

        //for i in range(0, colOrder.length)
        //board[row][colOrder[col]]
        for (let col = 0; col < colOrder.length; col++) {
            if(board[0][colOrder[col]] == ' ') { //if column has room 
                //copy board
                let boardCopy = copy2DArray(board);

                //get next available slot in row
                let row = 5;
                while(row >= 0 && boardCopy[row][colOrder[col]] !== ' ') {
                    row--;
                }

                //update the board copy
                boardCopy[row][colOrder[col]] = "R";

                //recursively loop through all positions until depth = 0 or game won
                let eval = minimax3(boardCopy, (depth - 1), alpha, beta, false).eval;

                //maxEval = Math.max(maxEval, eval);
                if(eval > maxEval || eval == maxEval && Math.random > 0.5) {
                    //console.log(eval + ">" + maxEval);
                    maxEval = eval;
                    bestMove = colOrder[col];
                    //console.log("max best move = " + col);
                }

                //set alpha to bigger of alpha and eval
                alpha = Math.max(alpha, eval);

                //beta cutoff
                if(beta <= alpha) break;

                //undo move
                boardCopy[row][colOrder[col]] = " ";
            }
        }
        
        return {eval: maxEval, index: bestMove};
    }
    else { //minimising player
        let minEval = Number.POSITIVE_INFINITY;
        let bestMove = 1;
        
        for (let col = 0; col < colOrder.length; col++) {
            if(board[0][colOrder[col]] == ' ') { //if column empty
                //copy board
                let boardCopy = copy2DArray(board);

                //get next available slot in row
                let row = 5;
                while(row >= 0 && boardCopy[row][colOrder[col]] !== ' ') {
                    row--;
                }

                //update the board copy
                boardCopy[row][colOrder[col]] = "Y";

                //recursively loop through all positions until depth = 0 or game won
                let eval = minimax3(boardCopy, (depth - 1), alpha, beta, true).eval;

                //minEval = Math.min(minEval, eval);
                if(eval < minEval || eval == minEval && Math.random > 0.5) {
                    //console.log(eval + "<" + minEval);
                    minEval = eval;
                    bestMove = colOrder[col];
                    //console.log("min best move = " + col);
                }

                //set alpha to bigger of alpha and eval
                beta = Math.min(beta, eval);

                //alpha cutoff
                if(beta <= alpha) break;

                //undo move
                boardCopy[row][colOrder[col]] = " ";
            }
        }
        
        return {eval: minEval, index: bestMove};
    }
}

//#region scoring a board
//function that gets the score of a coord
function evaluatePos(board, col, row, pieceToCheck) {
    let score = 0

    //check if won
    terminalState = isTerminalState(board);
    if(terminalState == pieceToCheck) {
        return 1000000000;
    }  

    //check if in centre
    if(col == ((COLUMNS - 1) / 2)) {
        score += 60; //60
    }

    //check if in column 2 places either side of the middle
    if(col == ((COLUMNS - 1) / 2) - 2 || col == ((COLUMNS - 1) / 2) + 2) {
        score += 2; //1
    }

    //check for lines of 2 and 3 from the last placed piece
    let n = 1;

    let maxLineCheck = 3; //how for each lune will be checked - was 4

    //#region horizontal
    //horizontally right
    for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
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
        //console.log("2 h r");
        n = 1;
    }
    else if(n == 3) {
        score += 4; //3
        //console.log("3 h r");
        n = 1;
    }

    //horizontally left
    for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
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
        //console.log("2 h l");
        n = 1;
    }
    else if(n == 3) {
        score += 4; //3
        //console.log("3 h l");
        n = 1;
    }
    //#endregion

    //#region vertical
    //vertically down
    for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
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
        //console.log("2 v d");
        n = 1;
    }
    else if(n == 3) {
        score += 4; //3
        //console.log("3 v d");
        n = 1;
    }

    //vertically up
    for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
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
        //console.log("2 v u");
        n = 1;
    }
    else if(n == 3) {
        score += 4; //3
        //console.log("3 v u");
        n = 1;
    }
    //#endregion

    //#region diagonally down
    //diagonally down right
    for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
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
        //console.log("2 d d r");
        n = 1;
    }
    else if(n == 3) {
        score += 4; //3
        //console.log("3 d d r");
        n = 1;
    }

    //diagonally down left
    for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
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
        //console.log("2 d d l");
        n = 1;
    }
    else if(n == 3) {
        score += 4; //3
        //console.log("3 d d l");
        n = 1;
    }
    //#endregion

    //#region diagonally up
    //diagonally up right
    for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
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
        //console.log("2 d u r");
        n = 1;
    }
    else if(n == 3) {
        score += 4; //3
        //console.log("3 d u r");
        n = 1;
    }

    //diagonally up left
    for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
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
        //console.log("2 d u l");
        n = 1;
    }
    else if(n == 3) {
        score += 4; //3
        //console.log("3 d u l");
        n = 1;
    }
    //#endregion

    return score;
}

//function to get the score of the board (from ai's pov)
function scoreBoard(board) {
    let score = 0;
    let aiPiece = "R";
    let playerPiece = "Y";

    const colOrder = [3, 4, 2, 5, 1, 6, 0];

    //ai's score
    for (let c = 0; c < colOrder.length; c++) {
        for (let r = 0; r < ROWS; r++) {
            score += evaluatePos(board, colOrder[c], r, aiPiece);
        }
    }

    //subtract player's score
    for (let c = 0; c < colOrder.length; c++) {
        for (let r = 0; r < ROWS; r++) {
            score -= evaluatePos(board, colOrder[c], r, playerPiece);
        }
    }

    //add a random value from -3 to 3 for fun
    let ranOffset = Math.floor(Math.random() * (3 - (-3) + 1)) + (-3);

    return score + ranOffset;
}
//#endregion

//#region Other utility functions
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
    //#endregion

    //check for a draw
    if(isDraw(board)) return "draw";

    //default
    return null;
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

//function to copy a 2d array
function copy2DArray(array) {
    let copy = [];

    for (let i = 0; i < array.length; i++) {
        copy[i] = [];
        for (let j = 0; j < array[i].length; j++) {
          copy[i][j] = array[i][j];
        }
    }
      
    return copy;
}
//#endregion

//#region -----------Web Worker stuff-----------
self.addEventListener('message', function(event) {
    const board = event.data._board;
    const depth = event.data._depth;

    //first check for winning move before calculating another
    let countedColumns = 0;
    for (let col = 0; col < COLUMNS; col++) {
        if(board[0][col] == ' ') { //if column has room
            let boardCopy = copy2DArray(board);

            //set a piece in the column
            let row = 5;
            while(row >= 0 && boardCopy[row][col] !== ' ') {
                row--;
            }

            boardCopy[row][col] = "R";

            //if we have got a winning position
            let terminalState = isTerminalState(boardCopy);
            if(terminalState == "R") { 
                this.self.postMessage(col);
                break;
            }
            else {
                countedColumns++;
            }

            boardCopy[row][col] = " ";
        }
        else {
            countedColumns++;
        }
    }

    //if no moves could let ai win, calculate best move
    if(countedColumns == COLUMNS) {
        const bestMove = minimax3(board, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true).index;

        setTimeout(this.self.postMessage(bestMove), 2000); //supposed to speed it up by sending bestmove
    }
})
//#endregion