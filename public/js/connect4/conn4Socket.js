function connectToSocket(roomName, username) {
    var socket = io(); //possibly needs a url

    //check if room exists
    socket.emit('checkRoom', roomName);

    //room check response
    socket.on('checkRoomResponse', function(roomExists) {
        if(roomExists) {
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
    socket.on('roomOperationResponse', function(success, roomName, errorReason) {
        if(success) {
            console.log(`joined room: ${roomName}`);

            //hide menu if joined a room
            $('.menuBackground').hide();
            $('.onlinePlayMenu').hide();

            //setup conn4 game
            //TODO -- retrieve names of players in the room
            //OR pass in a array of objects about the players
            setUpGame(false, username);
        }
        else {
            alert(`failed to join room: ${roomName}\nreason: ${errorReason}`);
        }
    });

    //when another player joins
    socket.on('playerJoined', function(name1, name2) {
        console.log('player joined');
        //set opponent name based on which one is not ours
        $('#opponentNameText').text((name1 == username) ? name2 : name1);
    });
}