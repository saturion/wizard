var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {y: 0}
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

const gameStates = {
    'init': 1,
    'lobby': 2,
    'playing': 3
};

const clientStates = {
    'new': 1,
    'wait': 2,
    'turn': 3,
    'spectate': 4
}

var currentGameState = gameStates.init;
var currentPlayerState = clientStates.new;

function preload() {

}

function create() {
    var self = this;
    this.socket = io();

    this.socket.on('currentPlayers', function(players) {
        Object.keys(players).foreach(function(id) {
            if(players[id].id === self.socket.id) {
                addPlayer(self, players[id]);
            }
        });
    });
}

function update() {

}