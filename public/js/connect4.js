const ROWS = 6;
const COLUMNS = 7;

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
//#endregion

// When document loads up call setGame()
$(document).ready(function() {
    setGame();

    //#region Menu functions
    $('#playRobotButton').click(function() {
        $('.menuBackground').hide();
        $('.friendOrAIMenu').hide();

        c4_gameStarted.setGameStarted(true);
        // console.log(c4_module.getGameStarted());
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
    let isPlayerOneTurn = true;

    //change the colour of the tile when its clicked on
    $('.squareTile').click(function() {
        let id = $(this).attr("id"); //get the squaretile's id
        let columnNo = id.substring(2).split("-")[1]; //remove the SQ from the front

        //check if the column is full
        if(!isColumnFull(columnNo)) {
            if(isPlayerOneTurn){
                setPiece(columnNo, "Y"); //yellow is player one
            } 
            else {
                setPiece(columnNo, "R"); //red is player two
            }
        }

        isPlayerOneTurn = !isPlayerOneTurn; //alternate player
    });

    //when hovering over a column
    $('.squareTile').mouseenter(function() {
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
    // logArray(c4_board.getBoard());
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
function checkWinner(coords, playerPiece) {
    let board = c4_board.getBoard();

    let rowNo = coords.substring(2).split("-")[0]; //get the row number of the tile
    let colNo = coords.substring(2).split("-")[1]; //get the column number of the tile

    let n = 1; //number of tiles in a row

    //check all directions
    //#region Horizontal
    //horizontal left
    for (let i = 1; i < 4; i++) {
        if((colNo - i) > 0) {
            if(board[rowNo][(colNo - i)] == playerPiece){
                n++;
    
                getWinningCoords(coords, n);
            }
            else {
                return;
            }
        }
        else {
            return;
        }
    }

    //horizontal right
    for (let i = 1; i < 4; i++) {
        if((colNo + i) < COLUMNS) {
            if(board[rowNo][(colNo + i)] == playerPiece){
                n++;
    
                getWinningCoords(coords, n);
            }
            else {
                return;
            }
        }
        else {
            return;
        }
    }
    //#endregion

    //#region Vertical
    //Vertical up
    for (let i = 1; i < 4; i++) {
        if((rowNo + i) < ROWS) {
            if(board[rowNo + i][(colNo)] == playerPiece){
                n++;
    
                getWinningCoords(coords, n);
            }
            else {
                return;
            }
        }
        else {
            return;
        }
    }

    //Vertical down
    for (let i = 1; i < 4; i++) {
        if((rowNo - i) > 0) {
            if(board[rowNo - i][(colNo)] == playerPiece){
                n++;
    
                getWinningCoords(coords, n);
            }
            else {
                return;
            }
        }
        else {
            return;
        }
    }
    //#endregion

    //#region Diagonal up
    //diagonal left up
    for (let i = 1; i < 4; i++) {
        if((rowNo + i) < ROWS && (colNo - i) > 0) {
            if(board[rowNo + i][(colNo - i)] == playerPiece){
                n++;
    
                getWinningCoords(coords, n);
            }
            else {
                return;
            }
        }
        else {
            return;
        }
    }

    //diagonal right up
    for (let i = 1; i < 4; i++) {
        if((rowNo + i) < ROWS && (colNo + i) < COLUMNS) {
            if(board[rowNo + i][(colNo + i)] == playerPiece){
                n++;
    
                getWinningCoords(coords, n);
            }
            else {
                return;
            }
        }
        else {
            return;
        }
    }
    //#endregion
}

//function to get the winning coords
function getWinningCoords(coords, n) {
    let rowNo = coords.substring(2).split("-")[0]; //get the row number of the tile
    let colNo = coords.substring(2).split("-")[1]; //get the column number of the tile

    if(n >= 4) {
        //get the winning tile coords
        let winningCoords = [];
        for (let i = 0; i < 4; i++) {
            winningCoords.push(rowNo + "-" + (colNo + i));
        }
        setWinner(winningCoords);
    }
}

//function to set the winning tiles
function setWinner(winningTiles) {
    c4_gameStarted.setGameStarted(false);

    for (let i = 0; i < winningTiles.length; i++) {
        $("#" + winningTiles[i]).addClass("winningTile");
    }
}

// function that console.logs the values in a 2d array (or normal array)
function logArray(array)
{
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