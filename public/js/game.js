/** @type {import("phaser")} */

const WizardConstants = {
    Scenes: {
        Load: 'load',
        Lobby: 'lobby'
    },
    GameStates: {
        Init: 'init',
        InitLobby: 'initlobby',
        Lobby: 'lobby',
        PreGame: 'pregame',
        Game: 'ingame',
        PostGame: 'postgame',
        EndGame: 'endgame'
    },
    ClientStates: {
        Init: 'init',
        Wait: 'wait',
        Turn: 'turn',
        Spectate: 'spectate',
        Won: 'won',
        Lost: 'lost'
    }
};

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1024,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var currentGameState = WizardConstants.GameStates.Init;
var currentPlayerState = WizardConstants.ClientStates.Init;
var player = null;
var allPlayers = null;

var ui_gamestate;
var ui_pname;
var ui_score;


function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.atlas('cards', 'assets/cardmap.png', 'assets/cardmap.json');
    this.load.atlas('extras', 'assets/extrasmap.png', 'assets/extrasmap.json');

    player = {
        name: 'unknown',
        handle: 'unknown',
        status: WizardConstants.ClientStates.Init,
    }
}

function create() {
    var self = this;
    this.socket = io();

    this.socket.on('yourSession', function(data) {
        console.log('received handle ' + data.playerName);
        player.handle = data.handle;
        player.name = data.playerName;
    });

    this.socket.on('currentPlayers', function(data) {
        console.log('game entered broadcast');
        console.log(data);

        allPlayers = data;

    });

    this.add.image(1024/2, 600/2, 'background');
    
    ui_pname = this.add.text(724, 16, `${player.name}`, { fontSize: '12px', fill: '#fff' });
    ui_score = this.add.text(724, 32, `playerstate`, { fontSize: '12px', fill: '#fff' });
    ui_gamestate = this.add.text(724, 48, `${currentGameState}`, { fontSize: '12px', fill: '#fff'});

    currentGameState = WizardConstants.GameStates.InitLobby;
    

}

function update() {
    ui_pname.setText(player.name + ' (' + player.handle + ')');
    ui_score.setText('Player: ' + player.status);
    ui_gamestate.setText('Game: ' + currentGameState);

    switch(currentGameState) {
        case WizardConstants.GameStates.InitLobby:
            initLobby(this);
            break;
        case WizardConstants.GameStates.Lobby:
            gameLobby(this);
            break;
        default:
            gameTurn(this);
    }
}

function initLobby(engine) {
    var extras = engine.textures.get('extras').getFrameNames();

    engine.add.image(1024/2, 600/2 - 100, 'extras', 'logo');
    engine.add.text(400, 300, 'Waiting for other players...', { fontSize: '14px', fill: '#fff'});

    currentGameState = WizardConstants.GameStates.Lobby;
}

function gameLobby(engine) {
    if(allPlayers.length > 1) {
        engine.add.image(1024/2, 400, 'extras', 'btnstart').setInteractive();
    }
    engine.input.on('gameobjectdown', function(pointer, gameObject) {
        currentGameState = WizardConstants.GameStates.Game;
    });
}


function gameTurn(engine) {
    var frames = engine.textures.get('cards').getFrameNames();

    var x = 100;
    var y = 100;

    for (var i = 0; i < 40; i++)
    {
        engine.add.image(x, y, 'cards', Phaser.Math.RND.pick(frames)).setInteractive();

        x += 6;
        y += 6;
    }
    
    engine.input.on('gameobjectdown', function (pointer, gameObject) {

        if(currentPlayerState != WizardConstants.ClientStates.Turn) {
            return;
        }

        //  Will contain the top-most Game Object (in the display list)
        engine.tweens.add({
            targets: gameObject,
            x: { value: 1100, duration: 1500, ease: 'Power2' },
            y: { value: 500, duration: 500, ease: 'Bounce.easeOut', delay: 150 }
        });

    }, engine);
}