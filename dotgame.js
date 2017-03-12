(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint esversion: 6 */
var Token = require('./token.js').Token;
var TokenState = require('./token.js').TokenState;
var Players = require('./player.js').Players;

class Board extends THREE.Object3D {
    constructor(players, size, width, height) {
        super();

        this.size = size;
        this.width = Math.min(width, height); 
        this.height = this.width;
        this.tokenSize = (this.width * 0.9) / this.size;
        this.spacing = (this.width * 0.1) / this.size;
        this.reset();
        this.position.x -= (this.tokenSize + this.spacing) * ((this.size - 1) / 2);
        this.position.y -= (this.tokenSize + this.spacing) * ((this.size - 1) / 2);
    }

    reset() {
        while(this.children.length > 0) {
            this.remove(this.children[0]);
        }
        
        this.tokens = [];
        for(var i=0; i<this.size; i++) {
            for(var j=0; j<this.size; j++) {
                var token = new Token(this.tokenSize, {x:i, y:j});
                token.initPosition.x = i * (this.spacing + this.tokenSize);
                token.initPosition.y = j * (this.spacing + this.tokenSize);
                token.scale.x = 0.2;
                token.scale.y = 0.2;
                token.scale.z = 0.2;
                this.tokens.push(token);
                this.add( token );
            }
        }
    }

    getTokens() {
        return this.tokens;
    }

    getToken(x, y) {
        var index = x * this.size + y;
        if (this.tokens.length > index) {
            return this.tokens[index];
        }
        return null;
    }

    getNeighbors(token) {
        if (!token) {
            return [];
        }

        var neighbors = [];
        for(var x = Math.max(0, token.location.x - 1); x <= Math.min(this.size-1, token.location.x + 1); x++) {
            for(var y = Math.max(0, token.location.y - 1); y <= Math.min(this.size-1, token.location.y + 1); y++) {
                if (x == token.location.x && y == token.location.y) {
                    continue;
                }
                
                var n = this.getToken(x, y);
                if (n) {
                    neighbors.push(n);
                }
            }
        }

        return neighbors;
    }

    getInfo() {
        var info = {
            vacancy: 0,
            score1: 0,
            score2: 0,
        };

        if(this.tokens) {
            this.tokens.forEach((token) => {
                if (token.state == TokenState.Vacant) {
                    info.vacancy++;
                }

                if (token.state == TokenState.Occupied) {
                    switch(token.occupant) {
                        case Players.One:
                            info.score1++;
                            break;
                        case Players.Two:
                            info.score2++;
                            break;
                    }
                }
            });
        }

        return info;
    }

    getPlayerOccupiedCount(player) {
        var count = 0;
        if(this.tokens) {
            this.tokens.forEach((token) => {
                if (token.state == TokenState.Occupied && token.occupant == player) {
                    count++;
                }
            });
        }
        return count;
    }

    construct(callback, duration = 2000) { 
        if(!this.tokens) {
            return;
        }

        if(this.constructionTimeout) {
            window.clearTimeout(this.constructionTimeout);
        }

        this.constructionTimeout = window.setTimeout(() => {
            var corner1 = 0;
            var corner2 = this.size - 1;
            var corner3 = this.size * (this.size - 1);
            var corner4 = this.size * this.size - 1;

            if (this.tokens.length > corner1) {
                this.tokens[corner1].setOccupant(Players.One);
            }

            if (this.tokens.length > corner2) {
                this.tokens[corner2].setOccupant(Players.Two);
            }

            if (this.tokens.length > corner3) {
                this.tokens[corner3].setOccupant(Players.Two);
            }

            if (this.tokens.length > corner4) {
                this.tokens[corner4].setOccupant(Players.One);
            }

            callback();
        }, duration);

        this.tokens.forEach((token) => {
            var resizeTime = 0.2 * duration;
            var moveTime = 0.8 * duration;
            var resize = new TWEEN.Tween(token.scale).to({x:1, y:1, z:1}, resizeTime);
            resize.easing = TWEEN.Easing.Quadratic.InOut;
            var move = new TWEEN.Tween(token.position).to({
                x: token.initPosition.x,
                y: token.initPosition.y,
            }, Math.random() * (moveTime - 200) + 200);
            move.easing = TWEEN.Easing.Quadratic.InOut;
            move.chain(resize);
            move.start();
        });
    }

    update() {
        this.tokens.forEach((token) => {
            token.update();
        });
    }
}

exports.Board = Board;
},{"./player.js":5,"./token.js":6}],2:[function(require,module,exports){
/*jshint esversion: 6 */
const Palette = {
    LightPink: 0xF3EAEA,
    DarkPink: 0xE2BDBD,
    Blue: 0x5DBEE0,
    Red: 0xC86B6B,
    Black: 0x000000,
    White: 0xFFFFFF,
    LightGray: 0xDDDDDD,
    DarkGray: 0x333333,
    Magenta: 0xFF00FF,
    Yellow: 0xFFFF00
};

const Colors = {
    Blue: Palette.Blue, 
    Red: Palette.Red, 
    Background: Palette.White,
    PrimaryText: Palette.DarkGray,
    Token: Palette.LightGray,
    SelectedToken: Palette.Magenta,
    HighlightedToken: Palette.Yellow,
    Lighting: Palette.White
};

exports.Colors = Colors;
},{}],3:[function(require,module,exports){
/*jshint esversion: 6 */
const TokenState = require('./token.js').TokenState;
const getPlayer = require('./player.js').getPlayer;
const Colors = require('./colors.js').Colors;
const UI = require('./ui.js').UI;

const states = {
    StartGame: "Start Game",
    SelectToken: "Select Token",
    SelectLocation: "Select Location",
    EndTurn: "End Turn",
    GameOver: "Game Over",
};

class Game {
    constructor(numberOfPlayers, board) {
        this.numberOfPlayers = numberOfPlayers;
        this.board = board;
        this.ui = new UI();
        this.ui.setBackgroundColor(Colors.Background);
        this.ui.setBaseTextColor(Colors.PrimaryText);
        
        this.ui.setMessageColor(Colors.PrimaryText);
        this.ui.setScoreOneColor(getPlayer(0).color);
        this.ui.setScoreTwoColor(getPlayer(1).color);
    }

    reset() {
        this.playerIndex = 0;
        this.state = states.StartGame;
        this.ui.setMessage(this.state);
        this.selectedTarget = null;
        this.selectedDestination = null;
        this.numberOfTurns = 0;

        this.scores = [];
        for(var i=0; i<this.numberOfPlayers; i++) {
            this.scores.push(0);
        }

        this.ui.setScoreOne(2);
        this.ui.setScoreTwo(2);
    
        this.next();
    }

    highlight(token) {
        switch(this.state) {
            case states.SelectToken:
                if(this.tokenOwnedByCurrentPlayer(token)) {
                    token.highlight(Colors.HighlightedToken);
                }
                break;
            case states.SelectLocation:
                if(token.state == TokenState.Vacant) {
                    token.highlight(getPlayer(this.playerIndex).color);
                }
                break;
        }
    }

    unhighlight(token) {
        token.unhighlight();
    }

    tokenOwnedByCurrentPlayer(token) {
        return token.occupant == getPlayer(this.playerIndex);
    }

    getDistance(location1, location2) {
        var diffX = Math.abs(location2.x - location1.x);
        var diffY = Math.abs(location2.y - location1.y);
        return Math.max(diffX, diffY);
    }

    capture(token) {
        var occupant = getPlayer(this.playerIndex);
        token.setOccupant(occupant);
        var neighbors = this.board.getNeighbors(this.selectedDestination);
        if (neighbors) {
            neighbors.forEach((n) => {
                if(n.state == TokenState.Occupied && !this.tokenOwnedByCurrentPlayer(n)) {
                    n.setOccupant(occupant);
                }
            });
        }
        
    }

    allPlayersCanMove() {
        for(var pindex=0; pindex<this.numberOfPlayers; pindex++) {
            if (this.board.getPlayerOccupiedCount(getPlayer(pindex)) == 0) {
                return false;
            }
        }
        return true;
    }

    printState(hint) {
        var p = getPlayer(this.playerIndex);
        console.log("State: ", p.name, this.state, hint);
    }

    next(token){
        var hint = "";
        var repeat = false;
        switch(this.state) {
            case states.StartGame:
                this.board.construct(() => {
                    this.state = states.SelectToken;
                    this.printState(hint);
                    this.ui.setMessage(this.state);
                });
                // this.state = states.SelectToken;
                return;
            case states.SelectToken:
                if(!token || token.state == TokenState.Vacant || !this.tokenOwnedByCurrentPlayer(token)) {
                    hint = "(Hint: Select one of your own tokens.)";
                    break;
                }

                if(this.selectedTarget) {
                    this.selectedTarget.deselect();
                }

                this.selectedTarget = token;
                this.selectedTarget.select();
                this.state = states.SelectLocation;
                break;
            case states.SelectLocation:
                if(!token || token.state == TokenState.Occupied) {
                    hint = "(Hint: Select a vacant location.)";
                    break;
                }

                this.selectedDestination = token;
                var distance = this.getDistance(this.selectedDestination.location, this.selectedTarget.location);
                if (distance > 2) {
                    hint = "(Hint: You can move a maximum of 2 units.)";
                    break;
                }

                this.selectedTarget.deselect();
                this.selectedTarget.unhighlight();
                if (distance > 1) {
                    this.selectedTarget.setOccupant(null);
                }
                this.selectedTarget = null;

                this.capture(this.selectedDestination);
                this.state = states.EndTurn;  
                repeat = true;
                break;
            case states.EndTurn:
                var boardInfo = this.board.getInfo();
                this.ui.setScoreOne(boardInfo.score1);
                this.ui.setScoreTwo(boardInfo.score2);
                
                if (boardInfo.vacancy === 0 || !this.allPlayersCanMove()) {
                    this.state = states.GameOver;
                    repeat = true;
                } else {
                    this.playerIndex = (this.playerIndex + 1) % this.numberOfPlayers;
                    this.state = states.SelectToken;
                }
                break;
            case states.GameOver:
                return;
            default:
                break;
        }

        this.printState(hint);
        this.ui.setMessage(this.state);
        if (repeat) this.next();
    }
}

exports.Game = Game;
},{"./colors.js":2,"./player.js":5,"./token.js":6,"./ui.js":7}],4:[function(require,module,exports){
/*jshint esversion: 6 */
var Board = require('./board.js').Board;
var Colors = require('./colors.js').Colors;
var Players = require('./player.js').Players;
var getPlayer = require('./player.js').getPlayer;
var TokenState = require('./token.js').TokenState;
var Game = require('./game.js').Game;

var canvas = document.getElementById('scene');
canvas.width  = canvas.clientWidth;
canvas.height = canvas.clientHeight;
var width = canvas.width;
var height = canvas.height;

var raycaster = new THREE.Raycaster();

// Setup the scene
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
camera.position.z = 500;

var renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setClearColor(Colors.Background);
renderer.setViewport(0, 0, width, height);

var light = new THREE.AmbientLight( Colors.Lighting );
scene.add( light );

// Setup the game
var players = 2;
var board = new Board(players, 10, width, height);
var game = new Game(players, board);
scene.add(board);

// Setup mouse input
var mouse = new THREE.Vector3(-1,-1,-1);
var previousHighlight = null;
function onDocumentMouseMove( event ) {
    event.preventDefault();

    var rect = canvas.getBoundingClientRect();
    var clickX = event.clientX - rect.left;
    var clickY = event.clientY - rect.top;

    mouse.x = ( clickX / width ) * 2 - 1;
    mouse.y = - ( clickY / height ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );

    var intersections = raycaster.intersectObjects( board.getTokens(), false );
    if (intersections.length > 0) {
        if (previousHighlight) {
            game.unhighlight(previousHighlight);
            previousHighlight = null;
        }

        previousHighlight = intersections[0].object;
        game.highlight(previousHighlight);
    }
}

function onDocumentMouseUp( event ) {
    event.preventDefault();

    var intersections = raycaster.intersectObjects( board.getTokens(), false );
    if (intersections.length > 0) {
        game.next(intersections[0].object);
    }
}

function reset(event) {
    if(event) {
        event.preventDefault();
    }

    board.reset();
    game.reset();
}

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mouseup', onDocumentMouseUp, false);
document.getElementById("resetgame").addEventListener( 'click', reset, false);

// Run the main loop
function main(time) {
    requestAnimationFrame( main );
    TWEEN.update(time);
    board.update();
    renderer.render( scene, camera );
}

reset();
requestAnimationFrame( main );
},{"./board.js":1,"./colors.js":2,"./game.js":3,"./player.js":5,"./token.js":6}],5:[function(require,module,exports){
/*jshint esversion: 6 */
const Colors = require('./colors.js').Colors;
class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}

var Players = {
    One: new Player("Player 1", Colors.Red),
    Two: new Player("Player 2", Colors.Blue),
};

function getPlayer(index) {
    switch(index) {
        case 0:
            return Players.One;
        case 1:
            return Players.Two;
        default:
            return null;
    }
}

exports.Players = Players;
exports.getPlayer = getPlayer;
},{"./colors.js":2}],6:[function(require,module,exports){
/*jshint esversion: 6 */
const Colors = require('./colors.js').Colors;

var TokenState = {
    Vacant: "Vacant",
    Occupied: "Occupied",
};

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

class Token extends THREE.Mesh {
    constructor(size, location) {
        super();

        this.size = size;
        this.location = location;
        this.geometry = new THREE.BoxGeometry( this.size, this.size, this.size );
        this.material = new THREE.MeshPhongMaterial( {
            color: Colors.Token,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        });

        this.state = TokenState.Vacant;
        this.selected = false;
        this.highlighted = false;
        this.highlightColor = Colors.Token;
        this.occupant = null;

        this.initPosition = {x:0, y:0, z:0};
    }

    setOccupant(player, duration=200) {
        if(!player) {
            this.occupant = null;
            this.state = TokenState.Vacant;
        } else {
            this.occupant = player;
            this.state = TokenState.Occupied;
        }

        var rads = degreesToRadians(180);
        var rotate = new TWEEN.Tween(this.rotation).to({
            x: this.rotation.x + rads, 
            y: this.rotation.y + rads, 
            z: this.rotation.z + rads
        }, duration);
        rotate.easing = TWEEN.Easing.Quadratic.InOut; 

        var scaleDown = new TWEEN.Tween(this.scale).to({x:0, y:0, z:0}, duration/2);
        scaleDown.easing = TWEEN.Easing.Quadratic.In;
        scaleDown.onStart(()=>{rotate.start();});
        scaleDown.onComplete(() => {this.updateColor();});
        
        var scaleUp = new TWEEN.Tween(this.scale).to({x:1, y:1, z:1}, duration/2);
        scaleUp.easing = TWEEN.Easing.Quadratic.Out;

        scaleDown.chain(scaleUp);
        scaleDown.start();
    }

    select() {
        this.selected = true;
        this.updateColor();
    }

    deselect() {
        this.selected = false;
        this.updateColor();
    }

    updateColor() {
        var color = Colors.Token;
        if(this.selected) {
            color = Colors.SelectedToken;
        } else if(this.highlighted) {
            color = Colors.HighlightedToken;
        } else {
            switch(this.state) {
                case TokenState.Occupied:
                    color = this.occupant.color;
                    break;
                case TokenState.Selected:
                    color = Colors.SelectedToken;
                    break;
                default:
                    break;
            }
        }
        
        this.material.color.setHex(color);
    }

    highlight(color) {
        this.highlighted = true;
        this.highlightColor = color;
        this.updateColor();
    }

    unhighlight() {
        this.highlighted = false;
        this.updateColor();
    }

    update() {}
}

exports.Token = Token;
exports.TokenState = TokenState;
},{"./colors.js":2}],7:[function(require,module,exports){
/*jshint esversion: 6 */
function colorToString(color) {
    return "#" + color.toString(16);
}

class UI {
    constructor() {
        this.scoreOne = document.getElementById('score1');
        this.scoreTwo = document.getElementById('score2');
        this.message = document.getElementById('message');
        this.body = document.body;
    }

    setBackgroundColor(color) {
        this.body.style.backgroundColor = colorToString(color);
    }

    setBaseTextColor(color) { 
        this.body.style.color = colorToString(color);
    }

    setScoreOne(text) {
        this.scoreOne.innerText = text;
    }

    setScoreOneColor(color) {
        this.scoreOne.style.color = colorToString(color);
    }

    setScoreTwo(text) {
        this.scoreTwo.innerText = text;
    }

    setScoreTwoColor(color) {
        this.scoreTwo.style.color = colorToString(color);
    }

    setMessage(message) {
        this.message.innerText = message;
    }

    setMessageColor(color) {
        this.message.style.color = colorToString(color);
    }
}

exports.UI = UI;
},{}]},{},[4]);
