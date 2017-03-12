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
            console.log("Selected");
            color = Colors.SelectedToken;
        } else if(this.highlighted) {
            console.log("Highlighted");
            color = Colors.HighlightedToken;
        } else {
            switch(this.state) {
                case TokenState.Occupied:
                    console.log("Occupied");
                    color = this.occupant.color;
                    break;
                case TokenState.Selected:
                    console.log("Selected State");
                    color = Colors.SelectedToken;
                    break;
                default:
                    console.log("Default");
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