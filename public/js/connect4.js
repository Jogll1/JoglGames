const rows = 6;
const columns = 7;
//const currentColumns = [5, 5, 5, 5, 5, 5, 5];

//test for using global modules
var c4_module = (function(){ //create a module
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

// When document loads up call setGame()
$(document).ready(function() {
    setGame();

    $('#playRobotButton').click(function() {
        $('.menuBackground').hide();
        $('.friendOrAIMenu').hide();

        c4_module.setGameStarted(true);
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
        let coords = id.substring(2); //remove the SQ from the front
        setPiece(coords);
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
    for (let r = 0; r < rows; r++) {
        //each row
        let row = [];

        //columns
        for (let c = 0; c < columns; c++) {
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
    logArray(board);
}

//function to create the column hover divs over the board
function setBoardHovers() {
    //left hover
    let leftBoardHoverDiv = document.createElement("div"); //create a new div
    leftBoardHoverDiv.id = "Hover0"; //give it the correct indexed id
    leftBoardHoverDiv.classList.add("boardColumnHoverLeft"); //add the class to style it

    $('#boardColumnHoversParent').append(leftBoardHoverDiv); //make the boardColumnHoversParent this div's parent

    //centre hovers
    for (let i = 0; i < columns - 2; i++) {
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

function setPiece(id) {
    if(!c4_module.getGameStarted()) return;

    console.log("clicked at " + id);

    $('#' + id).addClass("yellowTile");
}

// function that console.logs the values in a 2d array (or normal array)
function logArray(array)
{
    let output = "";
    for (let r = 0; r < array.length; r++) 
    {
        for (let c = 0; c < array[r].length; c++) 
        {
            output = output + "0 "; //swap the zero for the value of the array
        }
        output = output + "\n";
    }
    console.log(output);
}