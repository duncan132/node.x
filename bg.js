(() => {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, dpr, parts = [], raf = null, enabled = !reduce;
  let accent = "#7c5cff";

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  let rgb = hexToRgb(accent);

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(70, Math.floor((w * h) / 22000));
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.8
    }));
    if (!enabled) clear();
  }

  function clear() { ctx.clearRect(0, 0, w, h); }

  function frame() {
    clear();
    const [r, g, b] = rgb;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fillStyle = `rgba(${r},${g},${b},.7)`;
      ctx.fill();
      for (let j = i + 1; j < parts.length; j++) {
        const q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < 12100) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.18 * (1 - d / 12100)})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf && enabled && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }

  window.addEventListener("settingschange", e => {
    accent = e.detail.accent; rgb = hexToRgb(accent);
    enabled = e.detail.animate && !reduce;
    if (enabled) start(); else { stop(); clear(); }
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  let t;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(resize, 150); });

  resize();
  start();
})();
