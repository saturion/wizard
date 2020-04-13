// Config
var express = require('express');
var path = require('path');
var session = require('express-session')({
    secret: 'v1I_i1fpqPEhUeSFJrCsuVKeaX4H_fVe',
    resave: true,
    saveUninitialized: true
});
var sharedsession = require('express-socket.io-session');

var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static('public'));

app.use(session);
io.use(sharedsession(session));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// IB Vars
var players = new Array();


// Funcs
app.get('/', function(req, res) {

    console.log('Hello Client');
    console.log('Your Session ID = ' + req.session.id);

    if(players.find(pl => pl.playerId == req.session.id) && req.session.loggedin) {
        // you've been here before
        console.log('this you?');
        //res.redirect('/game.html');
        res.sendFile(path.join(__dirname + '/public/game.html'));
        return;
    }

    res.sendFile(path.join(__dirname + '/public/register.html'));
    //res.redirect('/register.html');
});

app.post('/logout', function(req, res) {
    
    if(req.session.loggedin) {
        // remove me
        players = players.filter(p => p.playerId === req.session.id);
        req.logout();
        res.send(redirect('/'));
    }
   
});

app.post('/register', function(req, res) {

    if(players.find(pl => pl.playerName == req.body.player)) {
        res.send('This user already exists!');
        res.end();
    } else {
        console.log('new player! ' + req.body.player);
        req.session.loggedin = true;
        req.session.username = req.body.player;

        players.push({
            playerId: req.session.id,
            playerName: req.body.player,
        });
        res.redirect('/');
    }
  
});

io.on('connection', function(socket) {

    const handle = socket.handshake.session.id;
    console.log('Current handle = ' + handle);

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