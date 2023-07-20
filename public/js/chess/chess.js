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

var ch_selectedTile = (function() {
    var selectedTile = "";

    return {
        setState : function(toSet) {
            return selectedTile = toSet;
        },

        getState : function() {
            return selectedTile;
        }
    }
})();

var ch_isWhiteTurn = (function(){
    var isWhiteTurn = false;

    return {
        setState: function(bToSet) {
            return isWhiteTurn = bToSet;
        },

        getState : function() {
            return isWhiteTurn;
        },

        swapState : function() {
            return isWhiteTurn = !isWhiteTurn;
        }
    }
})();
//#endregion

//when document loads up
$(document).ready(function() {
    setGame();

    $('.squareTile').mousedown(function() {
        //get the squaretile's id
        let id = $(this).attr("id"); 
        let tile = $('#' + id);

        //if haven't clicked on already selected tile
        if(id !== ch_selectedTile.getState()) {
            //deselect all previously selected tiles
            $('.squareTile').removeClass('lightSelected');
            $('.squareTile').removeClass('darkSelected');

            //delete all current valid tile spots
            $('.validTile').remove();
            $('.validTakeTile').remove();

            //if tile clicked has a piece in it (and not a highlight circle)
            if ($(this).children().length >= 1 && !$(this).children(0).attr("id").includes('validTile') && !$(this).children(0).attr("id").includes('validTakeTile') && isMyTurn($(this).children(0).attr("id"))) {
                //when selected a tile give it the selected class
                if(tile.hasClass('lightTile')) {
                    tile.addClass('lightSelected');
                }
                else if (tile.hasClass('darkTile')) {
                    tile.addClass('darkSelected');
                }

                //show all valid moves
                showValidMoves(ch_board.getBoard(), tile);

                // set the selected the tile in mouseup
            }
            else {
                //if tile selected not empty
                if(ch_selectedTile.getState() != "")
                {
                    //if empty, move selected piece to this square
                    let pieceToMove = $("#" + ch_selectedTile.getState()).children(0);

                    //only move piece if colour matches whos turn it is
                    if(isMyTurn(pieceToMove.attr("id"))) {
                        movePiece(pieceToMove, $(this));
                    }
                }

                //reset selected tile
                ch_selectedTile.setState("");
            }
        }
    });

    $('.squareTile').mouseup(function() {
        //get the squaretile's id
        let id = $(this).attr("id");
        let tile = $('#' + id);
        
        //if haven't clicked on already selected tile
        if(id !== ch_selectedTile.getState()) {
            //if tile clicked has a piece in it (and not a highlight circle)
            if ($(this).children().length >= 1 && !$(this).children(0).attr("id").includes('validTile') || !$(this).children(0).attr("id").includes('validTakeTile')) {
                //check if our turn and we clicked our colour
                if(isMyTurn($(this).children(0).attr("id"))) {
                    //select this tile
                    ch_selectedTile.setState(id);
                }
            }
        }
        else {
            //deselect all previously selected tiles
            $('.squareTile').removeClass('lightSelected');
            $('.squareTile').removeClass('darkSelected');

            //delete all current valid tile spots
            $('.validTile').remove();
            $('.validTakeTile').remove();

            //reset selected tile
            ch_selectedTile.setState("");
        }
    });

    $(".pieceContainer").mousedown(function() {
        if(isMyTurn($(this).attr("id"))) {
            //make mouse grabbing
            $(this).css("cursor", "grabbing");
        }   
    });

    $(".pieceContainer").mouseup(function() {
        //reset mouse
        $(this).css("cursor", "grab");
    });

    $(".pieceContainer").draggable({
        start: function(event, ui) {
            //check if our turn and we clicked our colour
            if (isMyTurn($(this).attr("id"))) {                
                //make dragged piece on top
                $(this).css("z-index", 9999);
            } else {
                //disable dragging
                return false;
            }
        },
        drag: function() {
            // highlight this tile whilst dragging just to stop that bug
            let tile = $('#' + $(this).parent().attr("id"));
            if(tile.hasClass('lightTile')) {
                tile.addClass('lightSelected');
            }
            else if (tile.hasClass('darkTile')) {
                tile.addClass('darkSelected');
            }
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
            movePiece(ui.draggable, $(this));
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
    //#region White
    for (let i = 0; i < 8; i++) {
        createPiece(ch_board.getBoard(), true, "Pawn", "wp",  i, 6, i);
    }

    createPiece(ch_board.getBoard(), true, "Rook", "wR", 0, 7, 0);
    createPiece(ch_board.getBoard(), true, "Rook", "wR", 1, 7, 7);
    createPiece(ch_board.getBoard(), true, "Bishop", "wB", 0, 7, 1);
    createPiece(ch_board.getBoard(), true, "Bishop", "wB", 1, 7, 6);
    createPiece(ch_board.getBoard(), true, "Knight", "wN", 0, 7, 2);
    createPiece(ch_board.getBoard(), true, "Knight", "wN", 1, 7, 5);
    createPiece(ch_board.getBoard(), true, "Queen", "wQ", 0, 7, 3);
    createPiece(ch_board.getBoard(), true, "King", "wK", 0, 7, 4);
    //#endregion

    //#region Black
    for (let i = 0; i < 8; i++) {
        createPiece(ch_board.getBoard(), false, "Pawn", "bp",  i, 1, i);
    }

    createPiece(ch_board.getBoard(), false, "Rook", "bR", 0, 0, 0);
    createPiece(ch_board.getBoard(), false, "Rook", "bR", 1, 0, 7);
    createPiece(ch_board.getBoard(), false, "Bishop", "bB", 0, 0, 1);
    createPiece(ch_board.getBoard(), false, "Bishop", "bB", 1, 0, 6);
    createPiece(ch_board.getBoard(), false, "Knight", "bN", 0, 0, 2);
    createPiece(ch_board.getBoard(), false, "Knight", "bN", 1, 0, 5);
    createPiece(ch_board.getBoard(), false, "Queen", "bQ", 0, 0, 3);
    createPiece(ch_board.getBoard(), false, "King", "bK", 0, 0, 4);
    //#endregion

    //set white go first
    ch_isWhiteTurn.setState(true);
}

//function to create a piece on the board
function createPiece(board, isWhite, type, notation, i, row, col) {
    //type has to be the same as the image file name
    //id has to be a reference to a square tile
    //i is the identifier (int)

    //set colour
    colour = (isWhite) ? "White" : "Black";

    //create new container div
    var pieceContainer = $('<div>');
    pieceContainer.addClass('pieceContainer');
    pieceContainer.addClass('noHighlightOrDrag');
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

//function to move a piece to the correct square
function movePiece(pieceToMove, tileToMoveTo) {
    //get piece original coords
    let originalId = pieceToMove.parent().attr("id");
    let originalCoords = originalId.substring(2).split("-");

    //get coords of tile trying to move to
    let id = tileToMoveTo.attr("id");
    let coords = id.substring(2).split("-");

    //update board
    //get the piece id
    let board = ch_board.getBoard();
    let pieceId = board[originalCoords[0]][originalCoords[1]]; //wp0 or bN1 etc

    //check if white
    const isWhite = pieceId.includes('w');

    const pattern = new Pattern(ch_board.getBoard(), isWhite, originalCoords[0], originalCoords[1]);
    //if is pawn && ((is white && in row index 6) || (is black && in row index 1))
    const isFirstTurn = (pieceId.includes('p') && ((pieceId.includes('w') && originalCoords[0] == 6) || (pieceId.includes('b') && originalCoords[0] == 1)))
    // const validMoves = pattern.getValidPawnMoves(isFirstTurn);
    const validMoves = pattern.getValidQueenMoves();
    
    //if piece trying to move to is in validmoves
    if(validMoves != null) {
        if(validMoves.includes(id.substring(2))) {
            //delete all current valid tile spots
            $('.validTile').remove();
            $('.validTakeTile').remove();

            ch_board.updateBoard(updateBoardArray(board, pieceId, coords[0], coords[1]));

            //delete tile's children
            $("#" + id).empty();

            //append child to div
            tileToMoveTo.append(pieceToMove);

            //deselect all previously selected tiles
            $('.squareTile').removeClass('lightSelected');
            $('.squareTile').removeClass('darkSelected');

            //highlight the tile
            if(tileToMoveTo.hasClass('lightTile')) {
                tileToMoveTo.addClass('lightSelected');
            }
            else if (tileToMoveTo.hasClass('darkTile')) {
                tileToMoveTo.addClass('darkSelected');
            }

            //alternate turn
            ch_isWhiteTurn.swapState()
        }
    }

    //reset selected tile
    ch_selectedTile.setState("");

    // logArray(ch_board.getBoard());
}

//function to update the board array
function updateBoardArray(board, id, endRow, endCol){
    let index = findIndex2DArray(board, id);
    let newBoard = board;

    newBoard[index.row][index.column] = " ";
    newBoard[endRow][endCol] = id;

    return newBoard;
}

//function to check all the valid moves of a given piece and highlights them when selected
function showValidMoves(board, tile) {
    //get piece original coords (tile should be a reference to a square tile)
    let originalId = tile.attr("id");
    let originalCoords = originalId.substring(2).split("-");

    //get the piece id
    let pieceId = board[originalCoords[0]][originalCoords[1]]; //wp0 or bN1 etc
    const isWhite = pieceId.includes('w');
    const isFirstTurn = (pieceId.includes('p') && ((pieceId.includes('w') && originalCoords[0] == 6) || (pieceId.includes('b') && originalCoords[0] == 1)))

    const pattern = new Pattern(ch_board.getBoard(), isWhite, originalCoords[0], originalCoords[1]);
    // const validMoves = pattern.getValidPawnMoves(isFirstTurn);
    const validMoves = pattern.getValidQueenMoves();
    
    if(validMoves != null) {
        for (let i = 0; i < validMoves.length; i++) {
            const coords = validMoves[i]
            const id = "#SQ" + validMoves[i];

            const childCount = $(id).children().length;
        
            //create a new div
            let validTile = $('<div>');
            validTile.attr("id", `validTile${coords[0]}-${coords[1]}`);

            //if div has more than one child add validTakeTile too
            if(childCount >= 1) {
                validTile.addClass('validTakeTile');
            } 
            else {
                validTile.addClass('validTile');
            }
    
            $(id).append(validTile);
        }
    }

    //TODO - add a larger validTile thing to pieces to capture
}

//function to only let player move their piece on their turn
function isMyTurn(pieceId) {
    //get piece colour
    let colour = (pieceId.includes(("White"))) ? "White" : "Black";
    
    //check if our turn
    if(colour == "White" && ch_isWhiteTurn.getState() || colour == "Black" && !ch_isWhiteTurn.getState()) {
        return true;
    }
    else {
        return false;
    }
}