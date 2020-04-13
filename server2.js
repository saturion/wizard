var express = require('express');
var app = express();
var server = require('http').Server(app);

app.use(express.static('public'));

app.get('/', function(req, res) {

    console.log('hello hello');

    /*
    if(players.find(pl => pl.playerId == req.session.id)) {
        // you've been here before
        console.log('this you?');
        res.sendFile(__dirname + '/game.html');
    } else {
        res.sendFile(__dirname + '/register.html');
    }
    */

    res.redirect('/register.html');

});

app.post('/register', function(req, res) {

    if(players.find(pl => pl.playerName == req.body.player)) {
        res.send('This user already exists!');
        res.end();
    } else {
        console.log('new player! ' + req.body.player);
        players.push({
            playerId: req.session.id,
            playerName: req.body.player,
        });
        res.end();
    }

});


server.listen(8081, function() {
    console.log(`WIZARD Game Server listening on port ${server.address().port}`)
});