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
var players = {};


// Funcs
app.get('/', function(req, res) {

    console.log('Hello Client');
    console.log('Your Session ID = ' + req.session.id);

    if((req.session.id in players) && req.session.loggedin) {
        // you've been here before
        console.log('this you?');
        res.sendFile(path.join(__dirname + '/public/game.html'));
        return;
    }

    res.sendFile(path.join(__dirname + '/public/register.html'));
});

app.post('/logout', function(req, res) {
    
    if(req.session.loggedin) {
        // remove me
        delete players[req.session.id];
        req.logout();
        res.send(redirect('/'));
    }
   
});

app.post('/register', function(req, res) {

    var found = false;

    Object.keys(players).forEach(function(key) {
        if(players[key].playerName == req.body.player) {
            found = true;
        }
    })

    if(found) {
        res.send('This user already exists!');
        res.end();
    } else {
        console.log('new player! ' + req.body.player);
        req.session.loggedin = true;
        req.session.username = req.body.player;

        players[req.session.id] = {
            playerName: req.body.player,
            handle: req.session.id
        };

        res.redirect('/');
    }
  
});

io.on('connection', function(socket) {

    const handle = socket.handshake.session.id;
    const player = players[handle];
    console.log('Current handle = ' + handle);

    // Send all players
    socket.broadcast.emit('currentPlayers', players);

    // Send session ID
    socket.emit('yourSession', player);


    console.log(`Connected ${player.playerName} with id ${socket.id}`);
    console.log(players);

    socket.on('disconnect', function() {
        //delete(players[socket.id]);
        io.emit('disconnect', socket.id);
        console.log('User disconnected');
    });

    socket.on('startGame', function() {

    });

    socket.on('tellHits', function() {

    });

    socket.on('playCard', function() {

    });

    socket.on('endGame', function() {
        
    })
    
});

server.listen(8081, function() {
    console.log(`WIZARD Game Server listening on port ${server.address().port}`)
});