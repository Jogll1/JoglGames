//express
const express = require('express');
const app = express();

const http = require('http');
const { dirname } = require('path');
const server = http.createServer(app);

//using the public folder
app.use(express.static('./public'));

//send html page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

//open port 3000
server.listen(3000, () => {
    console.log('App available on http://localhost:3000');
});