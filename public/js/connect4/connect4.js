const c4_ROWS = 6;
const c4_COLUMNS = 7;

//#region Web worker
//create a worker instance
const c4_aiWorker = new Worker('../js/connect4/conn4AI-worker.js');

//set up the message event listener to recieve ai moves from the worker
c4_aiWorker.onmessage = function(event) {
    const aiMove = event.data;

    //perform ai's move
    setPiece(aiMove, "R");
}
//#endregion

//#region globals
//test for using global modules
var c4_gameStarted = (function() { //create a module
    var gameStarted = false; //create a variable inside the module (within scope)

    return { //return a fuction that sets the variable
        setState : function(bToSet) {
            return gameStarted = bToSet;
        },

        getState : function() {
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

var c4_isMyTurn = (function(){
    var isMyTurn = false; //create a variable inside the module (within scope)

    return { //return a fuction that sets the variable
        setState: function(bToSet) {
            return isMyTurn = bToSet;
        },

        getState : function() {
            return isMyTurn;
        }
    }
})();

var c4_isPlayingRobot = (function() { //check if it is the first (human) player's go
    var isPlayingRobot = false; //create a variable inside the module (within scope)

    return { //return a fuction that sets the variable
        setState: function(bToSet) {
            return isPlayingRobot = bToSet;
        },

        getState : function() {
            return isPlayingRobot;
        }
    }
})();

var c4_myPiece = (function() { 
    var myPiece = "Y"; //create a variable inside the module (within scope)

    return { //return a fuction that sets the variable
        setState: function(value) {
            return myPiece = value;
        },

        getState : function() {
            return myPiece;
        }
    }
})();

var c4_botDif = (function() { 
    var botDif = 7; //create a variable inside the module (within scope)

    return { //return a fuction that sets the variable
        setState: function(value) {
            return botDif = value;
        },

        getState : function() {
            return botDif;
        }
    }
})();
//#endregion

//when document loads up 
$(document).ready(function() {
    setGame();

    //#region Menu functions
    $('#playRobotButton').click(function() {
        $('.friendOrAIMenu').hide();
        $('.robotDifficultyMenu').show();
    });

    //#region Difficulty buttons
    $('#easyButton').click(function() {
        $('.menuBackground').hide();
        $('.robotDifficultyMenu').hide();

        setUpGame(true, 'Player', 3);
    });

    $('#mediumButton').click(function() {
        $('.menuBackground').hide();
        $('.robotDifficultyMenu').hide();

        setUpGame(true, 'Player', 6);
    });

    $('#hardButton').click(function() {
        $('.menuBackground').hide();
        $('.robotDifficultyMenu').hide();

        setUpGame(true, 'Player', 7);
    });
    //#endregion

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

        //-----SOCKET-----
        //if not playing robot, send rematch to the server
        if(!c4_isPlayingRobot.getState()) socketSendConn4Rematch();
        //----------------
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
    //change the colour of the tile when its clicked on
    $('.squareTile').click(function() {
        if(!c4_isMyTurn.getState()) return; //if it isn't our's turn

        let id = $(this).attr("id"); //get the squaretile's id
        let columnNo = id.substring(2).split("-")[1]; //remove the SQ from the front

        //check if the column is full
        if(!isColumnFull(columnNo)) {
            //this commented code needs to be uncommented aswell as the first line of this function for allowing ai turns
            setPiece(columnNo, c4_myPiece.getState()); //yellow is player one (human)

            if(c4_isPlayingRobot.getState()) { //if playing against the robot
                if(!c4_isMyTurn.getState()) { //if not player one's turn, call ai turn
                    //send the board state to the aiworker for it to calculate its move
                    let depth = c4_botDif.getState(); //max 8 nearly 9, 7 is good
                    
                    //set the message to be sent
                    const message = {
                        _board: c4_board.getBoard(),
                        _depth: depth
                    }
    
                    //add minimum time limit to send the move
                    let minTime = 450;
                    setTimeout(function() { 
                        c4_aiWorker.postMessage(message) 
                    }, minTime);
                }
            } 
            else { //if playing a player online
                //-----SOCKET-----
                //if not playing robot, send move to the server
                socketSendConn4Move(columnNo, c4_myPiece.getState());
                //----------------
            }
        }
    });

    //when hovering over a column
    $('.squareTile').mouseenter(function() {
        //don't hover if game hasn't started or it isn't our go
        if(!c4_gameStarted.getState()) return;
        if(!c4_isMyTurn.getState()) return;

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

//start time
function startGameTimer(duration) {
    var timer = duration; //in seconds
    //let minutes, seconds;
    var seconds;

    $('.startTimer').show();
    $('.startTimer').text(duration);
    let countdown = setInterval(function () {
        //minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        //put a zero at the front if below 10
        //minutes = minutes < 10 ? "0" + minutes : minutes;
        //seconds = seconds < 10 ? "0" + seconds : minutes;

        //display.textContent = minutes + ":" + seconds;
        $('.startTimer').text(seconds > 1 ? seconds - 1 : "You start!"); //make sure timer doesn't go below 0

        if(--timer < 0) {
            clearInterval(countdown);
            $('.startTimer').hide();

            //timer end
            c4_gameStarted.setState(true);
            c4_isMyTurn.setState(true);
        }
    }, 1000);
}

//initialise the game by creating the board and the tiles
function setGame() {
    //board will be a 2d array
    let board = [];

    //rows
    for (let r = 0; r < c4_ROWS; r++) {
        //each row
        let row = [];

        //columns
        for (let c = 0; c < c4_COLUMNS; c++) {
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
    // logArray(c4_board.getBoard());
}

//function to create the column hover divs over the board
function setBoardHovers() {
    //left hover
    let leftBoardHoverDiv = document.createElement("div"); //create a new div
    leftBoardHoverDiv.id = "Hover0"; //give it the correct indexed id
    leftBoardHoverDiv.classList.add("boardColumnHoverLeft"); //add the class to style it

    $('#boardColumnHoversParent').append(leftBoardHoverDiv); //make the boardColumnHoversParent this div's parent

    //centre hovers
    for (let i = 0; i < c4_COLUMNS - 2; i++) {
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

//function to set up the game
function setUpGame(_isPlayingRobot, _playerName, _botDif) {
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
        c4_gameStarted.setState(true);
        c4_isMyTurn.setState(true);
        c4_isPlayingRobot.setState(true);

        c4_botDif.setState(_botDif);
    }
    else {
        //set opponent name
        $('#opponentNameText').text('...');
    }
}

//set a tile's colour
function setPiece(columnNo, playerPiece) {
    if(!c4_gameStarted.getState()) return;

    let board = c4_board.getBoard();
    let tilesInColumn = 0;

    //remove hovers
    // for (let i = 0; i < 7; i++) {
    //     $('#Hover' + i).removeClass("hoverSelected");
    // }

    //work out which row to put the tile at based on how empty the column is
    for (let i = 0; i < c4_ROWS; i++) {
        if(board[i][columnNo] != ' ') { //if the row at column is empty
            tilesInColumn++; //increment tilesInColumn
        }
    }

    let id = (c4_ROWS - tilesInColumn - 1) + "-" + columnNo; //get the id of the tile to change

    //change colour based on player
    if(playerPiece == "Y"){
        $('#' + id).addClass("yellowTile"); //spawn the tile (yellow)
    }
    else if(playerPiece == "R") {
        $('#' + id).addClass("redTile"); //spawn the tile (red)
    }

    board[c4_ROWS - 1 - tilesInColumn][columnNo] = playerPiece; //update board
    c4_board.updateBoard(board); //update the board global

    //check if the player has won or drawn
    checkDraw();
    checkWinner();
    
    //alternate player
    c4_isMyTurn.setState(!c4_isMyTurn.getState()); 

    //alternate who has the border around their icon
    if($('#playerIcon').hasClass('currentGo')) {
        $('#playerIcon').removeClass('currentGo');
        $('#opponentIcon').addClass('currentGo');
    }
    else if ($('#opponentIcon').hasClass('currentGo')) {
        $('#opponentIcon').removeClass('currentGo');
        $('#playerIcon').addClass('currentGo');
    }
}

//function to check if a column is full
function isColumnFull(columnNo) {
    let board = c4_board.getBoard();
    let tilesInColumn = 0;

    //work out which row to put the tile at based on how empty the column is
    for (let i = 0; i < c4_ROWS; i++) {
        if(board[i][columnNo] != ' ') { //if the row at column is empty
            tilesInColumn++; //increment tilesInColumn
        }
    }

    if(tilesInColumn < c4_ROWS) { //if there's room in the column
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
    for (let r = 0; r < c4_ROWS; r++) {
        for (let c = 0; c < (c4_COLUMNS - 3); c++) {
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
    for (let c = 0; c < c4_COLUMNS; c++) {
        for (let r = 0; r < (c4_ROWS - 3); r++) {
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
    for (let r = 0; r < (c4_ROWS - 3); r++) {
        for (let c = 0; c < (c4_COLUMNS - 3); c++) {
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
    for (let r = 3; r < c4_ROWS; r++) {
        for (let c = 0; c < (c4_COLUMNS - 3); c++) {
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

//function to check if you have drawn
function checkDraw() {
    let board = c4_board.getBoard();
    let filledPositions = 0;

    for (let r = 0; r < c4_ROWS; r++) {
        for (let c = 0; c < c4_COLUMNS; c++) {
            if(board[r][c] != ' ') { //if the tile isn't empty
                filledPositions++;
            }
        }
    }

    if(filledPositions >= (c4_ROWS * c4_COLUMNS)) {
        //if draw
        //increment score counters for both players
        let scoreOpponent = parseInt($("#opponentScoreText").text());
        $("#opponentScoreText").text(scoreOpponent + 1);

        let scorePlayer = parseInt($("#playerScoreText").text());
        $("#playerScoreText").text(scorePlayer + 1);

        endGame("Draw");
    }
    
}

//function to set the winning tiles
function setWinner(winningTiles) {
    //initialise winner string
    let winnerString = " ";
    c4_gameStarted.setState(false);

    //add winnerTile class to each winning tile
    for (let i = 0; i < winningTiles.length; i++) {
        $("#" + winningTiles[i]).addClass("winningTile");
    }

    //check if we are red tile or yellow tile
    const myTile = (c4_myPiece.getState() == "Y") ? "yellowTile" : "redTile";
    
    //increment score counters based on who won
    if($("#" + winningTiles[0]).attr('class').split(" ")[1] !== myTile) { //opponent
        let score = parseInt($("#opponentScoreText").text());
        $("#opponentScoreText").text(score + 1);

        if(c4_isPlayingRobot.getState()) {
            //if playing ai, say robot won
            winnerString = "Robot wins!"; 
        }
        else {
            //if playing online, say other player won
            winnerString = `${$('#opponentNameText').html()} wins!`;
        }
    }
    else { //player
        let score = parseInt($("#playerScoreText").text());
        $("#playerScoreText").text(score + 1);

        winnerString = "You win!";
    }

    endGame(winnerString);
}

//function to end the game and allow for another game
function endGame(winnerString) {
    //remove hovers
    for (let i = 0; i < 7; i++) {
        $('#Hover' + i).removeClass("hoverSelected");
    }

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
    //reset the board array
    let board = c4_board.getBoard();
    board = [];
    for (let r = 0; r < c4_ROWS; r++) {
        let row = [];
        for (let c = 0; c < c4_COLUMNS; c++) {
            row.push(' ');
        }
        board.push(row);
    }
    c4_board.updateBoard(board);

    //reset tile html
    for (let r = 0; r < c4_ROWS; r++) {
        for (let c = 0; c < c4_COLUMNS; c++) {
            let coords = r + "-" + c;
            $("#" + coords).removeClass('redTile yellowTile winningTile');
        }
    }

    //set game started
    c4_gameStarted.setState(true);

    if(c4_isPlayingRobot.getState()) 
    {
        //if you're playing robot, set player first
        $('#playerIcon').addClass('currentGo');
    } 
    else { 
        //if you're playing online, alternate blue circle
        if(c4_isMyTurn.getState()) {
            $('#playerIcon').addClass('currentGo');
        }
        else {
            $('#opponentIcon').addClass('currentGo');
        }
    }   
}