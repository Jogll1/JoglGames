function minimaxab(board, depth, a, b, maximisingPlayer) { //minimax with alpha beta pruning
    //getValidPositions() //get valid positions of the board function
    //isTerminal = isTerminalNode(board); //check to see if this node is the terminal position
    if(depth == 0) { //or isTerminal
        //return heuristic value of teminal node
        //if(isTerminal) {
        //    if(isWinningMove(board, AIPiece)) {
        //        return (None, 100000000000000);
        //    }
        //    else if(isWinningMove(board, PlayerPiece)) {
        //        return (None, -100000000000000);
        //    }
        //    else { //game is over, no valid moves
        //        return (None, 0);
        //    } 
        //}
        //else { //depth is 0
        //    return (None, scorePosition(board, AIPiece))
        //}
    }

    if(maximisingPlayer) { //maximising player
        let value = -Infinity;

        for (let i = 0; i < node.length; i++) {
            value = Math.max(value, minimaxab(node[i], (depth - 1), a, b, false)); //start the recursion
            a = Math.max(a, value);
            if(a >= b) {
                break; //b cut off
            }
        }
        return value;
    }
    else { //minimising player
        let value = Infinity;

        for (let i = 0; i < node.length; i++) {
            value = Math.min(value, minimaxab(node[i], (depth - 1), a, b, true)); //start the recursion
            b = Math.min(b, value);
            if(b <= a) {
                break; //alpha cutoff
            }
        }
        return value;
    }
}