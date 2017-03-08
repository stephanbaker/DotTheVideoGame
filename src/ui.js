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