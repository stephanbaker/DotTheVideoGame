/*jshint esversion: 6 */
var Board = require('./board.js').Board;
var Colors = require('./colors.js').Colors;
var Players = require('./player.js').Players;
var getPlayer = require('./player.js').getPlayer;
var TokenState = require('./token.js').TokenState;
var Game = require('./game.js').Game;

var lightColor = 0xFFFFFF;
var backgroundColor = Colors.Black;

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
renderer.setClearColor(backgroundColor);
renderer.setViewport(0, 0, width, height);

var light = new THREE.DirectionalLight( lightColor, 1 );
light.position.set( 200,200,200 ).normalize();
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

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mouseup', onDocumentMouseUp, false);

// Run the main loop
function main(time) {
    requestAnimationFrame( main );
    TWEEN.update(time);
    board.update();
    renderer.render( scene, camera );
}

requestAnimationFrame( main );
game.start();