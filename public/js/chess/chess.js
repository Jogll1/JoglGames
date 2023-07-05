const ch_ROWS = 8;
const ch_COLUMNS = 8;

//#region globals
var ch_board = (function() {
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

//when document loads up
$(document).ready(function() {
    setGame();

    $('.squareTile').mousedown(function() {
        let id = $(this).attr("id"); //get the squaretile's id
        let tile = $('#' + id);

        //deselect all previously selected tiles
        $('.squareTile').removeClass('lightSelected');
        $('.squareTile').removeClass('darkSelected');

        //when selected a tile give it the selected class
        if(tile.hasClass('lightTile')) {
            tile.addClass('lightSelected');
        }
        else if (tile.hasClass('darkTile')) {
            tile.addClass('darkSelected');
        }
    });

    $(".pieceContainer").mousedown(function() {
        //make mouse grabbing
        $(this).css("cursor", "grabbing");
    });

    $(".pieceContainer").mouseup(function() {
        //reset mouse
        $(this).css("cursor", "grab");
    });

    $(".pieceContainer").draggable({
        start: function() {
            //make dragged piece on top
            $(this).css("z-index", 9999);
        },
        stop: function() {
            //if not dropped in the right place, revert back to original position
            $(this).css({ top: 0, left: 0 });
            $(this).css("z-index", 500);
            $(this).css("transform", `translate(0px, 0px)`);

            //reset mouse
            $(this).css("cursor", "grab");
        },

        //contain the piece from being dragged outside the screen
        containment: "#mainContainer",

        //offset the object by half its width and height over the mouse
        cursorAt: { top: 35.75, left: 33 }
    });

    $(".dropTile").droppable({
        accept: ".pieceContainer",
        greedy: true,
        drop: function(event, ui) {
            //if a piece is dropped over this drop zone and it has no children, add it as child
            if ($(this).children().length < 1) {
                $(this).append(ui.draggable);
            }

            //if is valid move
            console.log(ui.draggable.attr("id"));
        }
    });
});

//initialise the game by creating the board and the tiles
function setGame() {
    //board will be a 2d array
    let board = [];

    //rows
    for (let r = 0; r < ch_ROWS; r++) {
        //each row
        let row = [];

        //columns
        for (let c = 0; c < ch_COLUMNS; c++) {
            row.push(' '); //add an empty value to each column of a row

            //#region Creating tiles
            let idNo = r.toString() + "-" + c.toString();
            //creates <div id="0-0" class="tile"></div> in the board div
            //The square background has id SQ0-0
            let squareTile = document.createElement("div");
            squareTile.id = "SQ" + idNo;
            squareTile.classList.add("squareTile");

            //allow pieces to be dropped on it
            squareTile.classList.add("dropTile");

            //alternate light tile or dark tile (odd = light)
            if(c % 2 == 0) {
                squareTile.classList.add((r % 2 == 0) ? 'lightTile' : 'darkTile');
            }
            else {
                squareTile.classList.add((r % 2 == 0) ? 'darkTile' : 'lightTile');
            }

            //append squareTile to board
            $('#board').append(squareTile);
            //#endregion
        }
        board.push(row);
    }

    //set board
    ch_board.updateBoard(board);

    //piece instantiation
    createPiece(ch_board.getBoard(), "White", "King", "wK", 0, 7, 4);
    createPiece(ch_board.getBoard(), "White", "Pawn", "wp",  0, 6, 0);
    createPiece(ch_board.getBoard(), "White", "Pawn", "wp", 1, 6, 1);
}

//function to create a piece on the board
function createPiece(board, colour, type, notation, i, row, col)
{
    //type has to be the same as the image file name
    //id has to be a reference to a square tile
    //i is the identifier (int)

    //create new container div
    var pieceContainer = $('<div>');
    pieceContainer.addClass('pieceContainer');
    //give it its id
    let id = colour + type + i;
    pieceContainer.attr("id", id);
    //create the image element
    var pieceImg = $('<img>');
    //set the source of the image
    pieceImg.attr('src', '/images/ChessPieces/' + colour + type + '.png');
    //append the image to the container
    $('#SQ' + row + "-" + col).append(pieceContainer);
    $("#" + id).append(pieceImg);

    //set the piece in the board
    console.log()
    board[row][col] = notation + i;
    ch_board.updateBoard(board);
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