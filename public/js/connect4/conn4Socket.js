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
    socket.on('roomOperationResponse', function(success, roomName) {
        if(success) {
            console.log(`joined room: ${roomName}`);
        }
        else {
            alert(`failed to join room: ${roomName}`);
        }
    });
}