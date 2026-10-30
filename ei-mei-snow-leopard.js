(() => {
  "use strict";

  const IMG_SRC = "snow-leopard.png";          // <- your picture
  const THEME_NAME = "ei mei snow leapord";
  const KEY = "nx_eimei_v1";
  const NEW_BGS = [["aurora", "Aurora"], ["fireflies", "Fireflies"], ["rain", "Rain"], ["snowfall", "Snowfall"]];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const panel = document.getElementById("settingsPanel");
  const stockCanvas = document.getElementById("bg");
  if (!panel || !stockCanvas) return;

  // ---------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------
  const css = document.createElement("style");
  css.textContent = `
    /* 1. see-through game cards */
    .card { background: transparent !important; }
    .card .meta { text-shadow: 0 1px 6px rgba(0,0,0,.85); }
    .card .cover img { opacity: .85; }
    .gen-cover {
      background: radial-gradient(circle at 25% 20%, rgba(255,255,255,.10), transparent 55%), rgba(255,255,255,.03) !important;
    }
    .card { border-color: color-mix(in srgb, var(--text) 22%, transparent); }

    /* 2. effects canvas sits just above the stock background canvas */
    #nx2-fx { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }

    /* 3. snow leopard theme: black and white over the whole screen */
    #nx2-bw {
      position: fixed; inset: 0; z-index: 9999; pointer-events: none; display: none;
      -webkit-backdrop-filter: grayscale(1) contrast(1.05);
      backdrop-filter: grayscale(1) contrast(1.05);
    }
    html.nx2-snow #nx2-bw { display: block; }

    /* logo (only used while the theme is on) */
    .nx2-logo-img { display: inline-block; object-fit: cover; border-radius: 22%; background: #fff; }
    .nx2-logo-img svg { display: block; width: 100%; height: 100%; }
    .logo .nx2-logo-img { width: 2rem; height: 2rem; margin-right: .5rem; vertical-align: middle; }
    .logo .nx2-logo-text { vertical-align: middle; }
    #nx2-hero-logo { display: flex; justify-content: center; margin-bottom: 1.2rem; }
    #nx2-hero-logo .nx2-logo-img { width: clamp(84px, 18vw, 140px); height: clamp(84px, 18vw, 140px); }

    /* settings panel additions */
    .nx2-opt, .nx2-theme {
      padding: .55rem .7rem; border-radius: 10px; border: 1px solid var(--line);
      background: var(--bg); text-align: left; transition: all .2s;
    }
    .nx2-opt:hover, .nx2-theme:hover { border-color: var(--text); }
    .nx2-opt.active, .nx2-theme.active { background: var(--accent); color: var(--on-accent); border-color: var(--accent); }
    .nx2-theme { display: flex; flex-direction: column; gap: .15rem; padding: .7rem .8rem; }
    .nx2-theme b { font-weight: 700; }
    .nx2-theme small { opacity: .7; }
  `;
  document.head.appendChild(css);

  // full-screen layer that does the black and white
  const bw = document.createElement("div");
  bw.id = "nx2-bw";
  document.body.appendChild(bw);

  // ---------------------------------------------------------------
  // Saved choices
  // ---------------------------------------------------------------
  const DEFAULT_STATE = { bg: null, theme: false };
  let state = { ...DEFAULT_STATE };
  try { state = { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch {}
  if (!NEW_BGS.some(b => b[0] === state.bg)) state.bg = null;
  state.theme = !!state.theme;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  // ---------------------------------------------------------------
  // Effects canvas: new backgrounds + shooting stars
  // ---------------------------------------------------------------
  const cv = document.createElement("canvas");
  cv.id = "nx2-fx";
  stockCanvas.after(cv);
  const ctx = cv.getContext("2d");
  let w = 0, h = 0, raf = null, last = 0, t = 0, st = {}, bgFx = null;
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const small = () => innerWidth < 700;

  const FX = {
    // Slow glowing ribbons of light
    aurora: {
      init() {
        st = { bands: [{ hue: 140, y: 0.28, p: 0 }, { hue: 175, y: 0.38, p: 2 }, { hue: 265, y: 0.33, p: 4 }, { hue: 300, y: 0.45, p: 1 }] };
      },
      frame(dt) {
        t += dt * 0.0004;
        ctx.globalCompositeOperation = "lighter";
        const step = 16;
        for (const b of st.bands) {
          const base = h * b.y;
          const top = x => base + Math.sin(x * 0.0035 + t * 1.2 + b.p) * h * 0.07 + Math.sin(x * 0.009 - t * 1.7 + b.p * 2) * h * 0.025;
          const thick = x => h * (0.16 + 0.07 * Math.sin(x * 0.005 + t * 0.9 + b.p));
          ctx.beginPath();
          for (let x = 0; x <= w + step; x += step) { const y = top(x); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
          for (let x = w + step; x >= 0; x -= step) ctx.lineTo(x, top(x) + thick(x));
          ctx.closePath();
          const g = ctx.createLinearGradient(0, base - h * 0.1, 0, base + h * 0.3);
          g.addColorStop(0, `hsla(${b.hue},85%,60%,0)`);
          g.addColorStop(0.3, `hsla(${b.hue},85%,60%,0.22)`);
          g.addColorStop(1, `hsla(${b.hue},85%,60%,0)`);
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }
    },

    // Little lights that wander around and glow on and off
    fireflies: {
      init() {
        st = { f: Array.from({ length: small() ? 28 : 60 }, () => ({ x: rnd(0, w), y: rnd(0, h), a: rnd(0, TAU), sp: rnd(0.15, 0.5), ph: rnd(0, TAU), r: rnd(8, 18) })) };
      },
      frame(dt) {
        const k = dt / 16;
        ctx.globalCompositeOperation = "lighter";
        for (const f of st.f) {
          f.a += rnd(-0.08, 0.08) * k;
          f.x += Math.cos(f.a) * f.sp * k; f.y += Math.sin(f.a) * f.sp * k;
          if (f.x < -20) f.x = w + 20; else if (f.x > w + 20) f.x = -20;
          if (f.y < -20) f.y = h + 20; else if (f.y > h + 20) f.y = -20;
          f.ph += 0.03 * k;
          const glow = (Math.sin(f.ph) + 1) / 2;
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
          g.addColorStop(0, `rgba(225,255,150,${0.15 + 0.7 * glow})`);
          g.addColorStop(1, "rgba(225,255,150,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }
    },

    // Slanted rain streaks
    rain: {
      init() {
        st = { d: Array.from({ length: small() ? 90 : 210 }, () => ({ x: rnd(0, w), y: rnd(0, h), len: rnd(10, 24), sp: rnd(0.7, 1.4) })) };
      },
      frame(dt) {
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        for (const d of st.d) {
          d.y += d.sp * dt * 0.9; d.x -= d.sp * dt * 0.12;
          if (d.y > h + 30 || d.x < -30) { d.y = rnd(-60, -10); d.x = rnd(0, w + 100); }
          ctx.strokeStyle = `rgba(190,205,255,${0.14 + d.sp * 0.16})`;
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.len * 0.13, d.y - d.len); ctx.stroke();
        }
      }
    },

    // Soft snowflakes drifting down
    snowfall: {
      init() {
        st = { s: Array.from({ length: small() ? 70 : 150 }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(1, 3.2), sp: rnd(0.3, 0.9), ph: rnd(0, TAU) })) };
      },
      frame(dt) {
        const k = dt / 16;
        for (const s of st.s) {
          s.ph += 0.012 * k;
          s.y += s.sp * k * 0.9; s.x += Math.sin(s.ph) * 0.5 * k;
          if (s.y > h + 6) { s.y = -6; s.x = rnd(0, w); }
          if (s.x < -6) s.x = w + 6; else if (s.x > w + 6) s.x = -6;
          ctx.fillStyle = `rgba(255,255,255,${0.35 + s.r * 0.18})`;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
        }
      }
    }
  };

  // The theme's own effect: twinkling stars with shooting stars crossing the screen
  const snow = {
    stars: [], shots: [], next: 400,
    init() {
      this.stars = Array.from({ length: small() ? 60 : 130 }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(0.4, 1.4), ph: rnd(0, TAU), sp: rnd(0.001, 0.003) }));
      this.shots = [];
    },
    spawn() {
      const a = rnd(0.45, 0.8), speed = rnd(0.7, 1.3), life = rnd(650, 1100);
      this.shots.push({ x: rnd(-0.05 * w, 0.85 * w), y: rnd(-0.05 * h, 0.4 * h), a, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life, max: life, len: rnd(110, 240) });
    },
    frame(dt) {
      for (const s of this.stars) {
        s.ph += s.sp * dt;
        ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.55 * (Math.sin(s.ph) + 1) / 2})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
      }
      this.next -= dt;
      if (this.next <= 0) {
        this.spawn();
        if (Math.random() < 0.25) this.spawn();
        this.next = rnd(600, 2200);
      }
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let i = this.shots.length - 1; i >= 0; i--) {
        const s = this.shots[i];
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        if (s.life <= 0 || s.x > w + 300 || s.y > h + 300) { this.shots.splice(i, 1); continue; }
        const alpha = Math.sin(Math.PI * (1 - s.life / s.max));
        const tx = s.x - Math.cos(s.a) * s.len, ty = s.y - Math.sin(s.a) * s.len;
        const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(1, `rgba(255,255,255,${alpha})`);
        ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, TAU); ctx.fill();
      }
    }
  };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    st = {};
    if (bgFx) bgFx.init();
    snow.init();
  }

  const wantsLoop = () => !document.hidden && (state.bg || (state.theme && !reduce));

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(ts - last, 50); last = ts;
    ctx.clearRect(0, 0, w, h);
    if (bgFx) bgFx.frame(dt);
    if (state.theme && !reduce) snow.frame(dt);
  }

  function refreshLoop() {
    if (wantsLoop()) {
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    } else {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      ctx.clearRect(0, 0, w, h);
    }
  }

  // ---------------------------------------------------------------
  // Logo (swapped in only while the theme is on)
  // ---------------------------------------------------------------
  const FALLBACK_SVG =
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#fff"/>' +
    '<g fill="#111"><ellipse cx="20" cy="26" rx="9" ry="7"/><ellipse cx="9" cy="17" rx="3.4" ry="4.4"/>' +
    '<ellipse cx="15" cy="10" rx="3.4" ry="4.6"/><ellipse cx="25" cy="10" rx="3.4" ry="4.6"/>' +
    '<ellipse cx="31" cy="17" rx="3.4" ry="4.4"/></g></svg>';

  function makeLogo() {
    const img = new Image();
    img.className = "nx2-logo-img";
    img.alt = THEME_NAME + " logo";
    img.decoding = "async";
    img.addEventListener("error", () => {
      const span = document.createElement("span");
      span.className = "nx2-logo-img";
      span.innerHTML = FALLBACK_SVG;
      img.replaceWith(span);
    }, { once: true });
    img.src = IMG_SRC;
    return img;
  }

  let origLogo = null;
  function setLogo(on) {
    const logo = document.querySelector(".topbar .logo");
    if (logo) {
      if (on && origLogo === null) {
        origLogo = logo.innerHTML;
        const text = document.createElement("b");
        text.className = "nx2-logo-text";
        text.textContent = "ei mei";
        logo.replaceChildren(makeLogo(), text);
      } else if (!on && origLogo !== null) {
        logo.innerHTML = origLogo;
        origLogo = null;
      }
    }
    const hero = document.querySelector(".landing-hero");
    const existing = document.getElementById("nx2-hero-logo");
    if (hero && on && !existing) {
      const wrap = document.createElement("div");
      wrap.id = "nx2-hero-logo";
      wrap.appendChild(makeLogo());
      hero.prepend(wrap);
    } else if (!on && existing) {
      existing.remove();
    }
  }

  // ---------------------------------------------------------------
  // Settings panel: theme button + extra background buttons
  // ---------------------------------------------------------------
  function sync() {
    panel.querySelectorAll(".nx2-opt").forEach(b => b.classList.toggle("active", b.dataset.nx2bg === state.bg));
    const tb = panel.querySelector("#nx2-theme-btn");
    if (tb) tb.classList.toggle("active", state.theme);
    if (state.bg) panel.querySelectorAll(".bg-opt").forEach(b => b.classList.remove("active"));
  }

  // settings.js rebuilds the panel (e.g. "Reset appearance"), so add our pieces whenever they're missing
  function inject() {
    if (panel.querySelector("#nx2-themes")) { sync(); return; }
    const head = panel.querySelector(".sp-head");
    if (!head) return;
    const sec = document.createElement("div");
    sec.className = "sp-row";
    sec.id = "nx2-themes";
    sec.innerHTML = `Themes<button class="nx2-theme" id="nx2-theme-btn"><b>${THEME_NAME}</b><small>Black and white with shooting stars</small></button>`;
    head.after(sec);
    const choices = panel.querySelector("#bgChoices");
    if (choices) {
      for (const [id, name] of NEW_BGS) {
        const b = document.createElement("button");
        b.className = "nx2-opt";
        b.dataset.nx2bg = id;
        b.textContent = name;
        choices.appendChild(b);
      }
    }
    sync();
  }

  // The stock background must be switched off while one of ours is running; click its "Off" button for it.
  let selfClick = false;
  function stockOff() {
    const off = panel.querySelector('.bg-opt[data-bg="none"]');
    if (!off) return;
    selfClick = true;
    off.click();
    selfClick = false;
  }

  function apply() {
    save();
    const next = state.bg ? FX[state.bg] : null;
    if (next !== bgFx) { bgFx = next; st = {}; if (bgFx) bgFx.init(); }
    document.documentElement.classList.toggle("nx2-snow", state.theme);
    setLogo(state.theme);
    refreshLoop();
    sync();
  }

  panel.addEventListener("click", e => {
    if (selfClick) return;
    if (e.target.closest("#nx2-theme-btn")) { state.theme = !state.theme; apply(); return; }
    const mine = e.target.closest(".nx2-opt");
    if (mine) { state.bg = mine.dataset.nx2bg; stockOff(); apply(); return; }
    if (e.target.closest("#resetSettings")) { state = { ...DEFAULT_STATE }; apply(); return; }
    if (state.bg && e.target.closest(".bg-opt")) { state.bg = null; apply(); }
  });

  new MutationObserver(inject).observe(panel, { childList: true });
  document.addEventListener("visibilitychange", refreshLoop);
  let timer;
  addEventListener("resize", () => { clearTimeout(timer); timer = setTimeout(resize, 150); });

  // ---------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------
  resize();
  inject();
  if (state.bg && window.NXSettings && NXSettings.get().bgStyle !== "none") stockOff();
  apply();
})();
