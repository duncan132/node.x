// ---- Anime catalog ----
// ANIME_BASE is where your anime repo is published on GitHub Pages.
// For the repo duncan132/node.x-anime this is normally the URL below.
// (Check it in the repo: Settings -> Pages -> "Your site is live at ...")
const ANIME_BASE = "https://duncan132.github.io/node.x-anime/";

// Paths below are relative to ANIME_BASE (or use a full https:// URL).
//   poster: cover photo, e.g. "posters/my-show.jpg"  (falls back to a generated cover if missing)
//   episodes[].src:  a video file (.mp4 / .webm) in your repo
//   episodes[].subs: optional .vtt subtitle file
//   episodes[].embed: use instead of src if the episode is a web page to embed
const ANIME = [
  {
    id: "example-anime",
    title: "Example Anime",
    year: 2024,
    genre: "Action",
    poster: "posters/example-anime.jpg",
    description: "Replace this with a short synopsis of the show.",
    episodes: [
      { n: 1, title: "Episode 1", src: "episodes/example-anime/01.mp4", subs: "episodes/example-anime/01.vtt" },
      { n: 2, title: "Episode 2", src: "episodes/example-anime/02.mp4" }
    ]
  }
];
