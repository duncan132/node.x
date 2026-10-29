(() => {
  const $ = s => document.querySelector(s);
  const { esc, genCover } = NXUtil;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const byId = Object.fromEntries(GAMES.map(g => [g.id, g]));
  let favs = store.get("nx_favs", []).filter(id => byId[id]);
  let recent = store.get("nx_recent", []).filter(id => byId[id]);
  let cat = "All", query = "", currentId = null, view = "";

  const grid = $("#grid"), chips = $("#chips"), player = $("#player"), frame = $("#frame");

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
    $("#home").hidden = v !== "games";
    $("#animeView").hidden = v !== "anime";
    document.querySelectorAll(".tabs a").forEach(a => a.classList.toggle("active", a.dataset.tab === v));
    const s = $("#search");
    s.value = ""; s.hidden = v !== "games";
    query = ""; renderGrid();
    window.scrollTo(0, 0);
  }

  const dec = s => { try { return decodeURIComponent(s); } catch { return s; } };

  // #play/<game>   #anime
  function route() {
    const [a, b] = location.hash.slice(1).split("/").map(dec);
    const playing = a === "play" && byId[b];
    if (!playing) hidePlayer();

    if (playing) { setView("games"); openGame(b); }
    else if (a === "anime") setView("anime");
    else setView("games");
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
    if (view !== "games") return;
    clearTimeout(timer);
    timer = setTimeout(() => { query = e.target.value; renderGrid(); }, 120);
  });

  $("#randomBtn").addEventListener("click", () => { location.hash = "play/" + encodeURIComponent(GAMES[Math.floor(Math.random() * GAMES.length)].id); });
  $("#backBtn").addEventListener("click", () => { location.hash = ""; });
  $("#reloadBtn").addEventListener("click", () => { if (currentId) frame.src = byId[currentId].url; });
  $("#fsBtn").addEventListener("click", () => { (frame.requestFullscreen || frame.webkitRequestFullscreen).call(frame); });
  $("#playerFav").addEventListener("click", () => currentId && toggleFav(currentId));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !player.hidden && !document.fullscreenElement) location.hash = ""; });
  window.addEventListener("hashchange", route);

  // ---------- init ----------
  $("#count").textContent = `${GAMES.length} games ready to play`;
  renderChips();
  renderAll();
  route();
})();
