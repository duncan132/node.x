// ===== Option 1: load a whole GitHub folder of games automatically =====
// 1. Fork the games repo to your own GitHub account.
// 2. Turn on GitHub Pages for the fork (Settings > Pages).
// 3. Put YOUR GitHub username below. Leave repo as "" to turn this off.
const GAME_SOURCE = {
  user:   "duncan132",                    // your GitHub username
  repo:   "Offline-HTML-Games-Pack",      // name of your fork ("" = off)
  branch: "master",
  folder: "offline"                       // folder that holds the game files
};

// ===== Option 2: add single games by hand =====
//   title: name shown on the card
//   file:  path or full link to the game's HTML file
//   image: optional thumbnail. Leave it out to get a colored tile.
const GAMES = [
  // { title: "Snake", file: "games/snake.html" },
];
