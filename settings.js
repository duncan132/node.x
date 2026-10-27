(function () {
  var KEY = "gamehub.settings.v1";
  var root = document.documentElement;

  var PRESETS = [
    { n: "Midnight", bg: "#0b0a17", a: "#8b6cff", b: "#2ee6d6" },
    { n: "Daylight", bg: "#f1eeff", a: "#6c4cf5", b: "#4f7bff" },
    { n: "Ocean",    bg: "#06141f", a: "#2d9cff", b: "#22e3c4" },
    { n: "Sunset",   bg: "#1a0b12", a: "#ff6a3d", b: "#ff3d9a" },
    { n: "Forest",   bg: "#08140e", a: "#3ddc84", b: "#c6f542" },
    { n: "Neon",     bg: "#07040f", a: "#ff2bd6", b: "#00f0ff" },
    { n: "Rose",     bg: "#190a14", a: "#ff6fa8", b: "#ffb36b" },
    { n: "Lava",     bg: "#140806", a: "#ff3b1f", b: "#ffb800" },
    { n: "Arctic",   bg: "#eaf6ff", a: "#1f8bff", b: "#12c7b8" },
    { n: "Mint",     bg: "#eafaf3", a: "#12b57a", b: "#3aa0ff" },
    { n: "Peach",    bg: "#fff1ea", a: "#ff6b4a", b: "#ff3d8b" },
    { n: "Graphite", bg: "#0f1012", a: "#c7ccd6", b: "#7a8294" },
    { n: "Royal",    bg: "#0a0a1f", a: "#4f5bff", b: "#b36bff" },
    { n: "Gold",     bg: "#120e05", a: "#ffc233", b: "#ff8a2b" },
    { n: "Cyber",    bg: "#0a0f0a", a: "#b7ff2a", b: "#2affd1" },
    { n: "Candy",    bg: "#fff0fa", a: "#ff4fc3", b: "#7a5cff" }
  ];
  var ACCENTS = ["#8b6cff","#6c4cf5","#4f7bff","#2d9cff","#22d3ee","#2ee6d6","#12c7b8","#3ddc84","#a3e635","#facc15",
                 "#ffb800","#ff8a2b","#ff6a3d","#ff3b1f","#ff4d6d","#ff3d9a","#ff2bd6","#d946ef","#a855f7","#e5e7eb"];
  var BGS = ["#0b0a17","#06141f","#08140e","#1a0b12","#140806","#0f1012","#000000","#f1eeff","#eaf6ff","#eafaf3","#fff1ea","#ffffff"];
  var INKS = ["#ffffff","#f3f1ff","#dbeafe","#d1fae5","#fde68a","#fecdd3","#1b1740","#0f172a","#064e3b","#3b2a14"];
  var SIZES = [{ n: "Small", v: 0.9 }, { n: "Default", v: 1 }, { n: "Large", v: 1.15 }, { n: "Huge", v: 1.3 }];
  var DEFAULTS = { a: "#8b6cff", b: "#2ee6d6", bg: "#0b0a17", ink: "", scale: 1, anim: true, pre: "Midnight" };

  var S = load();

  function load() {
    var s = Object.assign({}, DEFAULTS);
    try {
      var r = JSON.parse(localStorage.getItem(KEY));
      if (r && typeof r === "object") Object.assign(s, r);
    } catch (e) {}
    return s;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function rgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h.replace(/./g, "$&$&");
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lum(c) {
    var f = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  }
  function shift(c, deg) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, h = 0, s = 0;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    h = (h + deg / 360) % 1;
    if (!s) return [Math.round(l * 255), Math.round(l * 255), Math.round(l * 255)];
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function f(t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(function (v) { return Math.round(v * 255); });
  }

  function apply() {
    var bg = rgb(S.bg), A = rgb(S.a), B = rgb(S.b), C = shift(A, 70);
    var dark = lum(bg) < 0.35;
    var ink = S.ink || (dark ? "#f3f1ff" : "#1b1740");
    var st = root.style;
    function set(k, v) { st.setProperty(k, v); }

    set("--bg", S.bg);
    set("--surface", dark ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.65)");
    set("--ink", ink);
    set("--muted", "color-mix(in srgb, " + ink + " 62%, " + S.bg + ")");
    set("--line", "rgba(" + A.join(",") + ",.24)");
    set("--accent", S.a);
    set("--accent2", S.b);
    set("--accent-ink", (lum(A) + lum(B)) / 2 > 0.38 ? "#0b0a17" : "#ffffff");
    set("--orb1", A.join(","));
    set("--orb2", B.join(","));
    set("--orb3", C.join(","));
    set("--orb-alpha", dark ? ".32" : ".35");
    set("--dot", (dark ? B.map(function (v) { return Math.round(v + (255 - v) * 0.55); }) : A).join(","));
    set("--shadow", dark ? "0 18px 50px rgba(0,0,0,.4)" : "0 18px 50px rgba(60,40,140,.18)");
    set("--text-scale", String(S.scale));

    st.colorScheme = dark ? "dark" : "light";
    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.setAttribute("data-anim", S.anim ? "on" : "off");
  }

  function section(t, html) { return '<div class="sp-sec"><h3>' + t + "</h3>" + html + "</div>"; }

  var scrim = document.createElement("div");
  scrim.className = "scrim";
  var sp = document.createElement("aside");
  sp.className = "sp";
  sp.setAttribute("role", "dialog");
  sp.setAttribute("aria-label", "Settings");
  sp.setAttribute("aria-hidden", "true");
  sp.innerHTML =
    '<div class="sp-head"><h2>Settings</h2><button class="btn ghost" id="spClose">Close</button></div>' +
    '<div class="sp-body">' +
      section("Color themes", '<div class="pres" id="spPres"></div>') +
      section("Accent color", '<div class="sw" id="swA"></div>') +
      section("Second accent color", '<div class="sw" id="swB"></div>') +
      section("Background color", '<div class="sw" id="swBg"></div>') +
      section("Text color", '<div class="sw" id="swInk"></div>') +
      section("Text size",
        '<input type="range" id="spScale" min="0.8" max="1.5" step="0.05" aria-label="Text size">' +
        '<div class="chips" id="spSizes"></div><div class="val" id="spScaleVal"></div>') +
      section("Effects", '<label class="tog"><input type="checkbox" id="spAnim"> Animated background</label>') +
      '<div class="sp-foot"><button class="btn ghost" id="spReset">Reset to default</button></div>' +
    "</div>";
  document.body.appendChild(scrim);
  document.body.appendChild(sp);

  function $(id) { return document.getElementById(id); }
  function change(patch) { Object.assign(S, patch); apply(); save(); sync(); }

  PRESETS.forEach(function (p) {
    var b = document.createElement("button");
    b.className = "pre";
    b.setAttribute("data-n", p.n);
    b.innerHTML = '<i style="background:linear-gradient(135deg,' + p.bg + " 0 40%," + p.a + " 40% 72%," + p.b + ' 72%)"></i>' + p.n;
    b.onclick = function () { change({ a: p.a, b: p.b, bg: p.bg, ink: "", pre: p.n }); };
    $("spPres").appendChild(b);
  });

  function row(id, colors, key, autoChip) {
    var box = $(id);
    if (autoChip) {
      var a = document.createElement("button");
      a.className = "chip"; a.textContent = "Auto"; a.setAttribute("data-auto", key);
      a.onclick = function () { var p = {}; p[key] = ""; p.pre = ""; change(p); };
      box.appendChild(a);
    }
    colors.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "c"; b.setAttribute("data-c", c); b.setAttribute("aria-label", c);
      b.style.background = c;
      b.onclick = function () { var p = {}; p[key] = c; p.pre = ""; change(p); };
      box.appendChild(b);
    });
    var w = document.createElement("label");
    w.className = "cw"; w.title = "Pick any color";
    var inp = document.createElement("input");
    inp.type = "color"; inp.setAttribute("data-k", key); inp.setAttribute("aria-label", "Custom color");
    inp.oninput = function () { var p = {}; p[key] = inp.value; p.pre = ""; change(p); };
    w.appendChild(inp);
    box.appendChild(w);
  }
  row("swA", ACCENTS, "a");
  row("swB", ACCENTS, "b");
  row("swBg", BGS, "bg");
  row("swInk", INKS, "ink", true);

  SIZES.forEach(function (s) {
    var b = document.createElement("button");
    b.className = "chip"; b.textContent = s.n; b.setAttribute("data-v", s.v);
    b.onclick = function () { change({ scale: s.v }); };
    $("spSizes").appendChild(b);
  });
  $("spScale").oninput = function (e) { change({ scale: parseFloat(e.target.value) }); };
  $("spAnim").onchange = function (e) { change({ anim: e.target.checked }); };
  $("spReset").onclick = function () { Object.assign(S, DEFAULTS); apply(); save(); sync(); };

  function sync() {
    var autoInk = lum(rgb(S.bg)) < 0.35 ? "#f3f1ff" : "#1b1740";
    sp.querySelectorAll(".pre").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-n") === S.pre); });
    [["swA", "a"], ["swB", "b"], ["swBg", "bg"], ["swInk", "ink"]].forEach(function (x) {
      $(x[0]).querySelectorAll("button.c").forEach(function (b) {
        b.classList.toggle("on", b.getAttribute("data-c").toLowerCase() === String(S[x[1]]).toLowerCase());
      });
    });
    sp.querySelectorAll("input[type=color]").forEach(function (i) {
      var k = i.getAttribute("data-k");
      i.value = S[k] || autoInk;
    });
    sp.querySelector("[data-auto]").classList.toggle("on", !S.ink);
    $("spScale").value = S.scale;
    $("spScaleVal").textContent = "Text size: " + Math.round(S.scale * 100) + "%";
    $("spSizes").querySelectorAll(".chip").forEach(function (b) {
      b.classList.toggle("on", Math.abs(parseFloat(b.getAttribute("data-v")) - S.scale) < 0.001);
    });
    $("spAnim").checked = !!S.anim;
  }

  var opener = $("settingsBtn");
  function openPanel() {
    sp.classList.add("open"); scrim.classList.add("open");
    sp.setAttribute("aria-hidden", "false");
    $("spClose").focus();
  }
  function closePanel() {
    sp.classList.remove("open"); scrim.classList.remove("open");
    sp.setAttribute("aria-hidden", "true");
    if (opener) opener.focus();
  }
  if (opener) opener.onclick = openPanel;
  $("spClose").onclick = closePanel;
  scrim.onclick = closePanel;
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sp.classList.contains("open")) closePanel();
  });

  apply();
  sync();
})();
