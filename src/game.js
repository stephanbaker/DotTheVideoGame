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
        this.playerIndex = 0;
        this.state = states.StartGame;
        this.selectedTarget = null;
        this.selectedDestination = null;
        this.numberOfTurns = 0;
        this.ui = new UI();
        this.ui.setBackgroundColor(Colors.Background);
        this.ui.setBaseTextColor(Colors.PrimaryText);

        this.scores = [];
        for(var i=0; i<numberOfPlayers; i++) {
            this.scores.push(0);
        }
        
        this.ui.setMessage(this.state);
        this.ui.setMessageColor(Colors.PrimaryText);
        this.ui.setScoreOneColor(getPlayer(0).color);
        this.ui.setScoreTwoColor(getPlayer(1).color);
    }

    start() {
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