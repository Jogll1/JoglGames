const rows = 6;
const columns = 7;

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

    $('.squareTile').click(function(){
        let id = $(this).attr("id"); //get the squaretile's id
        let coords = id.substring(2); //remove the SQ from the front
        setPiece(coords);
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

    logArray(board);
}

function setPiece(id) {
    if(!c4_module.getGameStarted()) return;

    console.log("clicked at " + id);

    $('#' + id).addClass("selected");
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