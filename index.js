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
const rooms = {};

//when a user connects
io.on('connection', function(socket) {
    console.log('a user connected');

    //disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected');

        //remove player id from rooms object
        //get list of rooms player was in
        // const roomsIn = Object.keys(rooms).filter((roomName) => rooms[roomName].includes(socket.id));
        const roomsIn = Object.keys(rooms).filter((roomName) => rooms[roomName].some(_playerID => _playerID.playerID === socket.id));

        //remove player from each room and if the player was the last one in a room, delete the room
        roomsIn.forEach((roomName) => {
            rooms[roomName] = rooms[roomName].filter((_playerID) => _playerID.playerID !== socket.id);

            //remove the empty rooms
            if(rooms[roomName].length === 0) {
                delete rooms[roomName];
                socket.leave(roomName);
            }

            //notify the other player that the opponent left the room
            socket.to(roomName).emit('opponentLeftRoom');
        });
    });

    //checking if a room exists
    socket.on('checkRoom', function(roomName) {
        const roomExists = rooms[roomName];
        socket.emit('checkRoomResponse', roomExists);
    });

    //joining room
    socket.on('joinRoom', function(roomName, username, roomType) {
        //only join if room contains less than 2 players
        const roomSize = io.sockets.adapter.rooms.get(roomName).size;
        if(roomSize < 2) {
            const checkRoomType = rooms[roomName][0].roomType;
            //make sure you are trying to join a room of the same room type
            if(checkRoomType == roomType) {
                //add data of this player to room object
                const playerData = {playerID: socket.id, username: username, roomType: roomType, isHost: false};
                rooms[roomName].push(playerData); 

                //join room
                socket.join(roomName);

                //send room response
                socket.emit('roomOperationResponse', true, roomName, ''); //success

                //send a message to both players in the room data about both players
                const playerData1 = rooms[roomName][0];
                const playerData2 = rooms[roomName][1];
                io.to(roomName).emit('playerJoined', playerData1, playerData2); //sends to all sockets in a room
            }
            else {
                //send room response
                socket.emit('roomOperationResponse', false, roomName, `Trying to join room of type: ${checkRoomType}`); //failure
            }
        }
        else {
            //send room response
            socket.emit('roomOperationResponse', false, roomName, 'Room full'); //failure
        }
    });

    //creating room
    socket.on('createRoom', function(roomName, username, roomType) {
        //make sure room doesn't already exist
        if(!rooms[roomName]) {
            //create empty array of playerIds;
            rooms[roomName] = [];

            //add data of this player to room object
            const playerData = {playerID: socket.id, username: username, roomType: roomType, isHost: true};
            rooms[roomName].push(playerData);

            //join this new room
            socket.join(roomName);

            //send room response
            socket.emit('roomOperationResponse', true, roomName, ''); //success
        }
        else {
            //send room response
            socket.emit('roomOperationResponse', false, roomName, 'Room already exists'); //failure
        }
    });

    //#region Connect 4
    //recieving a move
    socket.on('conn4SendMove', function(columnNo, playerPiece, roomName) {
        const msg = `${playerPiece} played in column ${columnNo} in room ${roomName}`;
        //sends to all sockets in a room, excluding the sender
        socket.to(roomName).emit('conn4MoveResponse', columnNo, playerPiece, msg); 
    });

    //receiving a call to rematch
    socket.on('conn4SendRematch', function(roomName) {
        //sends to all sockets in a room, excluding the sender as sender has already reset
        socket.to(roomName).emit('conn4RematchResponse');
    });
    //#endregion

    //#region Chess
    socket.on('chessSendMove', function(pieceToMoveId, tileToMoveToId, roomName) {
        //sends to all sockets in a room, excluding the sender
        socket.to(roomName).emit('chessMoveResponse', pieceToMoveId, tileToMoveToId);
        // console.log(`${pieceToMoveId} => ${tileToMoveToId} : from ${roomName}`);
    });

    //receiving a call to rematch
    socket.on('chessSendRematch', function(roomName) {
        //sends to all sockets in a room, excluding the sender as sender has already reset
        socket.to(roomName).emit('chessRematchResponse');
    });
    //#endregion

    //#region Battleships
    socket.on('battleshipsSendMove', function(tileCoords, endGo, roomName) {
        //sends to all sockets in a room, excluding the sender
        socket.to(roomName).emit('battleshipsMoveResponse', tileCoords, endGo);
    });

    //receiving a call to rematch
    socket.on('battleshipsSendRematch', function(roomName) {
        //sends to all sockets in a room, excluding the sender as sender has already reset
        socket.to(roomName).emit('battleshipsRematchResponse');
    });

    //getting grid of opponent
    socket.on('battleshipsSendGrid', function(oppGrid, roomName) {
        //sends to all sockets in a room, excluding the sender as sender has already reset
        socket.to(roomName).emit('battleshipsSendGridResponse', oppGrid);
    });
    //#endregion
});
//#endregion

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
//open port 3000
server.listen(port, () => {
    console.log(port);
    console.log('App available on http://localhost:3000');
});