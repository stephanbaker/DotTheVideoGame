# Dot: The Video Game
A simple clone of an old turn-based stategy game.

![Dot: The Video Game](https://github.com/stephanbaker/DotTheVideoGame/blob/master/screenshot.png "Dot: The Video Game")

## How to play
- Clone the repo and load `index.html` in your browser.
- Two players, turn based
- Each player starts with two tokens.
- You can move one token a maximum of 2 spaces per turn.
- Moving one space will cause your token to be duplicated.
- Moving two spaces will leave an empty space where you were previously.
- After moving your token, any adjacent enemy tokens will be captured.
- The game ends when all of a players pieces are captured, or there are no available moves.

## Tools used
- [Three.js](https://threejs.org/)
- [Tween.js](https://github.com/tweenjs/tween.js/)
- [Browserify](http://browserify.org/)

## Goals
After playing `Spot: The Video Game` on the Nintendo Entertainment System recently, I decided I wanted a light version of the game that I could easily play with a friend in a web browser.  This was put together over the course of a few afternoons.  The goal was to keep it simple, make it quickly, and have some fun, so don't go looking for production code here.

## Non-Goals
- You won't see a lot of shine and polish.
- The code isn't likely to be "production ready".

## Javascript Modules and Browserify
The JavaScript code for this game is written using modules. While browsers still don't support the `require` method used in tools like Node.js, using [Browserify](http://browserify.org/) allows me to bundle the source into a single, browser compatible file. I've included a bash script (`compile.sh`) that shows the command I've been using to get this done.