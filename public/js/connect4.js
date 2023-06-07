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

    //change the colour of the tile when its clicked on
    $('.squareTile').click(function() {
        let id = $(this).attr("id"); //get the squaretile's id
        let columnNo = id.substring(2).split("-")[1]; //remove the SQ from the front
        setPiece(columnNo, "Y");
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
});

//note - should probably wrap these functions in a module?
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

function setPiece(column, playerPiece) {
    if(!c4_gameStarted.getGameStarted()) return;

    let board = c4_board.getBoard();
    let tilesInColumn = 0;

    //work out which row to put the tile at based on how empty the column is
    for (let i = 0; i < ROWS; i++) {
        if(board[i][column] != ' ') { //if the row at column is empty
            tilesInColumn++; //increment tilesInColumn
        }
    }

    if(tilesInColumn < ROWS) { //if there's room in the column
        let id = (ROWS - tilesInColumn - 1) + "-" + column; //get the id of the tile to change
        $('#' + id).addClass("yellowTile"); //spawn the tile
        board[ROWS - 1 - tilesInColumn][column] = playerPiece; //update board
        c4_board.updateBoard(board); //update the board global

        console.log("clicked at " + column + ", " + (tilesInColumn + 1) + " tile(s) in this column");
    }
    else {
        console.log("Column full");
    }

    logArray(c4_board.getBoard());
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