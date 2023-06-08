function minimaxab(board, depth, a, b, maximisingPlayer) { //minimax with alpha beta pruning
    //validPositions = getValidPositions(board) //get valid positions of the board function
    //isTerminal = isTerminalNode(board); //check to see if this node is the terminal position
    if(depth == 0) { //or isTerminal
        //return heuristic value of teminal node
        //if(isTerminal) {
        //    if(isWinningMove(board, AIPiece)) {
        //        return (null, 100000000000000);
        //    }
        //    else if(isWinningMove(board, PlayerPiece)) {
        //        return (null, -100000000000000);
        //    }
        //    else { //game is over, no valid moves
        //        return (null, 0);
        //    } 
        //}
        //else { //depth is 0
        //    return (null, scorePosition(board, AIPiece))
        //}
    }

    if(maximisingPlayer) { //maximising player
        let value = -Infinity;
        //column = board[Math.floor(Math.random() * array.length)];

        //for (let i = 0; i < validPositions.length; i++) {
        //    let row = getNextOpenRow(board);
        //    let boardCopy = board;
        //    setPiece(columnNo, AIPiece);
        //    let newScore = minimaxab(boardCopy, (depth - 1), a, b, false)[1]
        //    if(newScore > value) {
        //        value = newScore
        //        column = board[i];
        //    }
        //    a = max(a, value);
        //    if(a >= b) {
        //        break;
        //    }
        //}
        //return (column, value);
    }
    else { //minimising player
        let value = Infinity;
        //column = board[Math.floor(Math.random() * array.length)];

        //for (let i = 0; i < validPositions.length; i++) {
        //    let row = getNextOpenRow(board);
        //    let boardCopy = board;
        //    setPiece(columnNo, playerPiece);
        //    let newScore = minimaxab(boardCopy, (depth - 1), a, b, true)[1]
        //    if(newScore < value) {
        //        value = newScore
        //        column = board[i];
        //    }
        //    b = min(b, value);
        //    if(a >= b) {
        //        break;
        //    }
        //}
        //return (column, value);
    }
}