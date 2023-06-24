//express
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

//socket
const {Server} = require("socket.io");
const io = new Server(server);

//using the public folder
app.use(express.static(__dirname + '/public'));

//send html page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

//#region Socket Server Side
const rooms = [];

//when a user connects
io.on('connection', function(socket) {
    console.log('a user connected');

    //disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected');

        //if the player was the last one in a room, delete the room
        //const room = io.sockets.adapter.rooms.get(roomName);
        for (let i = 0; i < rooms.length; i++) {
            // const roomSize = io.sockets.adapter.rooms.get(rooms[i]);
            // console.log(roomSize);
            // if(roomSize <= 0) {
            //     // Get all sockets in the room
            //     const socketsInRoom = Array.from(io.sockets.adapter.rooms.get(roomName));

            //     // Disconnect all sockets in the room
            //     socketsInRoom.forEach(socketId => {
            //         io.sockets.sockets.get(socketId).disconnect(true);
            //     });

            //     // Delete the room
            //     io.sockets.adapter.rooms.delete(roomName);

            //     //remove room from list
            //     const index = array.indexOf(roomName);
            //     if (index > -1) { // only splice array when item is found
            //         array.splice(index, 1); // 2nd parameter means remove one item only
            //     }

            //     console.log(`deleted room ${rooms[i]} as it was empty`);
            // }
        }
    });

    //checking if a room exists
    socket.on('checkRoom', function(roomName) {
        const roomExists = rooms.includes(roomName);
        socket.emit('checkRoomResponse', roomExists);
    });

    //joining room
    socket.on('joinRoom', function(roomName) {
        //only join if room contains less than 2 players
        const roomSize = io.sockets.adapter.rooms.get(roomName).size;
        if(roomSize < 2) { 
            socket.join(roomName); //join room
            socket.emit('roomOperationResponse', true, roomName, ''); //success
        }
        else {
            socket.emit('roomOperationResponse', false, roomName, 'room full'); //failure
        }
    });

    //creating room
    socket.on('createRoom', function(roomName) {
        //make sure room doesn't already exist
        if(!rooms.includes(roomName)) {
            rooms.push(roomName); //add room to array
            socket.join(roomName); //join this new room

            //TODO -- set this player as host

            socket.emit('roomOperationResponse', true, roomName, ''); //success
        }
        else {
            socket.emit('roomOperationResponse', false, roomName, 'room already exists'); //failure
        }
    });
});
//#endregion

//open port 3000
server.listen(3000, () => {
    console.log('App available on http://localhost:3000');
});