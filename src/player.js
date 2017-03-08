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