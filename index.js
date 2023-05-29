//express
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

//using the public folder
app.use(express.static(__dirname + '/public'));

//send html page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

//hmm
// //redirect /html/test.html/ -> /test
// app.get('/test', (req, res) => {
//     res.redirect(301, __dirname + '/public/html/test.html');
// })

// app.get('/public/html/index.html', (req, res) => {
//     res.send("hello");
// })

//open port 3000
server.listen(3000, () => {
    console.log('App available on http://localhost:3000');
});