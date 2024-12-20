const ba_SIZE = 10; //10x10 grid
const ba_BOAT_COLOURS = ["#ec5124", "#4ea9d0", "limegreen", "#f6ae2d", "#ef2ac9"]; //#ec5124 c91847
const ba_BOAT_LENGTHS = [5, 4, 3, 3, 2];


//#region globals
var ba_gameStarted = (function(){ 
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

var ba_myBoard = (function() {
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

var ba_oppBoard = (function() {
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

var ba_isMyTurn = (function(){
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

var ba_isPlayingRobot = (function() { 
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
//#endregion

//when document loads up
$(document).ready(function() {
    setGame();
    placeBoats("my", true);

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

        if(ba_isPlayingRobot.getState()) {
            ba_isMyTurn.setState(true);
        }
        else {
            // -----SOCKET-----
            // if not playing robot, send rematch to the server
            socketSendBattleshipsRematch();
            // ----------------
        }

        //reset the board
        resetGame();
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
    $(document).on('mousedown', '.gridTile', function() {
        if(!ba_isMyTurn.getState()) return;

        if($(this).attr("id").includes("op") && !$(this).hasClass("checkedTile")) {
            const playerAtk = playerAttack($(this));

            if(!ba_isPlayingRobot.getState()) {
                //-----SOCKET-----
                //if not playing robot, send move to the server
                socketSendBattleshipsMove($(this).attr("id").substring(2), !playerAtk);
                //----------------
            }
        }
    });

    $(document).on('mouseenter', '.gridTile', function() {
        if($(this).attr("id").includes("op") && !$(this).hasClass("checkedTile") && ba_isMyTurn.getState()) {
            $(this).addClass("gridTileHover");
        }
    });

    $(document).on('mouseleave', '.gridTile', function() {
        $(this).removeClass("gridTileHover");
    });
    //#endregion
});

//initialise the game by creating the boards and the tiles
function setGame() {
    let myBoard = [];
    let oppBoard = [];

    //rows
    for (let r = 0; r < ba_SIZE; r++) {
        //each row
        let myRow = [];
        let oppRow = [];

        //columns
        for (let c = 0; c < ba_SIZE; c++) {
            //add an empty value to each column of a row
            myRow.push(' '); 
            oppRow.push(' ');

            //1 for us and 2 for opponent

            //#region Creating tiles
            let idNo = r.toString() + "-" + c.toString();

            let tile1 = document.createElement("div");
            tile1.id = `my${idNo}`;
            tile1.classList.add("gridTile");
            tile1.classList.add("checkedTile");

            let tile2 = document.createElement("div");
            tile2.id = `op${idNo}`;
            tile2.classList.add("gridTile");

            //allow pieces to be dropped on it
            // squareTile.classList.add("dropTile");

            //append squareTile to board
            $('#myBoard').append(tile1);
            $('#oppBoard').append(tile2);
            //#endregion
        }
        myBoard.push(myRow);
        oppBoard.push(oppRow);
    }

    ba_myBoard.updateBoard(myBoard);
    ba_oppBoard.updateBoard(oppBoard);
}

//set up the game for play
function setUpGame(_isPlayingRobot, _playerName) {
    $('.scoreAndIconParent').show();

    //set player name
    $('#playerNameText').text(_playerName);

    if(_isPlayingRobot) {
        //set player first
        $('#playerIcon').addClass('currentGo');

        //set opponent name
        $('#opponentNameText').text('Robot');

        //change icon
        $('#oppImg').attr('src', '/images/webp/RobotIcon.webp');

        //set random ba_oppBoard
        placeBoats("op", false);

        //start game against robot
        ba_gameStarted.setState(true);
        ba_isMyTurn.setState(true);
        ba_isPlayingRobot.setState(true);
    }
    else {
        //set opponent name
        $('#opponentNameText').text('...');
    }
}

//function to place a random boat on the grid
function placeRandomBoat(_player, _length, _i, _colour, _placeOnBoard) {
    const vertOrHor = getRandomInt(0, 1); //0 = vertical, 1 = horizontal

    let ranX = getRandomInt(0, 9);
    let ranY = getRandomInt(0, 9);

    //make sure boat can fit in grid
    if(vertOrHor === 0) {
        if(9 - ranX < _length) {
            //if boat won't fit on grid, move it back
            const extraDist = _length - (9 - ranX);
            ranX = ranX - extraDist;
        }
    }
    else {
        if(ranY < _length) {
            //if boat won't fit on grid, move it down
            const extraDist = _length - ranY;
            ranY = ranY + extraDist;
        }
    }

    const gridArray = (_player === "my") ? copy2DArray(ba_myBoard.getBoard()) : copy2DArray(ba_oppBoard.getBoard());

    if(isValidPlacement(gridArray, vertOrHor, _length, ranX, ranY)) {
        //place tiles (down and left)
        for (let i = 0; i < _length; i++) {
            if(i === 0) {
                //update array
                gridArray[ranX][ranY] = _i;

                if(_placeOnBoard) {
                    $(`#${_player}${ranX}-${ranY}`).addClass(`boatTile ${vertOrHor === 0 ? "boatTopTile" : "boatRightTile"}`);
                    $(`#${_player}${ranX}-${ranY}`).css("background-color", _colour);
                }
            }
            else {
                if(vertOrHor === 0) {
                    //update array
                    gridArray[ranX + i][ranY] = _i;
                    // logArray(gridArray);

                    if(_placeOnBoard) {
                        //horizontal
                        $(`#${_player}${ranX + i}-${ranY}`).addClass(`boatTile ${i < _length - 1 ? "boatTile" : "boatBottomTile"}`);
                        $(`#${_player}${ranX + i}-${ranY}`).css("background-color", _colour);
                    }
                }
                else {
                    //update array
                    gridArray[ranX][ranY - i] = _i;
                    // logArray(gridArray);

                    if(_placeOnBoard) {
                        //vertical
                        $(`#${_player}${ranX}-${ranY - i}`).addClass(`boatTile ${i < _length - 1 ? "boatTile" : "boatLeftTile"}`);
                        $(`#${_player}${ranX}-${ranY - i}`).css("background-color", _colour);
                    }
                }
            }
        }

        (_player == "my") ? ba_myBoard.updateBoard(gridArray) : ba_oppBoard.updateBoard(gridArray);

        return true;
    }
    else {
        return false;
    }
}

//check for valid boat placement
function isValidPlacement(_gridArray, _vertOrHor, _length, _ranX, _ranY) {
    for (let i = 0; i < _length; i++) {
        //set x and y
        const x = _vertOrHor === 0 ? _ranX + i : _ranX;
        const y = _vertOrHor === 0 ? _ranY : _ranY - i;
        
        //make sure gridtile is not empty
        if (x < 0 || x > 9 || y < 0 || y > 9 || _gridArray[x][y] !== ' ') {
            return false;
        }

        if(_vertOrHor === 0) { //vertical
            if(i === 0) { //if first ship piece
                if(x - 1 >= 0 && _gridArray[x - 1][y] !== ' ') return false;
                if(x + 1 <= 9 && _gridArray[x + 1][y] !== ' ') return false;
                if(y - 1 >= 0 && _gridArray[x][y - 1] !== ' ') return false;
                if(y + 1 <= 9 && _gridArray[x][y + 1] !== ' ') return false;
            }
            else if(i === _length - 1) { //if last ship piece
                if(x + 1 <= 9 && _gridArray[x + 1][y] !== ' ') return false;
                if(x - 1 >= 0 && _gridArray[x - 1][y] !== ' ') return false;
                if(y - 1 >= 0 && _gridArray[x][y - 1] !== ' ') return false;
                if(y + 1 <= 9 && _gridArray[x][y + 1] !== ' ') return false;
            }
            else {
                if(y + 1 <= 9 && _gridArray[x][y + 1] !== ' ') return false;
                if(y - 1 >= 0 && _gridArray[x][y - 1] !== ' ') return false;
            }

            if(_gridArray[x][y] !== ' ') return false;
        }
        else { //horizontal
            if(i === 0) { //if first ship piece
                if(y + 1 <= 9 && _gridArray[x][y + 1] !== ' ') return false;
                if(y - 1 >= 0 && _gridArray[x][y - 1] !== ' ') return false;
                if(x + 1 <= 9 && _gridArray[x + 1][y] !== ' ') return false;
                if(x - 1 >= 0 && _gridArray[x - 1][y] !== ' ') return false;
            }
            else if(i === _length - 1) { //if last ship piece
                if(y - 1 >= 0 && _gridArray[x][y - 1] !== ' ') return false;
                if(y + 1 <= 9 && _gridArray[x][y + 1] !== ' ') return false;
                if(x - 1 >= 0 && _gridArray[x - 1][y] !== ' ') return false;
                if(x + 1 <= 9 && _gridArray[x + 1][y] !== ' ') return false;
            }
            else {
                if(x + 1 <= 9 && _gridArray[x + 1][y] !== ' ') return false;
                if(x - 1 >= 0 && _gridArray[x - 1][y] !== ' ') return false;
            }

            if(_gridArray[x][y] !== ' ') return false;
        }
    }

    return true;
}

//function to place all 5 boats
function placeBoats(_player, _placeOnBoard) {
    //_player is either "my" or "op"
    for (let i = 0; i < ba_BOAT_LENGTHS.length; i++) {
        let canPlace = placeRandomBoat(_player, ba_BOAT_LENGTHS[i], i + 1, ba_BOAT_COLOURS[i], _placeOnBoard);
        while(!canPlace) {
            canPlace = placeRandomBoat(_player, ba_BOAT_LENGTHS[i], i + 1, ba_BOAT_COLOURS[i], _placeOnBoard);
        }
    }
}

//function to reset all the boars
function clearBoats() {
    myBoard = [];
    //reset array
    for (let r = 0; r < ba_SIZE; r++) {
        let myRow = [];
        for (let c = 0; c < ba_SIZE; c++) {
            myRow.push(' '); 
        }
        myBoard.push(myRow);
    }
    ba_myBoard.updateBoard(myBoard);

    //remove boat classes
    const children = $("#myBoard").children();
    for (let i = 0; i < children.length; i++) {
        const child = $(children[i]);
        if(child.attr("class") !== "gridTile checkedTile") {
            child.css("background-color", "#1a1a1a");
            child.attr("class", "gridTile checkedTile");
        }
    }
}

//function to spawn a splash effect
function spawnSplash(_tile) {
    const splash = $('<div></div');
    splash.addClass("splashEffect");

    splash.css({
        top: `calc(50% - ${12.5}px)`,
        left: `calc(50% - ${12.5}px)`
    });

    splash.appendTo(_tile);
}

//function to spawn a hit mark
function spawnMark(_tile, _type) {
    const mark = _type === "sunkMark" ? $('<img>') : $('<div>'); //create image if its a sunkmark
    mark.addClass(_type);
    mark.addClass("noHighlightOrDrag");

    mark.appendTo(_tile);

    if(_type === "sunkMark") {
        mark.attr("src", "/images/webp/SkullIcon.webp");
    }
    
    spawnSplash(_tile);
}

//function to let the player have a move
function playerAttack(_tile) {
    if(!ba_gameStarted.getState()) return;

    const oppBoardCopy = copy2DArray(ba_oppBoard.getBoard());
    const coords = _tile.attr("id").substring(2).split('-');

    //attack logic
    if(oppBoardCopy[coords[0]][coords[1]] === ' ') {
        //miss
        spawnMark(_tile, "missMark");
        _tile.addClass("checkedTile");
    }
    else {
        //hit
        spawnMark(_tile, "hitMark");
        _tile.addClass("checkedTile");

        //update array to show segment has been hit
        oppBoardCopy[coords[0]][coords[1]] = `${oppBoardCopy[coords[0]][coords[1]]}h`;

        //update array
        ba_oppBoard.updateBoard(oppBoardCopy);

        //check if boat sunk
        isBoatSunk(ba_oppBoard.getBoard(), "op", oppBoardCopy[coords[0]][coords[1]][0]);

        return true;
    }

    //alternate player
    ba_isMyTurn.setState(!ba_isMyTurn.getState());

    //alternate who has the border around their icon
    if($('#playerIcon').hasClass('currentGo')) {
        $('#playerIcon').removeClass('currentGo');
        $('#opponentIcon').addClass('currentGo');
    }
    else if ($('#opponentIcon').hasClass('currentGo')) {
        $('#opponentIcon').removeClass('currentGo');
        $('#playerIcon').addClass('currentGo');
    }

    if(ba_isPlayingRobot.getState() && !ba_isMyTurn.getState()) {
        //ai turn
        aiRandomMove(ba_myBoard.getBoard());
    }

    return false;
}

//function to play opponent move
function opponentAttack(_tileCoords, _endGo) {
    //_tileCoords in format a-b
    const attackCoords = _tileCoords.split('-');
    const attackTile = $(`#my${attackCoords[0]}-${attackCoords[1]}`);
    const attackGrid = copy2DArray(ba_myBoard.getBoard());

    if(attackGrid[attackCoords[0]][attackCoords[1]] !== ' ') {
        //if hit
        spawnMark(attackTile, "hitMark");

        //update array to show segment has been hit
        attackGrid[attackCoords[0]][attackCoords[1]] = `${attackGrid[attackCoords[0]][attackCoords[1]]}h`;

        //update array
        ba_myBoard.updateBoard(attackGrid);

        //check if boat sunk
        isBoatSunk(ba_myBoard.getBoard(), "my", attackGrid[attackCoords[0]][attackCoords[1]][0]);
    }
    else {
        //if miss
        spawnMark(attackTile, "missMark");
    }

    if(_endGo) {
        //alternate player
        ba_isMyTurn.setState(!ba_isMyTurn.getState());

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
}

//function to show when a boat has sunk
function isBoatSunk(_gridArray, _player, _index) {
    //_player is either 'op' or 'my' and is to show which side to update the sunk boat on
    let boatCoords = [];

    //check if any part of the boat has not been hit
    for (let r = 0; r < ba_SIZE; r++) {
        for (let c = 0; c < ba_SIZE; c++) {
            if(`${_gridArray[r][c]}`.includes(`${_index}`)) {
                if(_gridArray[r][c] == _index) {
                    return {status: false, boatCoords: [], gameOver: false};
                }
                boatCoords.push(`${r}-${c}`);
            }
        }
    }

    //sink the boat
    for (let i = 0; i < boatCoords.length; i++) {
        const tile = $(`#${_player}${boatCoords[i][0]}-${boatCoords[i][2]}`);
        tile.empty();
        spawnMark(tile, "sunkMark");
    }

    const gameOver = checkGameOver(_gridArray, _player);

    return {status: true, boatCoords: boatCoords, gameOver: gameOver};
}

//function to check if game over
function checkGameOver(_gridArray, _player) {
    for (let r = 0; r < ba_SIZE; r++) {
        for (let c = 0; c < ba_SIZE; c++) {
            for (let i = 1; i < 6; i++) {
                if(_gridArray[r][c] === i) {
                    return false;
                }
            }
        }
    }

    //set the winner
    setWinner(_player);
    return true;
}

//function to set the winner
function setWinner(_player) {
    //initialise winner string
    let winnerString = " ";
    ba_gameStarted.setState(false);

    //increment score counters based on who won
    if(_player === "my") { //opponent
        let score = parseInt($("#opponentScoreText").text());
        $("#opponentScoreText").text(score + 1);

        if(ba_isPlayingRobot.getState()) {
            //if playing ai, say robot won
            winnerString = "Robot wins!"; 
        }
        else {
            //if playing online, say other player won
            winnerString = `Opponent wins!`;
        }
    }
    else if (_player === "op") { //player
        let score = parseInt($("#playerScoreText").text());
        $("#playerScoreText").text(score + 1);

        winnerString = "You win!";
    }

    endGame(winnerString);
}

//function to end the game and allow for another game
function endGame(winnerString) {
    //reveal opponent's ships
    revealOppShips();

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

//function to reset the game
function resetGame() {
    //reset the board
    $("#myBoard").empty();
    $("#oppBoard").empty();
    setGame();
    placeBoats("my", true);

    //set game started
    ba_gameStarted.setState(true);

    //reset ai data
    resetAIData();

    if(ba_isPlayingRobot.getState()) 
    {
        //if you're playing robot, set player first
        $('#playerIcon').addClass('currentGo');

        placeBoats("op", false);
    } 
    else {
        //alternate player go
        ba_isMyTurn.swapState();

        //if you're playing online, alternate blue circle
        if(ba_isMyTurn.getState()) {
            $('#playerIcon').addClass('currentGo');
        }
        else {
            $('#opponentIcon').addClass('currentGo');
        }

        //send grid to opponent
        sendGridToOpponent();
    }  
}

//function to reveal opponent's ships
function revealOppShips() {
    const board = ba_oppBoard.getBoard();
    let foundShips = new Map();
    let shipCounts = [];
    
    //loop through opponent's board
    for (let i = 0; i < ba_SIZE; i++) {
        for (let j = 0; j < ba_SIZE; j++) {
            //if tile has a boat in (is not empty)
            if(board[i][j] !== ' ') {
                //get the index of the boat
                const index = `${board[i][j]}`.includes('h') ? (board[i][j]).slice(0, -1) : board[i][j];
                
                //add an instance to the array 
                shipCounts.push(index);

                //check if we've checked this ship before
                if(!foundShips.has(index)) {
                    //if not, check if it's vertical or horizontal and add it to foundShips
                    const vertOrHor = `${board[i][j + 1]}`.includes(index) ? 'h' : 'v';
                    foundShips.set(index, vertOrHor);
                }
                
                //add correct classes
                const colour = ba_BOAT_COLOURS[index - 1];
                $(`#op${i}-${j}`).addClass(`boatTile`);
                $(`#op${i}-${j}`).css("background-color", colour);

                //count instances of ships
                let count = 0;
                for (let i = 0; i < shipCounts.length; i++) {
                    if(shipCounts[i] == index) {
                        count++;
                    }
                }
                
                //set end tiles
                if(count === 1) {
                    //if first tile of ship add left or top tile
                    $(`#op${i}-${j}`).addClass(foundShips.get(index) === 'h' ? "boatLeftTile" : "boatTopTile");
                }
                else if (count === ba_BOAT_LENGTHS[index - 1]) {
                    //if last tile of ship add right or bottom tile
                    $(`#op${i}-${j}`).addClass(foundShips.get(index) === 'h' ? "boatRightTile" : "boatBottomTile");
                }
            }
        }
    }
}