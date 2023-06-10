const ROWS = 6;
const COLUMNS = 7;

//#region Web workers
//create a worker instance
const aiWorker = new Worker('../js/conn4AI-worker.js');

//set up the message event listener to recieve ai moves from the worker
aiWorker.onmessage = function(event) {
    const aiMove = event.data;

    //perform ai's move
    setPiece(aiMove, "R");
}
//#endregion

//#region globals
//test for using global modules
var c4_gameStarted = (function(){ //create a module
    var gameStarted = false; //create a variable inside the module (within scope)

    return { //return a fuction that sets the variable
        setGameStarted : function(bToSet) {
            return gameStarted = bToSet;
        },

        getGameStarted : function() {
            return gameStarted;
        }
    }
})();

var c4_board = (function() {
    var board = [];

    return {
        updateBoard : function(array) {
            return board = array;
        },

        getBoard : function() {
            return board;
        }
    }
})();

var c4_isPlayerOneTurn = (function(){ //check if it is the first (human) player's go
    var isPlayerOneTurn = false; //create a variable inside the module (within scope)

    return { //return a fuction that sets the variable
        setState: function(bToSet) {
            return isPlayerOneTurn = bToSet;
        },

        getState : function() {
            return isPlayerOneTurn;
        }
    }
})();
//#endregion

// When document loads up call setGame()
$(document).ready(function() {
    setGame();

    //#region Menu functions
    $('#playRobotButton').click(function() {
        $('.menuBackground').hide();
        $('.friendOrAIMenu').hide();

        c4_gameStarted.setGameStarted(true);
        c4_isPlayerOneTurn.setState(true);
    });

    $('#playFriendButton').click(function() {
        $('.onlinePlayMenu').show();
        $('.friendOrAIMenu').hide();
    });

    $('#playOnlineButton').click(function() {
        $('.menuBackground').hide();
        $('.onlinePlayMenu').hide();
    });
    //#endregion

    //#region Tile functions
    //change the colour of the tile when its clicked on
    $('.squareTile').click(function() {
        if(!c4_isPlayerOneTurn.getState()) return; //if it isn't the player's turn

        let id = $(this).attr("id"); //get the squaretile's id
        let columnNo = id.substring(2).split("-")[1]; //remove the SQ from the front

        //check if the column is full
        if(!isColumnFull(columnNo)) {
            // if(c4_isPlayerOneTurn.getState()){
            //     setPiece(columnNo, "Y"); //yellow is player one
            //     console.log("The score for yellow's go is: " + evaluatePos(board, columnNo, "Y"));
            // } 
            // else {
            //     setPiece(columnNo, "R"); //red is player two
            // }

            //this commented code needs to be uncommented aswell as the first line of this function for allowing ai turns
            setPiece(columnNo, "Y"); //yellow is player one (human)

            if(!c4_isPlayerOneTurn.getState()) { //if not player one's turn, call ai turn
                //aiMove(c4_board.getBoard(), 6, "R");

                //send the board state to the aiworker for it to calculate its move
                let depth = 8; //max 8 nearly 9, 6 is good
                
                //set the message to be sent
                const message = {
                    _board: c4_board.getBoard(),
                    _depth: depth
                }

                aiWorker.postMessage(message);
            }
        }
    });

    //when hovering over a column
    $('.squareTile').mouseenter(function() {
        if(!c4_gameStarted.getGameStarted()) return;

        let id = $(this).attr("id"); //get the squaretile's id
        let columnNo = id.substring(2).split("-")[1]; //get the column number of the tile

        //select the correct column hover to show
        $('#Hover' + columnNo).addClass("hoverSelected");
    });

    //when mouse leaves a tile
    $('.squareTile').mouseleave(function() {
        let id = $(this).attr("id"); //get the squaretile's id
        let columnNo = id.substring(2).split("-")[1]; //get the column number of the tile

        //select the correct column hover to hide
        $('#Hover' + columnNo).removeClass("hoverSelected");
    });
    //#endregion
});

//initialise the game
function setGame() {
    //board will be a 2d array
    board = [];

    //rows
    for (let r = 0; r < ROWS; r++) {
        //each row
        let row = [];

        //columns
        for (let c = 0; c < COLUMNS; c++) {
            row.push(' '); //add an empty value to each column of a row

            //#region Creating tiles
            let idNo = r.toString() + "-" + c.toString();
            //creates <div id="0-0" class="tile"></div> in the board div
            //The square background has id SQ0-0, the cicular tile has 0-0
            //A square shaped div is created behind the circular tile to detect the hover
            let squareTile = document.createElement("div");
            squareTile.id = "SQ" + idNo;
            squareTile.classList.add("squareTile");

            //append squareTile to board
            $('#board').append(squareTile);

            //add the circular tile on top of the square tile
            let circularTile = document.createElement("div");
            circularTile.id = idNo;
            circularTile.classList.add("tile");

            //append circular tile to squareTile
            $('#SQ' + idNo).append(circularTile);
            //#endregion
        }
        board.push(row);
    }

    setBoardHovers();
    c4_board.updateBoard(board);
    logArray(c4_board.getBoard());
}

//function to create the column hover divs over the board
function setBoardHovers() {
    //left hover
    let leftBoardHoverDiv = document.createElement("div"); //create a new div
    leftBoardHoverDiv.id = "Hover0"; //give it the correct indexed id
    leftBoardHoverDiv.classList.add("boardColumnHoverLeft"); //add the class to style it

    $('#boardColumnHoversParent').append(leftBoardHoverDiv); //make the boardColumnHoversParent this div's parent

    //centre hovers
    for (let i = 0; i < COLUMNS - 2; i++) {
        let boardHoverDiv = document.createElement("div"); //create a new div
        boardHoverDiv.id = "Hover" + (i + 1); //give it the correct indexed id
        boardHoverDiv.classList.add("boardColumnHover"); //add the class to style it

        $('#boardColumnHoversParent').append(boardHoverDiv); //make the boardColumnHoversParent this div's parent
    }

    //right hover
    let rightBoardHoverDiv = document.createElement("div"); //create a new div
    rightBoardHoverDiv.id = "Hover6"; //give it the correct indexed id
    rightBoardHoverDiv.classList.add("boardColumnHoverRight"); //add the class to style it

    $('#boardColumnHoversParent').append(rightBoardHoverDiv); //make the boardColumnHoversParent this div's parent
}

//set a tile's colour
function setPiece(columnNo, playerPiece) {
    if(!c4_gameStarted.getGameStarted()) return;

    let board = c4_board.getBoard();
    let tilesInColumn = 0;

    //work out which row to put the tile at based on how empty the column is
    for (let i = 0; i < ROWS; i++) {
        if(board[i][columnNo] != ' ') { //if the row at column is empty
            tilesInColumn++; //increment tilesInColumn
        }
    }

    let id = (ROWS - tilesInColumn - 1) + "-" + columnNo; //get the id of the tile to change

    //change colour based on player
    if(playerPiece == "Y"){
        $('#' + id).addClass("yellowTile"); //spawn the tile (yellow)
    }
    else if(playerPiece == "R") {
        $('#' + id).addClass("redTile"); //spawn the tile (red)
    }

    board[ROWS - 1 - tilesInColumn][columnNo] = playerPiece; //update board
    c4_board.updateBoard(board); //update the board global

    // console.log("clicked at " + columnNo + ", " + (tilesInColumn + 1) + " tile(s) in this column");
    //logArray(c4_board.getBoard());

    //check if the player has won
    checkWinner();

    c4_isPlayerOneTurn.setState(!c4_isPlayerOneTurn.getState()); //alternate player
}

//function to check if a column is full
function isColumnFull(columnNo) {
    let board = c4_board.getBoard();
    let tilesInColumn = 0;

    //work out which row to put the tile at based on how empty the column is
    for (let i = 0; i < ROWS; i++) {
        if(board[i][columnNo] != ' ') { //if the row at column is empty
            tilesInColumn++; //increment tilesInColumn
        }
    }

    if(tilesInColumn < ROWS) { //if there's room in the column
        // console.log("Room in column");
        return false; //room in column
    } 
    else {
        // console.log("Column full");
        return true; //column full
    }
}

//function to check if a player has won after they play a piece
function checkWinner() {
    let board = c4_board.getBoard();

    //check all directions - this can probably be optimised
    //#region Horizontally
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < (COLUMNS - 3); c++) {
            if(board[r][c] != ' ') {
                if(board[r][c] == board[r][c + 1] && board[r][c + 1] == board[r][c + 2] && board[r][c + 2] == board[r][c + 3]) {
                    //add the winning tiles to an array
                    let winningTiles = [(r).toString() + "-" + (c).toString(),
                                        (r).toString() + "-" + (c + 1).toString(),
                                        (r).toString() + "-" + (c + 2).toString(),
                                        (r).toString() + "-" + (c + 3).toString()];
                    setWinner(winningTiles);
                    return;
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
                    //add the winning tiles to an array
                    let winningTiles = [(r).toString() + "-" + (c).toString(),
                                        (r + 1).toString() + "-" + (c).toString(),
                                        (r + 2).toString() + "-" + (c).toString(),
                                        (r + 3).toString() + "-" + (c).toString()];
                    setWinner(winningTiles);
                    return;
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
                    //add the winning tiles to an array
                    let winningTiles = [(r).toString() + "-" + (c).toString(),
                                        (r + 1).toString() + "-" + (c + 1).toString(),
                                        (r + 2).toString() + "-" + (c + 2).toString(),
                                        (r + 3).toString() + "-" + (c + 3).toString()];
                    setWinner(winningTiles);
                    return;
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
                    //add the winning tiles to an array
                    let winningTiles = [(r).toString() + "-" + (c).toString(),
                                        (r - 1).toString() + "-" + (c + 1).toString(),
                                        (r - 2).toString() + "-" + (c + 2).toString(),
                                        (r - 3).toString() + "-" + (c + 3).toString()];
                    setWinner(winningTiles);
                    return;
                }
            }
        }
    }

    //return false; //return false if no one won
    //#endregion
}

//function to set the winning tiles
function setWinner(winningTiles) {
    c4_gameStarted.setGameStarted(false);

    for (let i = 0; i < winningTiles.length; i++) {
        //console.log(winningTiles[i]);
        $("#" + winningTiles[i]).addClass("winningTile");
    }

    //remove hovers
    for (let i = 0; i < 7; i++) {
        $('#Hover' + i).removeClass("hoverSelected");
    }
}

// function that console.logs the values in a 2d array (or normal array)
function logArray(array) {
    let output = "";
    for (let r = 0; r < array.length; r++) 
    {
        for (let c = 0; c < array[r].length; c++) 
        {
            if(array[r][c] == " ") {
                output = output + "0 "; //output a 0 representing an empty string (" ")
            }
            else {
                output = output + array[r][c] + " ";
            }
        }
        output = output + "\n";
    }
    console.log(output);
}