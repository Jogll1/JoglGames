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

function connectToSocket(roomName, username) {
    var socket = ch_socket.setState(io()); //possibly needs a url?
    ch_roomName.setState(roomName); //store roomname locally

    //check if room exists
    socket.emit('checkRoom', roomName);

    //room check response
    socket.on('checkRoomResponse', function (roomExists) {
        if (roomExists) {
            //join room
            console.log('joining room');
            socket.emit('joinRoom', roomName, username, 'Chess');
        }
        else {
            //create room
            console.log("creating room");
            socket.emit('createRoom', roomName, username, 'Chess');
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
            setUpGame(false, username);
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
            //empty board
            $('#board').empty();
            //set black pieces at the bottom
            setGame(false);
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
        // c4_isMyTurn.setState(myData.isHost);
        // c4_isPlayingRobot.setState(false);
        // c4_myPiece.setState((myData.isHost) ? "Y" : "R");
    });
}