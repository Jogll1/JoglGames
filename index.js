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
    });

    //checking if a room exists
    socket.on('checkRoom', function(roomName) {
        const roomExists = rooms.includes(roomName);
        socket.emit('checkRoomResponse', roomExists);
    });

    //joining room
    socket.on('joinRoom', function(roomName) {
        socket.join(roomName); //join room
        socket.emit('roomOperationResponse', true, roomName); //success
    });

    //creating room
    socket.on('createRoom', function(roomName) {
        //make sure room doesn't already exist
        if(!rooms.includes(roomName)) {
            rooms.push(roomName); //add room to array
            socket.join(roomName); //join this new room
            socket.emit('roomOperationResponse', true, roomName); //success
        }
        else {
            socket.emit('roomOperationResponse', false, roomName); //failure
        }
    });
});
//#endregion

//open port 3000
server.listen(3000, () => {
    console.log('App available on http://localhost:3000');
});