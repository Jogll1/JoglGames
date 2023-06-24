function connectToSocket(roomName) {
    var socket = io(); //possibly needs a url

    //check if room exists
    socket.emit('checkRoom', roomName);

    //room check response
    socket.on('checkRoomResponse', function(roomExists) {
        if(roomExists) {
            //join room
            console.log('joining room');
            socket.emit('joinRoom', roomName);
        }
        else {
            //create room
            console.log("creating room");
            socket.emit('createRoom', roomName);
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
            // { username: userName, isHost: true}
            setUpGame(false, 'Player1');
        }
        else {
            alert(`failed to join room: ${roomName}\nreason: ${errorReason}`);
        }
    });
}