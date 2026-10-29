(() => {
  const $ = s => document.querySelector(s);
  const { esc, genCover } = NXUtil;
  const KEY = "nx_anime_progress";
  const byId = Object.fromEntries(ANIME.map(a => [a.id, a]));
  const enc = encodeURIComponent;

  // ---------- watch progress ----------
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  let prog = read();
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch {} };
  const pk = (id, n) => id + ":" + n;

  function url(p) {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    try { return new URL(p, typeof ANIME_BASE === "string" ? ANIME_BASE : location.href).href; } catch { return p; }
  }

  // The episode a person should continue with for one show (or null if they haven't started).
  function nextFor(a) {
    let best = null;
    for (const ep of a.episodes) {
      const v = prog[pk(a.id, ep.n)];
      if (v && (!best || v.ts > best.v.ts)) best = { ep, v };
    }
    if (!best) return null;
    if (best.v.done) {
      const nx = a.episodes[a.episodes.indexOf(best.ep) + 1];
      return nx ? { a, n: nx.n, pct: 0, ts: best.v.ts } : null;
    }
    return { a, n: best.ep.n, pct: best.v.d ? best.v.t / best.v.d : 0, ts: best.v.ts };
  }

  // ---------- browse ----------
  let aq = "", genre = "All";

  function poster(a) {
    if (!a.poster) return genCover(a.title);
    return `<img src="${esc(url(a.poster))}" alt="" loading="lazy" decoding="async" data-title="${esc(a.title)}">`;
  }

  function animeCard(a, href, sub, pct) {
    return `<a class="card anime" href="${href}">
      <div class="cover">${poster(a)}${pct ? `<i class="bar" style="--p:${Math.round(pct * 100)}%"></i>` : ""}</div>
      <div class="meta"><b>${esc(a.title)}</b><small>${esc(sub)}</small></div>
    </a>`;
  }

  function renderChips() {
    const genres = [...new Set(ANIME.map(a => a.genre).filter(Boolean))];
    const el = $("#animeChips");
    if (genres.length < 2) { el.innerHTML = ""; return; }
    el.innerHTML = ["All", ...genres].map(g => `<button class="chip ${g === genre ? "active" : ""}" data-g="${esc(g)}">${esc(g)}</button>`).join("");
  }

  function renderList() {
    const q = aq.trim().toLowerCase();
    const list = ANIME.filter(a => (genre === "All" || a.genre === genre) && (!q || a.title.toLowerCase().includes(q)));
    $("#animeGrid").innerHTML = list.map(a =>
      animeCard(a, "#anime/" + enc(a.id), [a.genre, a.year].filter(Boolean).join(", ") || "Anime")).join("");
    const empty = $("#animeEmpty");
    empty.hidden = list.length > 0;
    empty.textContent = ANIME.length ? "No anime found." : "No anime yet. Add shows in anime-data.js.";
    $("#animeCount").textContent = ANIME.length + (ANIME.length === 1 ? " show" : " shows");

    const cont = ANIME.map(nextFor).filter(Boolean).sort((x, y) => y.ts - x.ts).slice(0, 10);
    $("#animeContinue").hidden = !cont.length || !!q;
    $("#animeContinueRow").innerHTML = cont.map(c =>
      animeCard(c.a, `#watch/${enc(c.a.id)}/${c.n}`, "Episode " + c.n, c.pct)).join("");
  }

  function showList() {
    $("#animeDetail").hidden = true;
    $("#animeBrowse").hidden = false;
    renderChips();
    renderList();
  }

  function showDetail(id) {
    const a = byId[id];
    if (!a) { location.hash = "anime"; return; }
    const nx = nextFor(a);
    const target = nx ? nx.n : (a.episodes[0] && a.episodes[0].n);
    const label = nx ? `Continue episode ${nx.n}` : "Start watching";
    const eps = a.episodes.map(ep => {
      const v = prog[pk(a.id, ep.n)];
      const pct = v ? (v.done ? 100 : v.d ? Math.round(v.t / v.d * 100) : 0) : 0;
      return `<a class="ep" href="#watch/${enc(a.id)}/${ep.n}">
        <span class="ep-n">${esc(ep.n)}</span>
        <span class="ep-t">${esc(ep.title || "Episode " + ep.n)}</span>
        ${v && v.done ? '<span class="ep-done">Watched</span>' : ""}
        ${pct ? `<i class="bar" style="--p:${pct}%"></i>` : ""}
      </a>`;
    }).join("");

    $("#animeDetail").innerHTML = `
      <a class="btn ghost" href="#anime">← All anime</a>
      <div class="detail">
        <div class="detail-poster">${poster(a)}</div>
        <div class="detail-info">
          <h1>${esc(a.title)}</h1>
          <p class="muted">${esc([a.genre, a.year, a.episodes.length + " episodes"].filter(Boolean).join(", "))}</p>
          ${a.description ? `<p>${esc(a.description)}</p>` : ""}
          ${target !== undefined ? `<a class="btn" href="#watch/${enc(a.id)}/${target}">▶ ${label}</a>` : ""}
        </div>
      </div>
      <h2>Episodes</h2>
      <div class="ep-list">${eps || '<p class="empty">No episodes added yet.</p>'}</div>`;
    $("#animeBrowse").hidden = true;
    $("#animeDetail").hidden = false;
    window.scrollTo(0, 0);
  }

  // ---------- watcher ----------
  let cur = null, vid = null;

  function saveNow(done = false) {
    if (!cur || !vid) return;
    const d = vid.duration, t = vid.currentTime;
    if (!isFinite(d) || d <= 0) return;
    prog[pk(cur.a.id, cur.ep.n)] = { t, d, done: done || t / d > 0.92, ts: Date.now() };
    persist();
  }

  function teardown() {
    saveNow();
    const v = vid;
    vid = null; cur = null;
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    $("#stage").innerHTML = "";
  }

  function go(offset) {
    if (!cur) return;
    const eps = cur.a.episodes;
    const nx = eps[eps.indexOf(cur.ep) + offset];
    location.hash = nx ? `watch/${enc(cur.a.id)}/${nx.n}` : "anime/" + enc(cur.a.id);
  }

  function watch(id, n) {
    const a = byId[id];
    const ep = a && a.episodes.find(e => e.n === n);
    if (!ep) { location.hash = a ? "anime/" + enc(id) : "anime"; return; }
    if (cur && cur.ep === ep) return;
    teardown();
    cur = { a, ep };

    const idx = a.episodes.indexOf(ep);
    $("#watchTitle").textContent = `${a.title}, ${ep.title || "Episode " + ep.n}`;
    $("#prevEp").hidden = idx === 0;
    $("#nextEp").hidden = idx === a.episodes.length - 1;

    const stage = $("#stage");
    if (ep.embed) {
      stage.innerHTML = `<iframe src="${esc(url(ep.embed))}" title="${esc(a.title)}" allow="fullscreen; autoplay" allowfullscreen></iframe>`;
    } else {
      const v = document.createElement("video");
      v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = "metadata";
      v.src = url(ep.src);
      if (ep.subs) {
        const t = document.createElement("track");
        t.kind = "subtitles"; t.label = "Subtitles"; t.srclang = "en"; t.src = url(ep.subs); t.default = true;
        v.appendChild(t);
      }
      const saved = prog[pk(a.id, ep.n)];
      v.addEventListener("loadedmetadata", () => {
        if (saved && !saved.done && saved.t > 5 && saved.t < v.duration - 10) v.currentTime = saved.t;
      });
      let last = 0;
      v.addEventListener("timeupdate", () => { const now = Date.now(); if (now - last > 5000) { last = now; saveNow(); } });
      v.addEventListener("pause", () => saveNow());
      v.addEventListener("ended", () => { saveNow(true); go(1); });
      v.addEventListener("error", () => {
        stage.insertAdjacentHTML("beforeend",
          `<p class="stage-msg">Couldn't load this episode. Check its path in anime-data.js and that your anime site is published.</p>`);
      });
      stage.appendChild(v);
      vid = v;
    }
    $("#watcher").hidden = false;
    document.body.classList.add("playing");
  }

  function closeWatcher() {
    if ($("#watcher").hidden && !cur) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    teardown();
    $("#watcher").hidden = true;
    document.body.classList.remove("playing");
    if (!$("#animeView").hidden) { renderList(); }
  }

  // ---------- events ----------
  $("#animeChips").addEventListener("click", e => {
    const b = e.target.closest(".chip");
    if (!b) return;
    genre = b.dataset.g; renderChips(); renderList();
  });

  let timer;
  $("#search").addEventListener("input", e => {
    if (document.body.dataset.view !== "anime") return;
    clearTimeout(timer);
    timer = setTimeout(() => { aq = e.target.value; renderList(); }, 120);
  });

  $("#watchBack").addEventListener("click", () => { location.hash = cur ? "anime/" + enc(cur.a.id) : "anime"; });
  $("#prevEp").addEventListener("click", () => go(-1));
  $("#nextEp").addEventListener("click", () => go(1));
  $("#watchFs").addEventListener("click", () => { const s = $("#stage"); (s.requestFullscreen || s.webkitRequestFullscreen).call(s); });

  document.addEventListener("keydown", e => {
    if (!cur || $("#watcher").hidden || e.target.tagName === "INPUT") return;
    if (e.key === "Escape" && !document.fullscreenElement) $("#watchBack").click();
    else if (vid && e.target !== vid && e.key === "ArrowRight") vid.currentTime += 10;
    else if (vid && e.target !== vid && e.key === "ArrowLeft") vid.currentTime -= 10;
    else if (e.key === "f") $("#watchFs").click();
    else if (e.key === "n") go(1);
  });

  document.addEventListener("visibilitychange", () => { if (document.hidden) saveNow(); });
  addEventListener("pagehide", () => saveNow());

  window.NXAnime = {
    showList, showDetail, watch, closeWatcher,
    search(q) { aq = q; if (!$("#animeView").hidden) renderList(); }
  };
})();
