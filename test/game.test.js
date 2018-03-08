const Game = require('../lib').Game;
const fs = require('fs');
const path = require('path');

const gamesPath = 'fixtures/games';

let testGames = [];

// Preflight
for (let file of fs.readdirSync(path.join(__dirname, gamesPath))) {
    let contentPath = path.join(__dirname, `${gamesPath}/${file}`);
    let body = fs.readFileSync(contentPath, 'utf8');
    testGames.push(new Game({ body, path : contentPath }));
}

for (let game of testGames) {
    test(`Game: ${game.title}`, function() {
        expect(game).toHaveProperty("rawText");
        expect(game).toHaveProperty("contentPath");
        expect(game).toHaveProperty("slug");
    })
}