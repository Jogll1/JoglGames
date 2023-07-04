const ch_ROWS = 8;
const ch_COLUMNS = 8;

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

    $(".piece1").draggable({
        // start: function() {
        //         originalPosition = $(this).position();
        //         console.log(originalPosition);
        //     },
        stop: function(event, ui) {
            //var droppedOnCorrectPosition = isDroppedOnCorrectPosition(ui.offset.left, ui.offset.top);
            var droppedOnCorrectPosition = false;
            if (!droppedOnCorrectPosition) {
                //if not dropped in the right place, revert back to original position
                $(this).css({ top: 0, left: 0 });
            }
        },

        //contain the piece from being dragged outside the screen
        containment: "#mainContainer"
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

    //piece test
    var pieceContainer = $('<div>');
    pieceContainer.addClass("piece1");
    // // Create the image element
    var piece1 = $('<img>');
    // Set the source of the image
    piece1.attr('src', '/images/ChessPieces/WhiteKing.png');
    // Append the image to the container
    // $('#board').append(piece1);
    // $('#board').append(pieceContainer);
    $('#SQ0-0').append(pieceContainer);
    $('.piece1').append(piece1);

    logArray(board);
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