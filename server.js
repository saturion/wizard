var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {

    pname = 'Player' + Object.keys(players).length;
    
    players[socket.id] = {
        playerId: socket.id,
        name: pname,
    };

    socket.emit('currentPlayers', players);

    socket.broadcast.emit('newPlayer', players[socket.id]);

    console.log(`Connected ${pname} with id ${socket.id}`);

    socket.on('disconnect', function() {
        delete(players[socket.id]);
        io.emit('disconnect', socket.id);
        console.log('User disconnected');
    });
});

server.listen(8081, function() {
    console.log(`WIZARD Game Server listening on port ${server.address().port}`)
});