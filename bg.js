// Animated backgrounds. The one that's used is picked in Settings (the gear icon).
(() => {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, raf = null, last = 0, t = 0;
  let style = "", color = [255, 255, 255], bgc = [0, 0, 0], st = {};
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, on: false };

  const A = a => `rgba(${color[0]},${color[1]},${color[2]},${a})`;
  const hex = s => { const n = parseInt(String(s).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const small = () => innerWidth < 700;
  const fillBg = a => { ctx.fillStyle = `rgba(${bgc[0]},${bgc[1]},${bgc[2]},${a})`; ctx.fillRect(0, 0, w, h); };
  const CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789".split("");

  const FX = {
    // Stars rushing past you; they lean toward your mouse
    stars: {
      init() {
        st = { s: Array.from({ length: small() ? 150 : 320 }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(0.05, 1) })), cx: w / 2, cy: h / 2 };
        fillBg(1);
      },
      frame(dt) {
        fillBg(0.3);
        const tx = mouse.on ? w / 2 + (mouse.x - w / 2) * 0.3 : w / 2;
        const ty = mouse.on ? h / 2 + (mouse.y - h / 2) * 0.3 : h / 2;
        st.cx += (tx - st.cx) * 0.05; st.cy += (ty - st.cy) * 0.05;
        const k = w * 0.35;
        for (const s of st.s) {
          const pz = s.z + dt * 0.0009;
          s.z -= dt * 0.0003;
          const x1 = st.cx + (s.x / s.z) * k, y1 = st.cy + (s.y / s.z) * k;
          if (s.z <= 0.02 || x1 < -50 || x1 > w + 50 || y1 < -50 || y1 > h + 50) {
            s.x = rnd(-1, 1); s.y = rnd(-1, 1); s.z = 1; continue;
          }
          const x0 = st.cx + (s.x / pz) * k, y0 = st.cy + (s.y / pz) * k;
          ctx.strokeStyle = A(Math.min(1, (1 - s.z) * 1.1));
          ctx.lineWidth = (1 - s.z) * 2 + 0.3;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
      }
    },

    // Dots linked by lines; your mouse pushes them away and connects to the nearby ones
    network: {
      init() {
        const n = Math.min(95, Math.floor((w * h) / 16000));
        st = { p: Array.from({ length: n }, () => ({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.4, 0.4), vy: rnd(-0.4, 0.4), r: rnd(0.8, 2.2) })) };
        ctx.clearRect(0, 0, w, h);
      },
      frame(dt) {
        ctx.clearRect(0, 0, w, h);
        const k = dt / 16, p = st.p;
        for (let i = 0; i < p.length; i++) {
          const a = p[i];
          a.x += a.vx * k; a.y += a.vy * k;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
          if (mouse.on) {
            const dx = a.x - mouse.x, dy = a.y - mouse.y, d = dx * dx + dy * dy;
            if (d < 22000 && d > 1) { const f = (1 - d / 22000) * 1.4 / Math.sqrt(d); a.x += dx * f; a.y += dy * f; }
          }
          ctx.fillStyle = A(0.8);
          ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
          for (let j = i + 1; j < p.length; j++) {
            const b = p[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
            if (d < 16900) { ctx.strokeStyle = A(0.22 * (1 - d / 16900)); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
          }
          if (mouse.on) {
            const dx = a.x - mouse.x, dy = a.y - mouse.y, d = dx * dx + dy * dy;
            if (d < 29000) { ctx.strokeStyle = A(0.35 * (1 - d / 29000)); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
          }
        }
      }
    },

    // Falling characters
    matrix: {
      init() {
        const fs = small() ? 14 : 16;
        st = { fs, acc: 0, drops: Array.from({ length: Math.ceil(w / fs) }, () => rnd(-60, 0)) };
        fillBg(1);
      },
      frame(dt) {
        st.acc += dt;
        if (st.acc < 50) return;
        st.acc = 0;
        fillBg(0.09);
        ctx.font = st.fs + "px monospace";
        for (let i = 0; i < st.drops.length; i++) {
          const y = st.drops[i] * st.fs;
          if (y > 0) { ctx.fillStyle = A(0.95); ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], i * st.fs, y); }
          if (y > h && Math.random() > 0.975) st.drops[i] = 0; else st.drops[i] += 1;
        }
      }
    },

    // Layers of flowing lines; your mouse makes a ripple
    waves: {
      init() { st = {}; ctx.clearRect(0, 0, w, h); },
      frame(dt) {
        ctx.clearRect(0, 0, w, h);
        t += dt * 0.0006;
        const layers = 7;
        for (let i = 0; i < layers; i++) {
          const f = i / (layers - 1), amp = h * (0.05 + f * 0.06), base = h * (0.3 + f * 0.45);
          ctx.beginPath();
          for (let x = 0; x <= w + 8; x += 8) {
            let y = base + Math.sin(x * 0.004 + t * (1 + f) + i) * amp + Math.sin(x * 0.009 - t * 1.3 + i * 2) * amp * 0.45;
            if (mouse.on) { const dx = (x - mouse.x) / 160, dy = (base - mouse.y) / 260; y -= 46 * Math.exp(-dx * dx - dy * dy); }
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.strokeStyle = A(0.08 + f * 0.34);
          ctx.lineWidth = 1 + f * 1.2;
          ctx.stroke();
        }
      }
    },

    // Retro perspective grid with a sun; it slides with your mouse
    grid: {
      init() { st = { cx: w / 2 }; ctx.clearRect(0, 0, w, h); },
      frame(dt) {
        ctx.clearRect(0, 0, w, h);
        t += dt * 0.0004;
        const hy = h * 0.56;
        st.cx += ((mouse.on ? w / 2 + (mouse.x - w / 2) * 0.15 : w / 2) - st.cx) * 0.06;
        const cx = st.cx, sr = Math.min(w, h) * 0.24;
        for (let i = 0; i < 7; i++) {
          ctx.beginPath(); ctx.arc(cx, hy, sr * (0.35 + i * 0.1) * (1 + 0.015 * Math.sin(t * 6 + i)), Math.PI, 0);
          ctx.strokeStyle = A(0.1 + i * 0.045); ctx.lineWidth = 1.2; ctx.stroke();
        }
        ctx.strokeStyle = A(0.55); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(w, hy); ctx.stroke();
        const g = ctx.createLinearGradient(0, hy, 0, h);
        g.addColorStop(0, A(0)); g.addColorStop(1, A(0.4));
        ctx.strokeStyle = g; ctx.lineWidth = 1;
        const gap = w / (small() ? 8 : 14);
        ctx.beginPath();
        for (let i = -24; i <= 24; i++) { ctx.moveTo(cx, hy); ctx.lineTo(cx + i * gap, h); }
        ctx.stroke();
        const n = 14, off = (t * 5) % 1;
        for (let k = 0; k < n; k++) {
          const z = (k + off) / n, y = hy + (h - hy) * z * z;
          ctx.strokeStyle = A(0.05 + z * 0.4);
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
      }
    },

    // Big soft glowing lights drifting around; they lean toward your mouse
    orbs: {
      init() {
        const sc = small() ? 0.6 : 1;
        st = { o: Array.from({ length: small() ? 5 : 8 }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(140, 280) * sc, vx: rnd(-0.25, 0.25), vy: rnd(-0.25, 0.25) })) };
        ctx.clearRect(0, 0, w, h);
      },
      frame(dt) {
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";
        const k = dt / 16;
        for (const o of st.o) {
          o.x += o.vx * k; o.y += o.vy * k;
          if (o.x < -o.r) o.x = w + o.r; else if (o.x > w + o.r) o.x = -o.r;
          if (o.y < -o.r) o.y = h + o.r; else if (o.y > h + o.r) o.y = -o.r;
          if (mouse.on) { o.x += (mouse.x - o.x) * 0.0015 * k; o.y += (mouse.y - o.y) * 0.0015 * k; }
          const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
          g.addColorStop(0, A(0.17)); g.addColorStop(1, A(0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.2832); ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }
    }
  };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setup();
  }
  function setup() { ctx.clearRect(0, 0, w, h); if (FX[style]) FX[style].init(); }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(ts - last, 50); last = ts;
    mouse.x += (mouse.tx - mouse.x) * 0.15; mouse.y += (mouse.ty - mouse.y) * 0.15;
    FX[style].frame(dt);
  }
  function start() { if (!raf && FX[style] && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }

  window.addEventListener("settingschange", e => {
    const d = e.detail, changed = d.bgStyle !== style;
    color = hex(d.accent); bgc = hex(d.bg); style = d.bgStyle;
    if (changed) { stop(); setup(); }
    if (FX[style]) start(); else { stop(); ctx.clearRect(0, 0, w, h); }
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  addEventListener("pointermove", e => {
    if (!mouse.on) { mouse.x = e.clientX; mouse.y = e.clientY; }
    mouse.tx = e.clientX; mouse.ty = e.clientY; mouse.on = true;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { mouse.on = false; });
  addEventListener("pointerup", e => { if (e.pointerType !== "mouse") mouse.on = false; });

  let timer;
  addEventListener("resize", () => { clearTimeout(timer); timer = setTimeout(resize, 150); });
  resize();
})();
