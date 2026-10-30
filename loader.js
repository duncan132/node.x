// Finds your games on GitHub and fills in GAMES (settings are in games.js).
(() => {
  const MAX_AGE = 6 * 60 * 60 * 1000;   // look at GitHub again after 6 hours
  const CACHE = "nx_gamelist_v1:";

  // First match wins. Used to pick an emoji for the generated cover and a category from the name.
  const EMOJI_RULES = [
    [/snake/i, "🐍"], [/pong/i, "🏓"], [/flappy|bird/i, "🐤"], [/mine ?sweep/i, "💣"], [/tetris|\bblocks?\b/i, "🧱"],
    [/2048/, "🔢"], [/pac|ghost/i, "👻"], [/zombie/i, "🧟"], [/space|alien|galaga|asteroid|invader|rocket|galaxy/i, "🚀"],
    [/fish|shark|ocean/i, "🐟"], [/cookie|clicker|idle|tycoon/i, "🍪"], [/mario|platform/i, "🍄"], [/ninja/i, "🥷"],
    [/dino/i, "🦖"], [/sword|knight|dungeon|rpg|quest|dragon/i, "⚔️"], [/sniper|shoot|\bgun|strike|\bwar\b|battle|\bfps\b/i, "🔫"],
    [/chess/i, "♟️"], [/solitaire|poker|blackjack|\bcards?\b|\buno\b|rummy|mahjong|domino/i, "🃏"],
    [/soccer|football|fifa/i, "⚽"], [/basket/i, "🏀"], [/golf/i, "⛳"], [/tennis/i, "🎾"], [/bowling/i, "🎳"], [/boxing|fight/i, "🥊"],
    [/\brac(e|ing)\b|drift|\bcars?\b|drive|kart|rally|truck|parking/i, "🏎️"], [/moto|bike/i, "🏍️"],
    [/\brun|jump|dash/i, "🏃"], [/puzzle|sudoku|match|merge|jewel|candy|bubble|word/i, "🧩"], [/tower|defen[cs]e/i, "🏰"],
    [/pinball|\bball\b|bounce/i, "⚪"], [/maze/i, "🧭"], [/pool|billiard/i, "🎱"]
  ];
  const CAT_RULES = [
    [/\brac(e|ing)\b|drift|\bcars?\b|drive|driving|kart|rally|truck|parking|moto|bike/i, "Racing"],
    [/soccer|football|basket|golf|tennis|baseball|hockey|bowling|boxing|\bski|skate|surf|pool|billiard|sport|olympic/i, "Sports"],
    [/solitaire|poker|blackjack|\bcards?\b|\buno\b|rummy|mahjong|domino/i, "Cards"],
    [/chess|checkers|reversi|othello|backgammon|strategy|tower|defen[cs]e|empire|kingdom|conquer|battleship/i, "Strategy"],
    [/2048|puzzle|sudoku|match|tetris|\bblocks?\b|tile|sokoban|maze|mine ?sweep|bubble|jewel|candy|word|merge|sliding|pipe|connect|tic tac|memory|brain|logic/i, "Puzzle"],
    [/clicker|idle|incremental|cookie|tycoon/i, "Idle"],
    [/shoot|\bgun|sniper|zombie|ninja|sword|knight|dungeon|rpg|fight|\bwar\b|battle|strike|\brun|jump|dash|platform|mario|escape|\bfps\b/i, "Action"],
    [/snake|pong|flappy|pac|breakout|space|invader|asteroid|galaga|arcade|\bball\b|pinball|bounce|dino/i, "Arcade"]
  ];
  const guess = (rules, text, fallback) => { for (const [re, v] of rules) if (re.test(text)) return v; return fallback; };

  const prettify = s => s.replace(/[-_.]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim()
    .replace(/(^|\s)([a-z])/g, (m, a, c) => a + c.toUpperCase());
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "game";

  // Asks GitHub for the list of files (remembered for a while so we don't hit GitHub's rate limit).
  async function listPaths(src) {
    const key = CACHE + src.repo + "@" + src.branch;
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(key)); } catch {}
    if (cached && Date.now() - cached.t < MAX_AGE) return cached.paths;
    try {
      const r = await fetch(`https://api.github.com/repos/${src.repo}/git/trees/${encodeURIComponent(src.branch)}?recursive=1`,
        { headers: { Accept: "application/vnd.github+json" } });
      if (r.status === 403 || r.status === 429) throw new Error("GitHub is limiting requests right now, try again in a bit");
      if (r.status === 404) throw new Error("repo or branch not found");
      if (!r.ok) throw new Error("GitHub answered " + r.status);
      const j = await r.json();
      const paths = (j.tree || []).filter(n => n.type === "blob" && /\.html?$/i.test(n.path)).map(n => n.path);
      try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), paths })); } catch {}
      return paths;
    } catch (e) {
      if (cached) return cached.paths;        // an old list is better than no games
      throw e;
    }
  }

  function gamesFrom(src, paths, used) {
    const [owner, repoName] = src.repo.split("/");
    const base = src.pages || `https://${owner.toLowerCase()}.github.io/${repoName}/`;
    const folders = (src.folders && src.folders.length ? src.folders : [""]).map(f => f.replace(/^\/+|\/+$/g, ""));
    const out = [];
    for (const path of paths) {
      const folder = folders.find(f => !f || path.startsWith(f + "/"));
      if (folder === undefined) continue;
      const rel = (folder ? path.slice(folder.length + 1) : path).split("/");
      const file = rel[rel.length - 1];
      let name, dir;
      if (/^index\.html?$/i.test(file)) {          // a game kept in its own folder: folder/index.html
        if (rel.length < 2) continue;
        name = rel[rel.length - 2]; dir = rel[rel.length - 3];
      } else {
        name = file.replace(/\.html?$/i, ""); dir = rel[rel.length - 2];
      }
      const title = prettify(name);
      let id = slug(name), n = 2;
      while (used.has(id)) id = slug(name) + "-" + n++;
      used.add(id);
      out.push({
        id, title,
        url: base + path.split("/").map(encodeURIComponent).join("/"),
        category: dir ? prettify(dir) : guess(CAT_RULES, title, "Other"),
        emoji: guess(EMOJI_RULES, title, "")
      });
    }
    return out;
  }

  window.NXGamesReady = (async () => {
    const manual = GAMES.splice(0);
    const used = new Set(manual.map(g => g.id));
    const found = [], errors = [];
    for (const src of GAME_SOURCES) {
      try { found.push(...gamesFrom(src, await listPaths(src), used)); }
      catch (e) { errors.push(e.message); }
    }
    const merged = new Map(found.map(g => [g.id, g]));
    for (const g of manual) merged.set(g.id, { ...merged.get(g.id), ...g });
    const all = [...merged.values()]
      .map(g => ({ ...g, ...(GAME_OVERRIDES[g.id] || {}) }))
      .filter(g => !g.hidden)
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
    GAMES.push(...all);
    if (!all.length) {
      window.NXLoadError = errors.length
        ? "Couldn't load your games from GitHub (" + errors[0] + ")."
        : "No games were found. Check GAME_SOURCES in games.js.";
    }
  })();
})();

