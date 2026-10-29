(() => {
  const $ = s => document.querySelector(s);
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const byId = Object.fromEntries(GAMES.map(g => [g.id, g]));
  let favs = store.get("nx_favs", []).filter(id => byId[id]);
  let recent = store.get("nx_recent", []).filter(id => byId[id]);
  let cat = "All", query = "", currentId = null;

  const grid = $("#grid"), chips = $("#chips"), player = $("#player"), frame = $("#frame");

  // ---------- covers ----------
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  function cover(g) {
    if (g.cover) return `<img src="${esc(g.cover)}" alt="" loading="lazy" decoding="async">`;
    const h = hash(g.title) % 360;
    const icon = g.emoji || g.title.trim().charAt(0).toUpperCase();
    return `<div class="gen-cover" style="--h:${h}"><span>${icon}</span></div>`;
  }

  function card(g) {
    const fav = favs.includes(g.id);
    return `<div class="card" data-id="${esc(g.id)}" tabindex="0" role="button" aria-label="Play ${esc(g.title)}">
      <div class="cover">${cover(g)}
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

  // ---------- player ----------
  function play(id, pushHash = true) {
    const g = byId[id];
    if (!g) return;
    currentId = id;
    recent = [id, ...recent.filter(r => r !== id)].slice(0, 20);
    store.set("nx_recent", recent);
    $("#playerTitle").textContent = g.title;
    updatePlayerFav();
    frame.src = g.url;
    player.hidden = false;
    document.body.classList.add("playing");
    if (pushHash) location.hash = "play/" + encodeURIComponent(id);
  }

  function closePlayer(pushHash = true) {
    if (document.fullscreenElement) document.exitFullscreen();
    frame.src = "about:blank";
    player.hidden = true;
    document.body.classList.remove("playing");
    currentId = null;
    renderAll();
    if (pushHash && location.hash) history.pushState("", document.title, location.pathname + location.search);
  }

  function route() {
    const m = location.hash.match(/^#play\/(.+)$/);
    if (m) play(decodeURIComponent(m[1]), false);
    else if (!player.hidden) closePlayer(false);
  }

  // ---------- events ----------
  function onActivate(e) {
    const favBtn = e.target.closest("[data-fav]");
    if (favBtn) { e.stopPropagation(); toggleFav(favBtn.dataset.fav); return; }
    const c = e.target.closest(".card");
    if (c) play(c.dataset.id);
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

  $("#randomBtn").addEventListener("click", () => play(GAMES[Math.floor(Math.random() * GAMES.length)].id));
  $("#backBtn").addEventListener("click", () => closePlayer());
  $("#reloadBtn").addEventListener("click", () => { if (currentId) frame.src = byId[currentId].url; });
  $("#fsBtn").addEventListener("click", () => { (frame.requestFullscreen || frame.webkitRequestFullscreen).call(frame); });
  $("#playerFav").addEventListener("click", () => currentId && toggleFav(currentId));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !player.hidden && !document.fullscreenElement) closePlayer(); });
  window.addEventListener("hashchange", route);

  // ---------- init ----------
  $("#count").textContent = `${GAMES.length} games ready to play`;
  renderChips();
  renderAll();
  route();
})();
