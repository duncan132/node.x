(async () => {
  window.NXScriptLoaded = true;   // lets index.html know this file arrived
  const $ = s => document.querySelector(s);
  const { esc, genCover } = NXUtil;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  await window.NXGamesReady;   // loader.js fills GAMES from your GitHub repo

  const byId = Object.fromEntries(GAMES.map(g => [g.id, g]));
  const siteById = Object.fromEntries(ANIME_SITES.map(s => [s.id, s]));
  let favs = store.get("nx_favs", []).filter(id => byId[id]);
  let recent = store.get("nx_recent", []).filter(id => byId[id]);
  let cat = "All", query = "", currentId = null, currentSite = null, view = "";

  const grid = $("#grid"), chips = $("#chips"), player = $("#player"), frame = $("#frame");
  const sitePlayer = $("#sitePlayer"), siteFrame = $("#siteFrame");

  // ---------- covers ----------
  function coverSrc(c) {
    if (/^(https?:)?\/\//i.test(c) || c.includes("/")) return c;
    return (typeof COVER_DIR === "string" ? COVER_DIR : "covers/") + c;
  }
  function cover(g) {
    if (!g.cover) return genCover(g.title, g.emoji);
    return `<img src="${esc(coverSrc(g.cover))}" alt="" loading="lazy" decoding="async" data-title="${esc(g.title)}" data-icon="${esc(g.emoji || "")}">`;
  }

  function card(g) {
    const fav = favs.includes(g.id);
    const badge = g.save ? `<span class="badge">${NXSaves.has(g.id) ? "Continue" : "Saves progress"}</span>` : "";
    return `<div class="card" data-id="${esc(g.id)}" tabindex="0" role="button" aria-label="Play ${esc(g.title)}">
      <div class="cover">${cover(g)}${badge}
        <button class="fav ${fav ? "on" : ""}" data-fav="${esc(g.id)}" aria-label="Favorite">${fav ? "★" : "☆"}</button>
      </div>
      <div class="meta"><b>${esc(g.title)}</b><small>${esc(g.category || "Game")}</small></div>
    </div>`;
  }

  function siteCard(s) {
    return `<a class="card site" href="#site/${encodeURIComponent(s.id)}">
      <div class="cover">${cover(s)}</div>
      <div class="meta"><b>${esc(s.title)}</b><small>${esc(s.description || "Website")}</small></div>
    </a>`;
  }

  // ---------- rendering ----------
  function renderRow(el, section, ids) {
    const list = ids.map(id => byId[id]).filter(Boolean);
    section.hidden = !list.length;
    el.innerHTML = list.map(card).join("");
  }

  function renderChips() {
    const cats = ["All", ...new Set(GAMES.map(g => g.category).filter(Boolean))];
    chips.innerHTML = cats.map(c => `<button class="chip ${c === cat ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  }

  function renderGrid() {
    const q = query.trim().toLowerCase();
    const list = GAMES.filter(g =>
      (cat === "All" || g.category === cat) &&
      (!q || g.title.toLowerCase().includes(q) || (g.category || "").toLowerCase().includes(q))
    );
    grid.innerHTML = list.map(card).join("");
    $("#empty").hidden = list.length > 0;
    $("#gridTitle").textContent = q ? `Results for "${query.trim()}"` : (cat === "All" ? "All games" : cat);
  }

  function renderAll() {
    renderRow($("#recentRow"), $("#recentSection"), recent.slice(0, 10));
    renderRow($("#favRow"), $("#favSection"), favs);
    renderGrid();
  }

  function renderSites() {
    $("#siteGrid").innerHTML = ANIME_SITES.map(siteCard).join("");
    $("#siteEmpty").hidden = ANIME_SITES.length > 0;
  }

  // ---------- favorites ----------
  function toggleFav(id) {
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [id, ...favs];
    store.set("nx_favs", favs);
    if (currentId === id) updatePlayerFav();
    renderAll();
  }
  function updatePlayerFav() { $("#playerFav").textContent = favs.includes(currentId) ? "★" : "☆"; }

  // ---------- game player ----------
  function openGame(id) {
    const g = byId[id];
    if (!g || (currentId === id && !player.hidden)) return;
    currentId = id;
    recent = [id, ...recent.filter(r => r !== id)].slice(0, 20);
    store.set("nx_recent", recent);
    $("#playerTitle").textContent = g.title;
    $("#saveReset").hidden = !g.save;
    $("#saveStatus").textContent = g.save ? (NXSaves.has(id) ? "Saved progress found" : "Progress saves automatically") : "";
    updatePlayerFav();
    frame.src = g.url;
    player.hidden = false;
    document.body.classList.add("playing");
  }

  function hidePlayer() {
    if (player.hidden) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    frame.src = "about:blank";
    player.hidden = true;
    document.body.classList.remove("playing");
    currentId = null;
    renderAll();
  }

  // ---------- anime and manga sites ----------
  function openSite(id) {
    const s = siteById[id];
    if (!s || (currentSite === id && !sitePlayer.hidden)) return;
    currentSite = id;
    $("#siteTitle").textContent = s.title;
    $("#siteOpen").href = s.url;
    siteFrame.src = s.url;
    sitePlayer.hidden = false;
    document.body.classList.add("playing");
  }

  function hideSite() {
    if (sitePlayer.hidden) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    siteFrame.src = "about:blank";
    sitePlayer.hidden = true;
    document.body.classList.remove("playing");
    currentSite = null;
  }

  // ---------- game saves (postMessage bridge, see nx-save.js) ----------
  function sendLoaded() {
    const g = byId[currentId];
    if (!g || !g.save || !frame.contentWindow) return;
    const s = NXSaves.get(g.id);
    let origin = "*";
    try { const o = new URL(g.url, location.href).origin; if (o !== "null") origin = o; } catch {}
    frame.contentWindow.postMessage({ nx: "loaded", data: s ? s.data : null }, origin);
  }

  frame.addEventListener("load", () => { if (currentId) sendLoaded(); });

  window.addEventListener("message", e => {
    if (!currentId || e.source !== frame.contentWindow) return;
    const m = e.data, g = byId[currentId];
    if (!m || typeof m !== "object" || !g || !g.save) return;
    if (m.nx === "save") {
      let ok = false;
      try { ok = JSON.stringify(m.data).length < 2e6 && NXSaves.set(g.id, m.data); } catch {}
      $("#saveStatus").textContent = ok
        ? "Saved " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        : "Couldn't save";
    } else if (m.nx === "load") {
      sendLoaded();
    }
  });

  $("#saveReset").addEventListener("click", () => {
    if (!currentId || !confirm("Delete saved progress for this game?")) return;
    NXSaves.remove(currentId);
    $("#saveStatus").textContent = "Saved progress deleted";
    frame.src = byId[currentId].url;
  });

  // ---------- views + routing ----------
  function setView(v) {
    if (v === view) return;
    view = v;
    document.body.dataset.view = v;
    $("#landing").hidden = v !== "home";
    $("#home").hidden = v !== "games";
    $("#animeView").hidden = v !== "anime";
    document.querySelectorAll(".tabs a").forEach(a => a.classList.toggle("active", a.dataset.tab === v));
    const s = $("#search");
    s.value = ""; s.hidden = v !== "games";
    query = ""; renderGrid();
    window.scrollTo(0, 0);
  }

  const dec = s => { try { return decodeURIComponent(s); } catch { return s; } };

  // #            home (pick Games or Anime and Manga)
  // #games       the games     #play/<game>   a game
  // #anime       the sites     #site/<site>   a site
  function route() {
    const [a, b] = location.hash.slice(1).split("/").map(dec);
    const game = a === "play" && byId[b];
    const site = a === "site" && siteById[b];
    if (!game) hidePlayer();
    if (!site) hideSite();

    if (game) { setView("games"); openGame(b); }
    else if (site) { setView("anime"); openSite(b); }
    else if (a === "games") setView("games");
    else if (a === "anime") setView("anime");
    else setView("home");
  }

  // ---------- events ----------
  function onActivate(e) {
    const favBtn = e.target.closest("[data-fav]");
    if (favBtn) { e.stopPropagation(); toggleFav(favBtn.dataset.fav); return; }
    const c = e.target.closest(".card");
    if (c) location.hash = "play/" + encodeURIComponent(c.dataset.id);
  }
  ["#grid", "#recentRow", "#favRow"].forEach(sel => {
    const el = $(sel);
    el.addEventListener("click", onActivate);
    el.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("card")) { e.preventDefault(); onActivate(e); } });
  });

  chips.addEventListener("click", e => {
    const b = e.target.closest(".chip");
    if (!b) return;
    cat = b.dataset.cat;
    renderChips(); renderGrid();
  });

  let timer;
  $("#search").addEventListener("input", e => {
    clearTimeout(timer);
    timer = setTimeout(() => { query = e.target.value; renderGrid(); }, 120);
  });

  $("#randomBtn").addEventListener("click", () => { if (!GAMES.length) return; location.hash = "play/" + encodeURIComponent(GAMES[Math.floor(Math.random() * GAMES.length)].id); });
  $("#backBtn").addEventListener("click", () => { location.hash = "games"; });
  $("#reloadBtn").addEventListener("click", () => { if (currentId) frame.src = byId[currentId].url; });
  $("#fsBtn").addEventListener("click", () => { (frame.requestFullscreen || frame.webkitRequestFullscreen).call(frame); });
  $("#playerFav").addEventListener("click", () => currentId && toggleFav(currentId));

  $("#siteBack").addEventListener("click", () => { location.hash = "anime"; });
  $("#siteReload").addEventListener("click", () => { if (currentSite) siteFrame.src = siteById[currentSite].url; });
  $("#siteFs").addEventListener("click", () => { (siteFrame.requestFullscreen || siteFrame.webkitRequestFullscreen).call(siteFrame); });

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || document.fullscreenElement) return;
    if (!player.hidden) location.hash = "games";
    else if (!sitePlayer.hidden) location.hash = "anime";
  });
  window.addEventListener("hashchange", route);

  // ---------- init ----------
  $("#count").textContent = GAMES.length ? `${GAMES.length} games ready to play` : "No games loaded";
  $("#pickGames").textContent = GAMES.length ? `${GAMES.length} games` : "Play in your browser";
  $("#pickAnime").textContent = ANIME_SITES.length === 1 ? "1 site" : `${ANIME_SITES.length} sites`;
  renderChips();
  renderAll();
  renderSites();
  if (!GAMES.length && window.NXLoadError) {
    $("#empty").hidden = false;
    $("#empty").innerHTML = `${esc(NXLoadError)} <button class="btn" onclick="location.reload()">Try again</button>`;
  }
  route();
})();
