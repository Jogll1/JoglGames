//#region globals
//socket global
var c4_socket = (function () {
    var socket; //create a variable inside the module (within scope)

    return { //return a fuction that sets the variable
        setState: function (value) {
            return socket = value;
        },

        getState: function () {
            return socket;
        }
    }
})();

//room we are in global
var c4_roomName = (function () {
    var roomName; //create a variable inside the module (within scope)

    return { //return a fuction that sets the variable
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
    //var socket = io(); //possibly needs a url?
    var socket = c4_socket.setState(io()); //possibly needs a url?
    c4_roomName.setState(roomName); //store foomname locally

    //check if room exists
    socket.emit('checkRoom', roomName);

    //room check response
    socket.on('checkRoomResponse', function (roomExists) {
        if (roomExists) {
            //join room
            console.log('joining room');
            socket.emit('joinRoom', roomName, username);
        }
        else {
            //create room
            console.log("creating room");
            socket.emit('createRoom', roomName, username);
        }
    });

    //room operation response
    socket.on('roomOperationResponse', function (success, roomName, errorReason) {
        if (success) {
            console.log(`joined room: ${roomName}`);

            //hide menu if joined a room
            $('.menuBackground').hide();
            $('.onlinePlayMenu').hide();

            //setup connect 4 game
            setUpGame(false, username);
        }
        else {
            alert(`failed to join room: ${roomName}\nreason: ${errorReason}`);
        }
    });

    //when another player joins
    socket.on('playerJoined', function (playerData1, playerData2) {
        console.log('player joined');

        //set which is our data
        const myData = (playerData1.playerID === socket.id) ? playerData1 : playerData2;
        const oppData = (playerData1.playerID === socket.id) ? playerData2 : playerData1;

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
        c4_gameStarted.setState(true);
        c4_isMyTurn.setState(myData.isHost);
        c4_isPlayingRobot.setState(false);
        c4_myPiece.setState((myData.isHost) ? "Y" : "R");
    });

    //recieving a move that was sent to the server
    socket.on('conn4MoveResponse', function(msg) {
        console.log(msg);
    });
}

//function to send a move to the server
//can only be called when c4_socket is set
function socketSendConn4Move(columnNo, playerPiece) {
    var socket = c4_socket.getState();
    socket.emit('conn4SendMove', columnNo, playerPiece, c4_roomName.getState());
}