// ---------------------------------------------------------------
// Where your games come from
// ---------------------------------------------------------------
// The hub reads this list from GitHub every time it needs to (it remembers it for 6 hours),
// so every .html file in these folders becomes a game with a title, category and cover.
// Needs GitHub Pages turned on for that repo (Settings -> Pages -> Deploy from a branch -> master / root).
const GAME_SOURCES = [
  {
    repo: "duncan132/Offline-HTML-Games-Pack",   // GitHub user/repo
    branch: "master",
    folders: ["offline", "other"],                // only .html files inside these folders are used
    // pages: "https://duncan132.github.io/Offline-HTML-Games-Pack/",   // optional: this is the default
  }
];

// ---------------------------------------------------------------
// Your own tweaks (all optional)
// ---------------------------------------------------------------
// The key is the game's id: its file name in lowercase with dashes ("Moto X3M.html" -> "moto-x3m").
// You can set: title, category, emoji, cover, save (true = progress saving), hidden (true = remove it).
//   cover: a bare file name ("slope.jpg") is looked up in COVER_DIR; or use a full https:// link.
const GAME_OVERRIDES = {
  // "slope":       { category: "Arcade", emoji: "🎱", cover: "slope.jpg", save: true },
  // "some-game":   { hidden: true },
};

// Games you add by hand. Same id as an automatic game = yours wins.
//   { id: "my-game", title: "My Game", url: "https://...", category: "Arcade", emoji: "🎮", save: true }
const GAMES = [];

const COVER_DIR = "covers/";
