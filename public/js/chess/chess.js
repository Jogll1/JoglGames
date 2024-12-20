const ch_ROWS = 8;
const ch_COLUMNS = 8;

//#region Web worker
//create a worker instance
const ch_aiWorker = new Worker('../js/chess/bundle-chessWorker.js');

//set up the message event listener to recieve ai moves from the worker
ch_aiWorker.onmessage = function(event) {
    const bestMove = event.data;

    //perform ai's move
    if(bestMove != "game over") {
        movePiece(bestMove.pieceToMoveId, bestMove.tileToMoveToId);
    }
}

ch_aiWorker.onerror = function(event) {
    console.log(`Error with worker: ${event}`);
}
//#endregion

//#region globals
var ch_gameStarted = (function(){ 
    var gameStarted = false; 

    return { 
        setState : function(bToSet) {
            // console.log(bToSet);
            return gameStarted = bToSet;
        },

        getState : function() {
            return gameStarted;
        }
    }
})();

var ch_board = (function() {
    var board = [];

    return {
        updateBoard : function(array) {
            // logArray(board);
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

var ch_isMyTurn = (function(){
    var isMyTurn = false;

    return {
        setState : function(bToSet) {
            return isMyTurn = bToSet;
        },

        getState : function() {
            return isMyTurn;
        },

        swapState : function() {
            return isMyTurn = !isMyTurn;
        }
    }
})();

//keep list of pieces that have moved
var ch_movedPieces = (function() {
    var movedPieces = [];

    return {
        add : function(toAdd) {
            return movedPieces.push(toAdd);
        },

        reset : function() {
            return movedPieces = [];
        },

        get : function() {
            return movedPieces;
        }
    }
})();

//keep track of this player's colour
var ch_myColour = (function(){
    var myColour = "White";

    return {
        set : function(value) {
            return myColour = value;
        },

        get : function() {
            return myColour;
        },

        oppColour : function() {
            return myColour == "White" ? "Black" : "White";
        }
    }
})();

var ch_isPlayingRobot = (function() { 
    var isPlayingRobot = false; 

    return { 
        setState: function(bToSet) {
            return isPlayingRobot = bToSet;
        },

        getState : function() {
            return isPlayingRobot;
        }
    }
})();

//#region FEN conversion variables
//keep list of castles that are left
var ch_castles = (function() {
    var castles = ['K', 'Q', 'k', 'q'];

    return {
        remove : function(toRemove) {
            return castles = castles.filter((char) => char !== toRemove);
        },

        reset : function() {
            return castles = ['K', 'Q', 'k', 'q'];
        },

        get : function() {
            return castles;
        }
    }
})();

//keep track of this player's colour
var ch_epTargetSq = (function(){
    var epTargetSq = '-';

    return {
        set : function(value) {
            return epTargetSq = value;
        },

        get : function() {
            return epTargetSq;
        }
    }
})();

//number of halfmoves since the last capture or pawn advance
var ch_halfmoveClock = (function() {
    var halfmoveClock = 0;

    return {
        set : function(toSet) {
            return halfmoveClock = toSet;
        },

        increment : function() {
            return halfmoveClock += 1;
        },

        get : function() {
            return halfmoveClock;
        }
    }
})();

//number of the full moves. starts at 1 and is incremented after black move
var ch_fullmoveNo = (function() {
    var fullmoveNo = 1;

    return {
        set : function(toSet) {
            return fullmoveNo = toSet;
        },

        increment : function() {
            return fullmoveNo += 1;
        },

        get : function() {
            return fullmoveNo;
        }
    }
})();
//#endregion
//#endregion

//when document loads up
$(document).ready(function() {
    setGame();

    //#region Menu functions
    $('#playRobotButton').click(function() {
        $('.menuBackground').hide();
        $('.friendOrAIMenu').hide();

        setUpGame(true, "Player");
    });

    //play friend
    $('#playFriendButton').click(function() {
        $('.onlinePlayMenu').show();
        $('.friendOrAIMenu').hide();
    });

    //play online menu
    $('#onlinePlayMenuForm').submit(function(e) {
        e.preventDefault(); //prevent form submission

        let username = $('#usernameInput').val().trim();
        let roomName = $('#roomNameInput').val().trim();

        //if both input fields are empty, display an error
        if (username === '' || roomName === '') {
            e.preventDefault(); //prevent form submission
            //display an error message
            alert('Please fill in both input fields');
        }
        else if (username.length > 25) {
            e.preventDefault(); //prevent form submission
            //display an error message
            alert('Username must be shorter than 25 characters long');
        }
        else if (roomName.length > 25) {
            e.preventDefault(); //prevent form submission
            //display an error message
            alert('Room name must be shorter than 25 characters long');
        }
        else {
            //connect to socket - or at least attempt to
            connectToSocket(roomName, username);
        }

        //reset input fields
        $('#usernameInput').val('');
        $('#roomNameInput').val('');
    });

    //rematch menu
    $('#rematchButton').click(function() {
        //close the menu
        $('.menuBackground').hide();
        $('.rematchMenu').hide();

        //reset the board
        resetGame();

        if(ch_isPlayingRobot.getState()) {
            ch_isMyTurn.setState(true);
            ch_myColour.set("White");
        }
        else {
            //-----SOCKET-----
            //if not playing robot, send rematch to the server
            socketSendChessRematch();
            //----------------
        }
    });

    //home button
    $('#homeButton').click(function() {
        window.location.href = './index.html';
    });

    //help button
    $('.helpIconContainer').click(function() {
        $('.helpMenu').show();
        $('.menuBackground').show();
    });

    //close help menu button
    $('#closeButton').click(function() {
        $('.helpMenu').hide();
        $('.menuBackground').hide();
    });
    //#endregion

    //#region Tile functions
    $(document).on('mousedown', '.squareTile', function() {
        if(!ch_gameStarted.getState()) return;

        //get the squaretile's id
        const id = $(this).attr("id"); 
        const tile = $('#' + id);

        //if haven't clicked on already selected tile
        if(id !== ch_selectedTile.getState()) {
            //deselect all previously selected tiles
            $('.squareTile').removeClass('lightSelected');
            $('.squareTile').removeClass('darkSelected');

            //delete all current valid tile spots
            $('.validTile').remove();
            $('.validTakeTile').remove();

            //if our turn
            const childPieceId = $(this).children().length >= 1 ? $(this).children(0).attr("id") : "";
            if(ch_isMyTurn.getState()) {
                //if tile clicked has a piece in it (and not a highlight circle)
                if ($(this).children().length >= 1 && childPieceId.includes(ch_myColour.get()) && !childPieceId.includes('validTile') && !childPieceId.includes('validTakeTile') ) {
                    //when selected a tile give it the selected class
                    if(tile.hasClass('lightTile')) {
                        tile.addClass('lightSelected');
                    }
                    else if (tile.hasClass('darkTile')) {
                        tile.addClass('darkSelected');
                    }

                    //show all valid moves
                    if(tile !== null) showValidMoves(ch_board.getBoard(), tile);

                    // set the selected the tile in mouseup
                }
                else {
                    //if tile selected not empty
                    if(ch_selectedTile.getState() !== "" && ch_selectedTile.getState() !== null) {
                        //if empty, move selected piece to this square
                        const pieceToMove = $("#" + ch_selectedTile.getState()).children(0);
                        sendMove(pieceToMove.attr("id"), $(this).attr("id"));
                    }

                    //reset selected tile
                    ch_selectedTile.setState("");
                }
            }
        }
    });

    $(document).on('mouseup', '.squareTile', function() {
        if(!ch_gameStarted.getState()) return;

        //get the squaretile's id
        const id = $(this).attr("id");
        
        //if haven't clicked on already selected tile
        const childPieceId = $(this).children().length >= 1 ? $(this).children(0).attr("id") : "";
        if(id !== ch_selectedTile.getState()) {
            //if tile clicked has a piece in it (and not a highlight circle)
            if ($(this).children().length >= 1 && !childPieceId.includes('validTile') && !childPieceId.includes('validTakeTile')) {
                //check if our turn and we clicked our colour
                if(ch_isMyTurn.getState()) {
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

    $(document).on('mousedown', '.pieceContainer', function() {
        if(ch_isMyTurn.getState() && ch_gameStarted.getState()) {
            //make mouse grabbing
            $(this).css("cursor", "grabbing");
        }   
    });

    $(document).on('mouseup', '.pieceContainer', function() {
        //reset mouse
        $(this).css("cursor", "grab");
    });

    //initialise drag and drop
    initDragDrop();
    //#endregion
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

            //alternate light tile or dark tile (odd = dark)
            squareTile.classList.add((c + r) % 2 == 0 ? 'lightTile' : 'darkTile');

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
        createPiece(ch_board.getBoard(), true, "Pawn", `wp`,  i, 6, i);
    }

    createPiece(ch_board.getBoard(), true, "Rook", `wR`, 0, 7, 0);
    createPiece(ch_board.getBoard(), true, "Rook", `wR`, 1, 7, 7);
    createPiece(ch_board.getBoard(), true, "Bishop", `wB`, 0, 7, 2);
    createPiece(ch_board.getBoard(), true, "Bishop", `wB`, 1, 7, 5);
    createPiece(ch_board.getBoard(), true, "Knight", `wN`, 0, 7, 1);
    createPiece(ch_board.getBoard(), true, "Knight", `wN`, 1, 7, 6);
    createPiece(ch_board.getBoard(), true, "Queen", `wQ`, 0, 7, 3);
    createPiece(ch_board.getBoard(), true, "King", `wK`, 0, 7, 4);
    //#endregion

    //#region Black
    for (let i = 0; i < 8; i++) {
        createPiece(ch_board.getBoard(), false, "Pawn", `bp`,  i, 1, i);
    }

    createPiece(ch_board.getBoard(), false, "Rook", `bR`, 0, 0, 0);
    createPiece(ch_board.getBoard(), false, "Rook", `bR`, 1, 0, 7);
    createPiece(ch_board.getBoard(), false, "Bishop", `bB`, 0, 0, 2);
    createPiece(ch_board.getBoard(), false, "Bishop", `bB`, 1, 0, 5);
    createPiece(ch_board.getBoard(), false, "Knight", `bN`, 0, 0, 1);
    createPiece(ch_board.getBoard(), false, "Knight", `bN`, 1, 0, 6);
    createPiece(ch_board.getBoard(), false, "Queen", `bQ`, 0, 0, 3);
    createPiece(ch_board.getBoard(), false, "King", `bK`, 0, 0, 4);
    //#endregion
}

//function to initialise dragging and dropping logic on pieces
function initDragDrop() {
    $(".pieceContainer").draggable({
        start: function(event, ui) {
            //check if our turn and we clicked our colour
            if (ch_isMyTurn.getState() && $(this).attr("id").includes(ch_myColour.get()) && ch_gameStarted.getState()) {                
                //make dragged piece on top
                $(this).css("z-index", 9999);
            } else {
                //disable dragging
                return false;
            }
        },
        drag: function(event, ui) {
            // highlight this tile whilst dragging just to stop that bug
            let tile = $('#' + $(this).parent().attr("id"));
            if(tile.hasClass('lightTile')) {
                tile.addClass('lightSelected');
            }
            else if (tile.hasClass('darkTile')) {
                tile.addClass('darkSelected');
            }

            // if black, reverse the position of the dragged piece
            if(ch_myColour.get() == "Black") {
                const newX = -(ui.position.left);
                const newY = -(ui.position.top);
                ui.position.left = newX;
                ui.position.top = newY;
            }
        },
        stop: function() {
            //if not dropped in the right place, revert back to original position
            $(this).css({ top: 0, left: 0 });
            $(this).css("z-index", 500);

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
            sendMove(ui.draggable.attr("id"), $(this).attr("id"));
        }
    });
}

//function to call our move and retrieve opponent's move
function sendMove(_pieceToMoveId, _tileToMoveToId) {
    if(_pieceToMoveId !== undefined && _pieceToMoveId !== null) {
        if(_pieceToMoveId.includes(ch_myColour.get()) && movePiece(_pieceToMoveId, _tileToMoveToId)){
            //if not playing robot, send move to opponent, else get robot move
            if(ch_isPlayingRobot.getState()) {
                //send the board state to the aiworker for it to calculate its move
                let depth = 3; //3
                        
                //set the message to be sent
                const message = {
                    _board: ch_board.getBoard(),
                    _depth: depth,
                    _colourToMove: ch_myColour.oppColour(),
                    _castles: ch_castles.get(),
                    _epTargetSq: ch_epTargetSq.get(),
                    _halfmoveClock: ch_halfmoveClock.get(),
                    _fullmoveNo: ch_fullmoveNo.get()
                }
    
                //add minimum time limit to send the move
                let minTime = 450;
                setTimeout(function() { 
                    ch_aiWorker.postMessage(message);
                }, minTime);
            }
            else {
                //-----SOCKET-----
                socketSendChessMove(_pieceToMoveId, _tileToMoveToId);
                //----------------
            }
        }
    }
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
    pieceImg.addClass('noHighlightOrDrag');

    //set the piece in the board
    board[row][col] = `${notation}${i}`;
    ch_board.updateBoard(board);

    //rotate piece if black
    if(ch_myColour.get() === "Black") pieceContainer.addClass('rotatePiece');

    initDragDrop();
}

//function to set up the game
function setUpGame(_isPlayingRobot, _playerName) {
    $('.scoreAndIconParent').show();

    //set player name
    $('#playerNameText').text(_playerName);

    //set icons and player names
    if(_isPlayingRobot) {  
        //set player first
        $('#playerIcon').addClass('currentGo');
           
        //set opponent name
        $('#opponentNameText').text('Robot');

        //change icon
        $('#oppImg').attr('src', '/images/webp/RobotIcon.webp');

        //start game against robot
        ch_gameStarted.setState(true);
        ch_isMyTurn.setState(true);
        ch_isPlayingRobot.setState(true);
    }
    else {
        //set opponent name
        $('#opponentNameText').text('...');
    }
}

//function to move a piece to the correct square
function movePiece(pieceToMoveId, tileToMoveToId) {
    if(pieceToMoveId == null) return;
    //get piece original coords
    let pieceToMove = $(`#${pieceToMoveId}`);
    let originalId = pieceToMove.parent().attr("id");
    let originalCoords = originalId.substring(2).split("-");

    //get coords of tile trying to move to
    let tileToMoveTo = $(`#${tileToMoveToId}`);
    let id = tileToMoveTo.attr("id");
    let coords = id.substring(2).split("-");

    //get the board and id of the piece moving
    let board = ch_board.getBoard();
    let pieceId = board[originalCoords[0]][originalCoords[1]]; //wp0 or bN1 etc

    const validMoves = getValidMoves(board, originalCoords[0], originalCoords[1], true);

    //is capturing if tile is not empty
    const isCapturing = !board[coords[0]][coords[1]] === ' ';
    
    //if piece trying to move to is in validmoves
    if(validMoves != null) {
        if(validMoves.includes(id.substring(2))) {
            //delete all current valid tile spots
            $('.validTile').remove();
            $('.validTakeTile').remove();

            const ourColour = (pieceId.includes('w')) ? "White" : "Black";

            //#region Castling
            //check if castling
            const kingRow = (ourColour === "White") ? 7 : 0;
            if(canCastle(pieceId)) {
                if(id.substring(2) == `${kingRow}-2` || id.substring(2) == `${kingRow}-0`) {
                    //queenside
                    id = `SQ${kingRow}-2`;
                    coords[0] = kingRow;
                    coords[1] = 2;
                    tileToMoveTo = $('#' + id);

                    //move rook
                    const rookPiece = $(`#SQ${kingRow}-0`).children(0);
                    const rookTileToMoveTo = $(`#SQ${kingRow}-3`);
                    moveRookForCastling(rookPiece, rookTileToMoveTo);
                }
                else if(id.substring(2) == `${kingRow}-6` || id.substring(2) == `${kingRow}-7`) {
                    //kngside
                    id = `SQ${kingRow}-6`;
                    coords[0] = kingRow;
                    coords[1] = 6;
                    tileToMoveTo = $('#' + id);

                    //move rook
                    const rookPiece = $(`#SQ${kingRow}-7`).children(0);
                    const rookTileToMoveTo = $(`#SQ${kingRow}-5`);
                    moveRookForCastling(rookPiece, rookTileToMoveTo);
                }
            }
            //#endregion

            //#region En passant
            if(isEnPassanting(board, pieceId, coords)[0]) {
                //capture the pawn
                const coordsToTake = isEnPassanting(board, pieceId, coords)[1]
                $(`#SQ${coordsToTake}`).empty();
                //capture pawn and update the board
                coordsToUpdate = coordsToTake.split('-');
                const index = findIndex2DArray(board, board[coordsToUpdate[0]][coordsToUpdate[1]]);
                let newBoard = board;
                newBoard[index.row][index.column] = ' ';
                ch_board.updateBoard(newBoard);
            }
            //#endregion

            //update board
            ch_board.updateBoard(updateBoardArray(board, pieceId, coords[0], coords[1]));

            //delete tile's children
            $(`#${id}`).empty();

            //append child to div
            tileToMoveTo.append(pieceToMove);

            //#region Promotion
            promotePiece(board, pieceId, coords);
            //#endregion

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

            //add pieces id to movedPieces
            ch_movedPieces.add(pieceId);

            //alternate who has the border around their icon
            if($('#playerIcon').hasClass('currentGo')) {
                $('#playerIcon').removeClass('currentGo');
                $('#opponentIcon').addClass('currentGo');
            }
            else if ($('#opponentIcon').hasClass('currentGo')) {
                $('#opponentIcon').removeClass('currentGo');
                $('#playerIcon').addClass('currentGo');
            }

            const checkColour = ch_isMyTurn.getState() ? ch_myColour.oppColour() : ch_myColour.get();
            checkGameOver(ch_board.getBoard(), checkColour);

            //#region FEN conversion
            //set castles array
            const colourChar = (ourColour === "White") ? 'w' : 'b';        
            if(ch_movedPieces.get().includes(`${colourChar}K${0}`)) {
                //if can't castle anymore
                ch_castles.remove(ourColour == "White" ? 'Q' : 'q');
                ch_castles.remove(ourColour == "White" ? 'K' : 'k');
            }
            else if (ch_movedPieces.get().includes(`${colourChar}R${0}`)) {
                ch_castles.remove(ourColour == "White" ? 'Q' : 'q');
            }
            else if (ch_movedPieces.get().includes(`${colourChar}R${1}`)) {
                ch_castles.remove(ourColour == "White" ? 'K' : 'k');
            }

            //update ep target square if pawn takes the double step
            if(pieceToMoveId.includes('Pawn')) {
                if(Math.abs(parseInt(coords[0]) - parseInt(originalCoords[0])) === 2 && originalCoords[1] == coords[1]) {
                    //probably need a better way to convert nums to algebraic coord
                    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                    const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
                    ch_epTargetSq.set(`${files[coords[1]]}${ranks[parseInt(coords[0]) + parseInt(ourColour === "White" ? 1 : -1)]}`);
                }
                else {
                    ch_epTargetSq.set('-');
                }
            }
            else {
                ch_epTargetSq.set('-');
            }

            //increment fullmove number if blacks moved
            if(pieceToMoveId.includes("Black")) {
                ch_fullmoveNo.increment();
            }

            //increment halfmove clock if no pawn has been moved or no capture has occurred
            if(!pieceToMoveId.includes("Pawn") && !isCapturing) {
                ch_halfmoveClock.increment();
            }
            else {
                ch_halfmoveClock.set(0);
            }
            //#endregion

            //alternate turn
            ch_isMyTurn.swapState();

            //moved
            return true;
        }
    }

    //reset selected tile
    ch_selectedTile.setState("");
    
    // logArray(ch_board.getBoard());

    //not moved
    return false;
}

//function to update the board array
function updateBoardArray(board, id, endRow, endCol){
    const index = findIndex2DArray(board, id);
    let newBoard = board;

    newBoard[index.row][index.column] = " ";
    newBoard[endRow][endCol] = id;

    return newBoard;
}

//function to check all the valid moves of a given piece and highlights them when selected
function showValidMoves(board, tile) {
    //get piece original coords (tile should be a reference to a square tile)
    const originalId = tile.attr("id");
    let originalCoords = originalId.substring(2).split("-");

    //get the valid moves
    const validMoves = getValidMoves(board, originalCoords[0], originalCoords[1], true);
    
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

//function to get all valid moves based on the piece type
function getValidMoves(board, startRow, startCol, runRecursively) {
    //piece id should be like wp2
    let _validMoves = [];

    let pieceId = board[startRow][startCol]; //wp0 or bN1 etc

    const isWhite = pieceId.includes('w');
    const isFirstTurn = !ch_movedPieces.get().includes(pieceId);
    const pattern = new Pattern(board, isWhite, startRow, startCol, runRecursively);
    
    if(pieceId.includes('p')) {
        _validMoves = pattern.getValidPawnMoves(isFirstTurn);
    }
    else if(pieceId.includes('N')) {
        _validMoves = pattern.getValidKnightMoves();
    }
    else if(pieceId.includes('B')) {
        _validMoves = pattern.getValidBishopMoves();
    }
    else if(pieceId.includes('R')) {
        _validMoves = pattern.getValidRookMoves();
    }
    else if(pieceId.includes('Q')) {
        _validMoves = pattern.getValidQueenMoves();
    }
    else if(pieceId.includes('K')) {
        _validMoves = pattern.getValidKingMoves(isFirstTurn);
    }
    else {
        console.log("Error: invalid piece type");
    }

    return _validMoves;
}

//function to check if we can castle
function canCastle(pieceId) {
    const isKing = (pieceId.includes('K')) ? true : false;
    const pieceMoved = ch_movedPieces.get().includes(pieceId)

    return isKing && !pieceMoved
}

//function to check if we are trying to en passant
function isEnPassanting(board, pieceId, coords) {
    const isPawn = pieceId.includes('p');
    const ourColour = (pieceId.includes('w')) ? "White" : "Black";
    const colourDelta = parseInt((ourColour == "White") ? 1 : -1);
    const rowCheck = parseInt(coords[0]) + colourDelta;

    if(rowCheck >= 0 && rowCheck <= 7) {
        const pieceToTake = board[rowCheck][coords[1]];

        if(isPawn && pieceToTake != ' ') {
            if(pieceToTake.includes('p')) 
            {
                const oppColour = (pieceToTake.includes('w')) ? "White" : "Black";
                if(oppColour != ourColour) {
                    //check the pawn we are checking has only moved once
                    instances = 0
                    for (let j = 0; j < ch_movedPieces.get().length; j++) {
                        if(ch_movedPieces.get()[j] == pieceToTake) {
                            instances += 1;
                        }
                    }
    
                    //if the pawn next to this pawn is in moved pieces only once and is at the end 
                    if(instances == 1 && ch_movedPieces.get()[ch_movedPieces.get().length - 1] == pieceToTake) {
                        //allow en passant
                        //return true and coords of pawn to capture
                        return [true, `${rowCheck}-${coords[1]}`];
                    }
                }
            }
        }
    }

    return [false, "nan"];
}

//function to move the rook when castling
function moveRookForCastling(pieceToMove, tileToMoveTo) {
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

    //update board
    ch_board.updateBoard(updateBoardArray(board, pieceId, coords[0], coords[1]));

    //delete tile's children
    $("#" + id).empty();

    //append child to div
    tileToMoveTo.append(pieceToMove);

    //add pieces id to movedPieces
    ch_movedPieces.add(pieceId);
}

//function to promote a pawn
function promotePiece(board, pieceId, coords) {
    const isPawn = pieceId.includes('p');
    const isWhite = pieceId.includes('w');
    const row = (isWhite) ? 0 : 7;

    if(isPawn) {
        if(coords[0] == row) {
            //promote to queen for now

            //delete pawn
            const tileId = `SQ${coords[0]}-${coords[1]}`;
            $(`#${tileId}`).empty();

            //create a queen in that position
            const queenType = `${(isWhite) ? 'w' : 'b'}Q`;
            let queenInt = 0;
            //count how many queens already in the game
            for (let r = 0; r < ch_ROWS; r++) {
                for (let c = 0; c < ch_COLUMNS; c++) {
                    if(board[r][c].includes(queenType)) {
                        queenInt += 1;
                    }
                }
            }

            //create the piece which also updates board array
            createPiece(ch_board.getBoard(), isWhite, "Queen", queenType, queenInt, coords[0], coords[1]);
        }
    }
}

//function to check if anyone has drawn or won
function checkGameOver(_board, _colour) {
    let validMoves = []

    const colourCheck = (_colour == "White") ? 'w' : 'b';

    for (let r = 0; r < ch_ROWS; r++) {
        for (let c = 0; c < ch_COLUMNS; c++) {
            if(_board[r][c].includes(colourCheck) && _board[r][c] !== ' ') {
                validMoves = validMoves.concat(getValidMoves(_board, r, c, true));
            }
        }
    }

    let piecesOnBoard = 0;
    for (let r = 0; r < ch_ROWS; r++) {
        for (let c = 0; c < ch_COLUMNS; c++) {
            if(_board[r][c] !== ' ') {
                piecesOnBoard += 1;
            }
        }
    }

    const kingCheck = `${colourCheck}K`;
    const underThreatTiles = getUnderThreatTiles(_board, _colour);
    const kingUnderThreat = underThreatTiles.some(tile => _board[tile.split('-')[0]][tile.split('-')[1]].includes(kingCheck));

    if(validMoves.length == 0) {
        if(kingUnderThreat) {
            console.log(`Checkmate. ${_colour == "White" ? "Black" : "White"} wins`);
            setWinner(`${_colour == "White" ? "Black" : "White"}`);
        }
        else {
            console.log(`Stalemate.`);
            setWinner("Stalemate");
        }
    }
    else if(piecesOnBoard < 3) {
        console.log(`Stalemate.`);
        setWinner("Stalemate");
    }
}

//function to set the winner
function setWinner(_winningColour) {
    //initialise winner string
    let winnerString = " ";
    ch_gameStarted.setState(false);

    //increment score counters based on who won
    if(_winningColour == "Stalemate") {
        let scoreOpponent = parseInt($("#opponentScoreText").text());
        $("#opponentScoreText").text(scoreOpponent + 1);

        let scorePlayer = parseInt($("#playerScoreText").text());
        $("#playerScoreText").text(scorePlayer + 1);

        winnerString = "Stalemate";
    }
    else {
        if(_winningColour !== ch_myColour.get()) { //opponent
            let score = parseInt($("#opponentScoreText").text());
            $("#opponentScoreText").text(score + 1);
    
            if(ch_isPlayingRobot.getState()) {
                //if playing ai, say robot won
                winnerString = "Robot wins!"; 
            }
            else {
                //if playing online, say other player won
                winnerString = `${_winningColour} wins!`;
            }
        }
        else if (_winningColour === ch_myColour.get()) { //player
            let score = parseInt($("#playerScoreText").text());
            $("#playerScoreText").text(score + 1);
    
            winnerString = "You win!";
        }
    }

    endGame(winnerString);
}

//function to end the game and allow for another game
function endGame(winnerString) {
    //remove blue circle from icons
    $('#playerIcon').removeClass('currentGo');
    $('#opponentIcon').removeClass('currentGo');

    //load rematch menu after a bit
    setTimeout(function() { 
        $('.menuBackground').show();
        $('.rematchMenu').show();
    }, 700);

    //set rematch menu title
    $('#rematchMenuTitle').text(winnerString);
}

//function to reset the board
function resetGame() {
    //reset the board
    $('#board').empty();
    setGame();

    //reset selected tile
    ch_selectedTile.setState(" ");

    //reset moved pieces
    ch_movedPieces.reset();

    //check if we are the second player to join
    if(ch_myColour.get() == "Black") {
        //rotate chess board
        $('#board').addClass('rotateBlack');
        $('.pieceContainer').addClass('rotatePiece');
    }

    //reset castles array
    ch_castles.reset();
    //reset en passant target square
    ch_epTargetSq.set('-');
    //reset halfmove clock
    ch_halfmoveClock.set(0);
    //reset fullmove number
    ch_fullmoveNo.set(1);

    //set game started
    ch_gameStarted.setState(true);

    if(ch_isPlayingRobot.getState()) 
    {
        //if you're playing robot, set player first
        $('#playerIcon').addClass('currentGo');

        //set whites turn
        //so far only player is white
        if(ch_myColour.get() == "White") {
            ch_isMyTurn.setState(true);
        }
    } 
    else {
        //alternate colour
        ch_myColour.set(ch_myColour.get() === "White" ? "Black" : "White");

        //reinorientate board
        $('#board').removeClass('rotateBlack');
        $('.pieceContainer').removeClass('rotatePiece');
        if(ch_myColour.get() === "Black") {
            $('#board').addClass('rotateBlack');
            $('.pieceContainer').addClass('rotatePiece');
        }

        //if you're playing online, set whites turn
        if(ch_myColour.get() == "White") {
            ch_isMyTurn.setState(true);
            $('#playerIcon').addClass('currentGo');
        }
        else {
            ch_isMyTurn.setState(false);
            $('#opponentIcon').addClass('currentGo');
        }
    }   
}
