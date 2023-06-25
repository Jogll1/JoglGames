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

            //remove the empty room
            if(rooms[roomName].length === 0) {
                delete rooms[roomName];
                socket.leave(roomName);
            }
        });
    });

    //checking if a room exists
    socket.on('checkRoom', function(roomName) {
        // const roomExists = rooms.includes(roomName);
        const roomExists = rooms[roomName];
        socket.emit('checkRoomResponse', roomExists);
    });

    //joining room
    socket.on('joinRoom', function(roomName, username) {
        //only join if room contains less than 2 players
        const roomSize = io.sockets.adapter.rooms.get(roomName).size;
        if(roomSize < 2) {
            //add data of this player to room object
            const playerData = {playerID: socket.id, username: username};
            rooms[roomName].push(playerData); 

            //join room
            socket.join(roomName);

            //send room response
            socket.emit('roomOperationResponse', true, roomName, ''); //success

            //send a message to both players in the room containing both usernames
            //get name of other player
            const opponentName = Object.entries(rooms).reduce((result, [room, players]) => {
                const opponent = players.find(player => player.playerID !== socket.id);
                if(opponent) {
                    return opponent.username;
                }

                return result;
            }, '');
            io.to(roomName).emit('playerJoined', username, opponentName);
        }
        else {
            //send room response
            socket.emit('roomOperationResponse', false, roomName, 'room full'); //failure
        }
    });

    //creating room
    socket.on('createRoom', function(roomName, username) {
        //make sure room doesn't already exist
        if(!rooms[roomName]) {
            //create empty array of playerIds;
            rooms[roomName] = [];

            //add data of this player to room object
            //TODO -- set this player as host
            const playerData = {playerID: socket.id, username: username};
            rooms[roomName].push(playerData);

            //join this new room
            socket.join(roomName);

            //send room response
            socket.emit('roomOperationResponse', true, roomName, ''); //success
        }
        else {
            //send room response
            socket.emit('roomOperationResponse', false, roomName, 'room already exists'); //failure
        }
    });
});
//#endregion

//open port 3000
server.listen(3000, () => {
    console.log('App available on http://localhost:3000');
});