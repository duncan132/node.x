// Add your games here. Only id, title and url are required.
//   cover:  optional image. A bare file name ("slope.jpg") is looked up in COVER_DIR below;
//           a path with a slash or a full https:// URL is used as written.
//           If it's missing or fails to load, a generated cover is shown instead.
//   emoji:  shown on the generated cover.
//   save:   true  -> progress saving is turned on for this game (see nx-save.js).
const COVER_DIR = "covers/";

const GAMES = [
  { id: "slope",      title: "Slope",       url: "games/slope.html",       category: "Arcade",   emoji: "🎱" },
  { id: "snake",      title: "Snake",       url: "games/snake.html",       category: "Arcade",   emoji: "🐍" },
  { id: "2048",       title: "2048",        url: "games/2048.html",        category: "Puzzle",   emoji: "🔢", save: true },
  { id: "tetris",     title: "Tetris",      url: "games/tetris.html",      category: "Puzzle",   emoji: "🧱", save: true },
  { id: "racer",      title: "Racer",       url: "games/racer.html",       category: "Racing",   emoji: "🏎️" },
  { id: "flappy",     title: "Flappy",      url: "games/flappy.html",      category: "Arcade",   emoji: "🐤" },
  { id: "chess",      title: "Chess",       url: "games/chess.html",       category: "Strategy", emoji: "♟️", save: true },
  { id: "runner",     title: "Runner",      url: "games/runner.html",      category: "Action",   emoji: "🏃" },
  { id: "shooter",    title: "Shooter",     url: "games/shooter.html",     category: "Action",   emoji: "🔫" },
  { id: "platformer", title: "Platformer",  url: "games/platformer.html",  category: "Action",   emoji: "🍄", save: true },
  { id: "minesweep",  title: "Minesweeper", url: "games/minesweeper.html", category: "Puzzle",   emoji: "💣" },
  { id: "pong",       title: "Pong",        url: "games/pong.html",        category: "Arcade",   emoji: "🏓" }
];
