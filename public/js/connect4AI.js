// //create a worker instance
// const aiWorker = new Worker('conn4AI-worker.js');

// //set up the message event listener to recieve ai moves from the worker
// aiWorker.onmessage = function(event) {
//     const aiMove = event.data;

//     //perform ai's move
//     setPiece(bestMove, "R");
// }

//function to make ai move
function aiMove(board, depth, aiPiece) {
    //call minimax to get the best move (this returns a column number)
    //const bestMove = minimax3(board, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true).index;
    //const bestMove = pickBestMove(board).index;

    //console.log("best move = " + bestMove);

    //column shouldn't be full so call setPiece, also game shouldn't be drawn
    // if(!isDraw) {
    //     setPiece(bestMove, aiPiece);
    //     console.log("ai played");
    // }

    //setPiece(bestMove, aiPiece);
}

// //minimax function to get ai's best move - so far perform minimax of depth 1
// function minimax3(board, depth, alpha, beta, maximisingPlayer) {
//     //get list of playable columns
//     // let playableColumns = [];
//     // for (let c = 0; c < COLUMNS; c++) {
//     //     if(board[0][c] == ' ') {
//     //         playableColumns.push(c);
//     //     }
//     // }

//     //console.log("depth = " + depth);
//     //get terminal state
//     let terminalState = isTerminalState(board);

//     //determine score based on terminal state or if depth is 0
//     if(depth == 0 || terminalState !== null) {
//         if (terminalState !== null) {
//             if(terminalState == "R") { //if ai won
//                 //console.log("null won");
//                 return {eval: 1000, index: null};
//             }
//             else if(terminalState == "Y") { //if player won
//                 //console.log("null lost");
//                 return {eval: -1000, index: null};
//             }
//             else { //draw
//                 //console.log("null draw");
//                 return {eval: 0, index: null};
//             }
//         }
//         else { //depth is 1
//             //console.log("null depth 0 eval: " + scoreBoard(board));
//             //return {eval: pickBestMove(board, "R").eval, index: pickBestMove(board, "R").index};
//             return {eval: scoreBoard(board), index: null};
//         }
//     }

//     if(maximisingPlayer) {
//         let maxEval = Number.NEGATIVE_INFINITY;
//         let bestMove = 1;

//         for (let col = 0; col < COLUMNS; col++) {
//             if(board[0][col] == ' ') { //if column empty
//                 //copy board
//                 let boardCopy = copy2DArray(board);

//                 //get next available slot in row
//                 let row = 5;
//                 while(row >= 0 && boardCopy[row][col] !== ' ') {
//                     row--;
//                 }

//                 //update the board copy
//                 boardCopy[row][col] = "R";

//                 //console.log("Placed an R at " + row + "-" + col);

//                 //recursively loop through all positions until depth = 0 or game won
//                 let eval = minimax3(boardCopy, (depth - 1), alpha, beta, false).eval;

//                 //maxEval = Math.max(maxEval, eval);
//                 if(eval > maxEval) {
//                     //console.log(eval + ">" + maxEval);
//                     maxEval = eval;
//                     bestMove = col;
//                     //console.log("max best move = " + col);
//                 }
                
//                 //set alpha to bigger of alpha and eval
//                 alpha = Math.max(alpha, eval);

//                 //beta cutoff
//                 if(beta <= alpha) break;

//                 //undo move
//                 boardCopy[row][col] = " ";
//             }
//         }
        
//         //console.log("depth: " + depth + ", max: eval:" + maxEval + ", index: " + bestMove);
//         return {eval: maxEval, index: bestMove};
//     }
//     else { //minimising player
//         let minEval = Number.POSITIVE_INFINITY;
//         let bestMove = 1;
        
//         for (let col = 0; col < COLUMNS; col++) {
//             if(board[0][col] == ' ') { //if column empty
//                 //copy board
//                 let boardCopy = copy2DArray(board);

//                 //get next available slot in row
//                 let row = 5;
//                 while(row >= 0 && boardCopy[row][col] !== ' ') {
//                     row--;
//                 }

//                 //update the board copy
//                 boardCopy[row][col] = "Y";
//                 // logArray(boardCopy);

//                 //console.log("Placed a Y at " + row + "-" + col);

//                 //recursively loop through all positions until depth = 0 or game won
//                 let eval = minimax3(boardCopy, (depth - 1), alpha, beta, true).eval;

//                 //minEval = Math.min(minEval, eval);
//                 if(eval < minEval) {
//                     //console.log(eval + "<" + minEval);
//                     minEval = eval;
//                     bestMove = col;
//                     //console.log("min best move = " + col);
//                 }

//                 //set alpha to bigger of alpha and eval
//                 beta = Math.min(beta, eval);

//                 //alpha cutoff
//                 if(beta <= alpha) break;

//                 //undo move
//                 boardCopy[row][col] = " ";
//             }
//         }
        
//         //console.log("depth: " + depth + ", min: eval:" + minEval + ", index: " + bestMove);
//         return {eval: minEval, index: bestMove};
//     }
// }

//function to get the best eval of depth 1
function pickBestMove(board, checkPiece) {
    let maxEval = Number.NEGATIVE_INFINITY; //current value of the board
    let bestMove = null; //best column to play in

    for (let col = 0; col < COLUMNS; col++) { //check each column
        if(board[0][col] == ' ') { //check if column empty
            //get a copy of the board
            let boardCopy = [...board];

            //get next available slot in row
            let row = 5;
            while(row >= 0 && boardCopy[row][col] !== ' ') {
                row--;
            }

            //update the board copy
            boardCopy[row][col] = checkPiece;

            //get score of new board
            let eval = evaluatePlay(boardCopy, col, checkPiece);
            //console.log(eval);

            if(eval > maxEval) {
                maxEval = eval;
                bestMove = col;
            }
            
            //undo the move
            boardCopy[row][col] = " "; 
        }
    }

    return { eval: maxEval, index: bestMove}; //return values
}

//function to get the score of the board after playing a piece
function evaluatePlay(board, col, pieceToCheck) {
    //this function will generate a score for any inputted go, 
    //column should be checked to see if its empty first

    //this is based on weighted values that i will assign
    //for example:
    //centre pieces: +4
    //in column 2 away from centre: +1
    //lines of 2: +2
    //lines of 3: +5
    //win: +1000

    //make sure col is an int
    col = parseInt(col);

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

    //if column is full, return 0
    // if(tilesInColumn >= ROWS) {
    //     return 0;
    // }

    //check if won
    terminalState = isTerminalState(board);
    if(terminalState == pieceToCheck) {
        return 100000;
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
        score += 3;
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
        score += 3;
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
        score += 3;
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
        score += 3;
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
        score += 3;
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
        score += 3;
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
        score += 3;
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
        score += 3;
        //console.log("3 d u l");
        n = 1;
    }
    //#endregion

    return score;
}

//#region scoreboard
// //function that gets the score of a coord
// function evaluatePos(board, col, row, pieceToCheck) {
//     let score = 0

//     //check if won
//     terminalState = isTerminalState(board);
//     if(terminalState == pieceToCheck) {
//         return 100000;
//     }  

//     //check if in centre
//     if(col == ((COLUMNS - 1) / 2)) {
//         score += 4;
//     }

//     //check if in column 2 places either side of the middle
//     if(col == ((COLUMNS - 1) / 2) - 2 || col == ((COLUMNS - 1) / 2) + 2) {
//         score += 1;
//     }

//     //#region lines of 2 or 3
//     //check for lines of 2 and 3 from the last placed piece
//     let n = 1;

//     let maxLineCheck = 3; //how for each lune will be checked - was 4
//     //#region horizontal
//     //horizontally right
//     for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
//         if((col + i) < COLUMNS) { //check if the next column over is valid
//             if(board[row][(col + i)] == pieceToCheck || board[row][(col + i)] == ' ') { //if the piece i columns over isn't the opponent's piece
//                 if(board[row][(col + i)] == pieceToCheck) { //if it is our piece
//                     n += 1; //increment n
//                 }
//             } 
//             else { //if it is, break
//                 break;
//             }
//         }
//         else { //if its not, break
//             break;
//         }
//     }
    
//     //calculate score of 
//     if(n == 2) {
//         score += 2;
//         //console.log("2 h r");
//         n = 1;
//     }
//     else if(n == 3) {
//         score += 3;
//         //console.log("3 h r");
//         n = 1;
//     }

//     //horizontally left
//     for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
//         if((col - i) >= 0) { //check if the previous column over is valid
//             if(board[row][(col - i)] == pieceToCheck || board[row][(col - i)] == ' ') { //if the piece i columns previous isn't the opponent's piece
//                 if(board[row][(col - i)] == pieceToCheck) { //if it is our piece
//                     n += 1; //increment n
//                 }
//             } 
//             else { //if it is, break
//                 break;
//             }
//         }
//         else { //if its not, break
//             break;
//         }
//     }

//     //calculate score of 
//     if(n == 2) {
//         score += 2;
//         //console.log("2 h l");
//         n = 1;
//     }
//     else if(n == 3) {
//         score += 3;
//         //console.log("3 h l");
//         n = 1;
//     }
//     //#endregion

//     //#region vertical
//     //vertically down
//     for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
//         if((row + i) < ROWS) { //check if the next row down is valid
//             if(board[(row + i)][col] == pieceToCheck || board[(row + i)][col] == ' ') { //if the piece i rows down isn't the opponent's piece
//                 if(board[(row + i)][col] == pieceToCheck) { //if it is our piece
//                     n += 1; //increment n
//                 }
//             } 
//             else { //if it is, break
//                 break;
//             }
//         }
//         else { //if its not, break
//             break;
//         }
//     }

//     //calculate score of 
//     if(n == 2) {
//         score += 2;
//         //console.log("2 v d");
//         n = 1;
//     }
//     else if(n == 3) {
//         score += 3;
//         //console.log("3 v d");
//         n = 1;
//     }

//     //vertically up
//     for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
//         if((row - i) >= 0) { //check if the next row up is valid
//             if(board[(row - i)][col] == pieceToCheck || board[(row - i)][col] == ' ') { //if the piece i row up isn't the opponent's piece
//                 if(board[(row - i)][col] == pieceToCheck) { //if it is our piece
//                     n += 1; //increment n
//                 }
//             } 
//             else { //if it is, break
//                 break;
//             }
//         }
//         else { //if its not, break
//             break;
//         }
//     }

//     //calculate score of 
//     if(n == 2) {
//         score += 2;
//         //console.log("2 v u");
//         n = 1;
//     }
//     else if(n == 3) {
//         score += 3;
//         //console.log("3 v u");
//         n = 1;
//     }
//     //#endregion

//     //#region diagonally down
//     //diagonally down right
//     for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
//         if((col + i) < COLUMNS && (row + i) < ROWS) { //check if the next diagonal down right is valid
//             if(board[(row + i)][(col + i)] == pieceToCheck || board[(row + i)][(col + i)] == ' ') { //if the piece i next diagonal down right isn't the opponent's piece
//                 if(board[(row + i)][(col + i)] == pieceToCheck) { //if it is our piece
//                     n += 1; //increment n
//                 }
//             } 
//             else { //if it is, break
//                 break;
//             }
//         }
//         else { //if its not, break
//             break;
//         }
//     }

//     //calculate score of 
//     if(n == 2) {
//         score += 2;
//         //console.log("2 d d r");
//         n = 1;
//     }
//     else if(n == 3) {
//         score += 3;
//         //console.log("3 d d r");
//         n = 1;
//     }

//     //diagonally down left
//     for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
//         if((col - i) >= 0 && (row + i) < ROWS) { //check if the next diagonal up left is valid
//             if(board[(row + i)][(col - i)] == pieceToCheck || board[(row + i)][(col - i)] == ' ') { //if the piece i next diagonal up left isn't the opponent's piece
//                 if(board[(row + i)][(col - i)] == pieceToCheck) { //if it is our piece
//                     n += 1; //increment n
//                 }
//             } 
//             else { //if it is, break
//                 break;
//             }
//         }
//         else { //if its not, break
//             break;
//         }
//     }

//     //calculate score of 
//     if(n == 2) {
//         score += 2;
//         //console.log("2 d d l");
//         n = 1;
//     }
//     else if(n == 3) {
//         score += 3;
//         //console.log("3 d d l");
//         n = 1;
//     }
//     //#endregion

//     //#region diagonally up
//     //diagonally up right
//     for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
//         if((col + i) < COLUMNS && (row - i) >= 0) { //check if the next diagonal up right is valid
//             if(board[(row - i)][(col + i)] == pieceToCheck || board[(row - i)][(col + i)] == ' ') { //if the piece i next diagonal up right isn't the opponent's piece
//                 if(board[(row - i)][(col + i)] == pieceToCheck) { //if it is our piece
//                     n += 1; //increment n
//                 }
//             } 
//             else { //if it is, break
//                 break;
//             }
//         }
//         else { //if its not, break
//             break;
//         }
//     }

//     //calculate score of 
//     if(n == 2) {
//         score += 2;
//         //console.log("2 d u r");
//         n = 1;
//     }
//     else if(n == 3) {
//         score += 3;
//         //console.log("3 d u r");
//         n = 1;
//     }

//     //diagonally up left
//     for (let i = 1; i < maxLineCheck; i++) { //no point of checking past 3 places over
//         if((col - i) >= 0 && (row - i) >= 0) { //check if the next diagonal up left is valid
//             if(board[(row - i)][(col - i)] == pieceToCheck || board[(row - i)][(col - i)] == ' ') { //if the piece i next diagonal up left isn't the opponent's piece
//                 if(board[(row - i)][(col - i)] == pieceToCheck) { //if it is our piece
//                     n += 1; //increment n
//                 }
//             } 
//             else { //if it is, break
//                 break;
//             }
//         }
//         else { //if its not, break
//             break;
//         }
//     }
    
//     //calculate score of 
//     if(n == 2) {
//         score += 2;
//         //console.log("2 d u l");
//         n = 1;
//     }
//     else if(n == 3) {
//         score += 3;
//         //console.log("3 d u l");
//         n = 1;
//     }
//     //#endregion

//     return score;
// }

// //function to get the score of the board (from ai's pov)
// function scoreBoard(board) {
//     //yep
//     let score = 0;
//     let aiPiece = "R";
//     let playerPiece = "Y";
//     for (let c = 0; c < COLUMNS; c++) {
//         for (let r = 0; r < ROWS; r++) {
//             score += evaluatePos(board, c, r, aiPiece);
//         }
//     }

//     for (let c = 0; c < COLUMNS; c++) {
//         for (let r = 0; r < ROWS; r++) {
//             score -= evaluatePos(board, c, r, playerPiece);
//         }
//     }

//     return score;
// }
//#endregion

//#region other functions
//function to check if a game is at a terminal state (win or draw)
// function isTerminalState(board) {
//     //check all directions - this can probably be optimised
//     //#region Horizontally
//     for (let r = 0; r < ROWS; r++) {
//         for (let c = 0; c < (COLUMNS - 3); c++) {
//             if(board[r][c] != ' ') {
//                 if(board[r][c] == board[r][c + 1] && board[r][c + 1] == board[r][c + 2] && board[r][c + 2] == board[r][c + 3]) {
//                     return board[r][c];
//                 }
//             }
//         }
//     }
//     //#endregion

//     //#region Vertically
//     for (let c = 0; c < COLUMNS; c++) {
//         for (let r = 0; r < (ROWS - 3); r++) {
//             if(board[r][c] != ' ') {
//                 if(board[r][c] == board[r + 1][c] && board[r + 1][c] == board[r + 2][c] && board[r + 2][c] == board[r + 3][c]) {
//                     return board[r][c];
//                 }
//             }
//         }
//     }
//     //#endregion

//     //#region Diagonally (top-left to bottom-right)
//     for (let r = 0; r < (ROWS - 3); r++) {
//         for (let c = 0; c < (COLUMNS - 3); c++) {
//             if(board[r][c] != ' ') {
//                 if(board[r][c] == board[r + 1][c + 1] && board[r + 1][c + 1] == board[r + 2][c + 2] && board[r + 2][c + 2] == board[r + 3][c + 3]) {
//                     return board[r][c];
//                 }
//             }
//         }
//     }
//     //#endregion

//     //#region Diagonally (bottom-left to top-right)
//     for (let r = 3; r < ROWS; r++) {
//         for (let c = 0; c < (COLUMNS - 3); c++) {
//             if(board[r][c] != ' ') {
//                 if(board[r][c] == board[r - 1][c + 1] && board[r - 1][c + 1] == board[r - 2][c + 2] && board[r - 2][c + 2] == board[r - 3][c + 3]) {
//                     return board[r][c];
//                 }
//             }
//         }
//     }

//     //check for a draw
//     if(isDraw(board)) return "draw";

//     //default
//     return null;
// }

// //function to check for a draw
// function isDraw(board) {
//     let filledPositions = 0;

//     for (let r = 0; r < ROWS; r++) {
//         for (let c = 0; c < COLUMNS; c++) {
//             if(board[r][c] != ' ') { //if the tile isn't empty
//                 filledPositions++;
//             }
//         }
//     }

//     if(filledPositions >= (ROWS * COLUMNS)) {
//         return true; //return true if whole board is full
//     }
//     return false;
// }

// //function to copy a 2d array
// function copy2DArray(array) {
//     let copy = [];

//     for (let i = 0; i < array.length; i++) {
//         copy[i] = [];
//         for (let j = 0; j < array[i].length; j++) {
//           copy[i][j] = array[i][j];
//         }
//     }
      
//     return copy;
// }
//#endregion