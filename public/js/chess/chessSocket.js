//#region globals
//socket global
var ch_socket = (function () {
    var socket;

    return {
        setState: function (value) {
            return socket = value;
        },

        getState: function () {
            return socket;
        }
    }
})();

//room we are in global
var ch_roomName = (function () {
    var roomName; 

    return {
        setState: function (value) {
            return roomName = value;
        },

        getState: function () {
            return roomName;
        }
    }
})();
//#endregion

function connectToSocket(_roomName, _username) {
    var socket = ch_socket.setState(io()); //possibly needs a url?
    ch_roomName.setState(_roomName); //store roomname locally

    //check if room exists
    socket.emit('checkRoom', _roomName);

    //room check response
    socket.on('checkRoomResponse', function (roomExists) {
        if (roomExists) {
            //join room
            console.log('joining room');
            socket.emit('joinRoom', _roomName, _username, 'Chess');
        }
        else {
            //create room
            console.log("creating room");
            socket.emit('createRoom', _roomName, _username, 'Chess');
        }
    });

    //room operation response
    socket.on('roomOperationResponse', function (success, roomName, errorReason) {
        if (success) {
            console.log(`joined room: ${roomName}`);

            //hide menu if joined a room
            $('.menuBackground').hide();
            $('.onlinePlayMenu').hide();

            //setup chess game
            setUpGame(false, _username);

            //set room name next to show
            $(".roomNameText").show();
            $(".roomNameText").html(`${ch_roomName.getState()}`);
        }
        else {
            alert(`failed to join room: ${roomName}\nReason: ${errorReason}`);
        }
    });

    //when another player joins
    socket.on('playerJoined', function (playerData1, playerData2) {
        console.log('player joined');

        //set which is our data
        const myData = (playerData1.playerID === socket.id) ? playerData1 : playerData2;
        const oppData = (playerData1.playerID === socket.id) ? playerData2 : playerData1;

        //check if we are the second player to join
        if(myData == playerData2) {
            //rotate chess board
            $('#board').addClass('rotateBlack');
            $('.pieceContainer').addClass('rotatePiece');
        }

        //set opponent name based on which one is not ours
        $('#opponentNameText').text(oppData.username);

        //set who's to go first based on whos host
        if (myData.isHost) {
            //set player first
            $('#playerIcon').addClass('currentGo');
        }
        else {
            //set player first
            $('#opponentIcon').addClass('currentGo');
        }

        //start the game against the other player
        ch_gameStarted.setState(true);
        ch_isMyTurn.setState(myData.isHost);
        ch_myColour.set(myData.isHost ? "White" : "Black");
        ch_isPlayingRobot.setState(false);
    });

    //detecting when the opponent has left the room
    socket.on('opponentLeftRoom', function() {
        //this doesn't have to happen, opponent could just join back
        //with same name and code and it should let them in

        //show alert
        alert('Opponent has left the game.');

        //disconnect self from socket
        socket.close();

        //send user back to play menu
        //reset board
        resetGame();
        //reset scores
        $("#opponentScoreText").text(0);
        $("#playerScoreText").text(0);
        //remove blue circle
        $('#playerIcon').removeClass('currentGo');
        $('#opponentIcon').removeClass('currentGo');
        //hide player icons and score text
        $('.scoreAndIconParent').hide();
        //hide rematch menu
        $('.rematchMenu').hide();
        //open menu
        $('.menuBackground').show();
        $('.friendOrAIMenu').show();
    });

    //recieving a move that was sent to the server
    socket.on('chessMoveResponse', function(pieceToMove, tileRef) {
        movePiece(pieceToMove, tileRef);
    });

    //recieving a remtach that was sent by the other player to the server
    socket.on('chessRematchResponse', function() {
        console.log("Rematch started by the other player");
        //close the menu
        $('.menuBackground').hide();
        $('.rematchMenu').hide();

        //reset the board
        resetGame();
        
        //set game started
        ch_gameStarted.setState(true);
    });
}

//function to send a move to the server
//can only be called when ch_socket is set
function socketSendChessMove(_pieceToMoveId, _tileToMoveToId) {
    var socket = ch_socket.getState();
    socket.emit('chessSendMove', _pieceToMoveId, _tileToMoveToId, ch_roomName.getState());
}

//function to call a rematch for both players
function socketSendChessRematch() {
    var socket = ch_socket.getState();
    socket.emit('chessSendRematch', ch_roomName.getState());
}