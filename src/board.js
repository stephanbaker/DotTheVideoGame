/*jshint esversion: 6 */
var Token = require('./token.js').Token;
var TokenState = require('./token.js').TokenState;
var Players = require('./player.js').Players;

class Board extends THREE.Object3D {
    constructor(players, size, width, height) {
        super();

        this.numberOfPlayers = players;
        this.size = size;
        this.width = Math.min(width, height); 
        this.height = this.width;
        this.tokenSize = (this.width * 0.9) / this.size;
        this.spacing = (this.width * 0.1) / this.size;
        this.offsetx = (this.tokenSize + this.spacing) * ((this.size - 1) / 2);
        this.offsety = (this.tokenSize + this.spacing) * ((this.size - 1) / 2);
        this.position.x -= this.offsetx;
        this.position.y -= this.offsety;
        this.reset();
    }

    reset() {
        while(this.children.length > 0) {
            this.remove(this.children[0]);
        }
        
        this.tokens = [];
        for(var i=0; i<this.size; i++) {
            for(var j=0; j<this.size; j++) {
                var token = new Token(this.tokenSize, {x:i, y:j});
                token.position.x = this.offsetx;
                token.position.y = this.offsety;
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

    getNeighbors(token, distance=1) {
        if (!token) {
            return [];
        }

        var neighbors = [];
        for(var x = Math.max(0, token.location.x - distance); x <= Math.min(this.size-1, token.location.x + distance); x++) {
            for(var y = Math.max(0, token.location.y - distance); y <= Math.min(this.size-1, token.location.y + distance); y++) {
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

    playerCanMove(player) {
        if(!this.tokens) {
            return false;
        }

        for(var t=0; t<this.tokens.length; t++) {
            var token = this.tokens[t];
            if(token.occupant != player) {
                continue;
            }

            var neighbors = this.getNeighbors(token, 2);
            if(neighbors) {
                for(var n=0; n<neighbors.length; n++) {
                    var neighbor = neighbors[n];
                    if(neighbor.state == TokenState.Vacant) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    construct(callback, duration = 1000) { 
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