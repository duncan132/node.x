(function () {
  var $ = function (id) { return document.getElementById(id); };
  var grid = $("grid"), player = $("player"), frame = $("gf");
  var note = "";

  function hue(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }

  function render() {
    var term = $("q").value.trim().toLowerCase();
    grid.innerHTML = "";
    var shown = 0;

    GAMES.forEach(function (g) {
      if (term && g.title.toLowerCase().indexOf(term) < 0) return;
      shown++;

      var card = document.createElement("div");
      card.className = "card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Play " + g.title);

      var thumb = document.createElement("div");
      thumb.className = "thumb";
      if (g.image) {
        thumb.style.backgroundImage = "url('" + g.image + "')";
      } else {
        var h = hue(g.title);
        thumb.style.background = "linear-gradient(135deg,hsl(" + h + ",75%,58%),hsl(" + ((h + 50) % 360) + ",80%,48%))";
        thumb.textContent = g.title.charAt(0).toUpperCase();
      }

      var meta = document.createElement("div");
      meta.className = "meta";
      var name = document.createElement("b");
      name.textContent = g.title;
      meta.appendChild(name);

      card.appendChild(thumb);
      card.appendChild(meta);
      card.addEventListener("click", function () { play(g); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(g); }
      });
      grid.appendChild(card);
    });

    if (!shown) {
      var d = document.createElement("div");
      d.className = "empty";
      d.textContent = GAMES.length ? "No games match your search." : (note || "No games yet. Add some in games.js.");
      grid.appendChild(d);
    }
    $("count").textContent = note && !GAMES.length ? note : GAMES.length + (GAMES.length === 1 ? " game" : " games");
  }

  // ----- load a whole folder of games from GitHub -----
  function prettify(file) {
    return file.replace(/\.(html?|htm)$/i, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function addFiles(names, base) {
    var have = {};
    GAMES.forEach(function (g) { have[g.file] = true; });
    names.sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; });
    names.forEach(function (n) {
      var url = base + encodeURIComponent(n);
      if (!have[url]) GAMES.push({ title: prettify(n), file: url });
    });
  }

  function loadRemote(done) {
    var s = typeof GAME_SOURCE !== "undefined" ? GAME_SOURCE : null;
    if (!s || !s.repo || !s.user) return done();

    var base = "https://" + s.user.toLowerCase() + ".github.io/" + s.repo + "/" + (s.folder ? s.folder + "/" : "");
    var key = "gamehub.list." + s.user + "/" + s.repo + "/" + s.folder;

    try {
      var c = JSON.parse(localStorage.getItem(key));
      if (c && Date.now() - c.t < 6 * 3600 * 1000 && c.list && c.list.length) {
        addFiles(c.list, base);
        return done();
      }
    } catch (e) {}

    var api = "https://api.github.com/repos/" + s.user + "/" + s.repo + "/contents/" +
              (s.folder || "") + "?ref=" + encodeURIComponent(s.branch || "main");
    fetch(api)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (items) {
        var names = items
          .filter(function (i) { return i.type === "file" && /\.html?$/i.test(i.name); })
          .map(function (i) { return i.name; });
        if (!names.length) throw new Error("empty");
        try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), list: names })); } catch (e) {}
        addFiles(names, base);
      })
      .catch(function () {
        note = "Couldn't load the game list from GitHub. Check the settings at the top of games.js.";
      })
      .then(done);
  }

  function play(g) {
    $("ptitle").textContent = g.title;
    frame.src = g.file;
    player.classList.add("open");
    player.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePlayer() {
    player.classList.remove("open");
    player.setAttribute("aria-hidden", "true");
    frame.src = "about:blank";
    document.body.style.overflow = "";
  }

  $("back").onclick = closePlayer;
  $("reload").onclick = function () {
    var s = frame.src;
    frame.src = "about:blank";
    setTimeout(function () { frame.src = s; }, 50);
  };
  $("full").onclick = function () {
    var fn = frame.requestFullscreen || frame.webkitRequestFullscreen;
    if (fn) { try { fn.call(frame); } catch (e) {} }
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && player.classList.contains("open") && !document.fullscreenElement) closePlayer();
  });

  $("q").addEventListener("input", render);

  $("count").textContent = "Loading games…";
  loadRemote(render);
})();
