(function () {
  var c = document.getElementById("bg"), x = c.getContext("2d");
  var root = document.documentElement;
  var grid = document.getElementById("grid");
  var header = document.getElementById("top");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W, H, dpr, pts = [], mouse = { x: -9999, y: -9999 };
  var col = { o: ["111,75,255", "25,211,218", "255,79,163"], dot: "200,190,255", a: 0.32 };

  function readColors() {
    var s = getComputedStyle(root);
    col.o = [
      s.getPropertyValue("--orb1").trim(),
      s.getPropertyValue("--orb2").trim(),
      s.getPropertyValue("--orb3").trim()
    ];
    col.dot = s.getPropertyValue("--dot").trim();
    col.a = parseFloat(s.getPropertyValue("--orb-alpha")) || 0.32;
  }

  var orbs = [0, 1, 2, 3, 4].map(function (i) {
    return {
      ox: Math.random(), oy: Math.random(),
      r: 0.3 + Math.random() * 0.2,
      sp: 0.00012 + Math.random() * 0.00018,
      ph: Math.random() * 6.28, ci: i % 3
    };
  });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = W < 700 ? 35 : 70;
    pts = [];
    for (var i = 0; i < n; i++) {
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6
      });
    }
    if (reduce) draw(0);
  }

  function draw(t) {
    x.clearRect(0, 0, W, H);

    for (var i = 0; i < orbs.length; i++) {
      var o = orbs[i];
      var cx = (o.ox + Math.sin(t * o.sp + o.ph) * 0.18) * W;
      var cy = (o.oy + Math.cos(t * o.sp * 1.3 + o.ph) * 0.18) * H;
      var rad = o.r * Math.max(W, H);
      var g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, "rgba(" + col.o[o.ci] + "," + col.a + ")");
      g.addColorStop(1, "rgba(" + col.o[o.ci] + ",0)");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
    }

    for (var a = 0; a < pts.length; a++) {
      var p = pts[a];
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      x.beginPath();
      x.arc(p.x, p.y, p.r, 0, 6.283);
      x.fillStyle = "rgba(" + col.dot + ",.65)";
      x.fill();

      for (var b = a + 1; b < pts.length; b++) {
        var q = pts[b], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < 14400) {
          x.strokeStyle = "rgba(" + col.dot + "," + (0.16 * (1 - d / 14400)) + ")";
          x.lineWidth = 1;
          x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke();
        }
      }

      var mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
      if (md < 25600) {
        x.strokeStyle = "rgba(" + col.dot + "," + (0.5 * (1 - md / 25600)) + ")";
        x.lineWidth = 1.2;
        x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(mouse.x, mouse.y); x.stroke();
        if (!reduce) { p.x += mx * 0.002; p.y += my * 0.002; }
      }
    }
  }

  function loop(t) { if (root.getAttribute("data-anim") !== "off") draw(t); requestAnimationFrame(loop); }

  addEventListener("resize", resize);
  addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });

  readColors();
  resize();
  new MutationObserver(function () { readColors(); if (reduce) draw(0); })
    .observe(root, { attributes: true, attributeFilter: ["data-theme", "style"] });
  if (!reduce) requestAnimationFrame(loop);

  grid.addEventListener("pointermove", function (e) {
    var card = e.target.closest(".card");
    if (!card || e.pointerType === "touch" || reduce) return;
    var r = card.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", px * 100 + "%");
    card.style.setProperty("--my", py * 100 + "%");
    card.style.setProperty("--ry", (px - 0.5) * 10 + "deg");
    card.style.setProperty("--rx", (0.5 - py) * 10 + "deg");
  });
  grid.addEventListener("pointerout", function (e) {
    var card = e.target.closest(".card");
    if (card && !card.contains(e.relatedTarget)) {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    }
  });

  grid.querySelectorAll(".card").forEach(function (card, i) {
    card.style.setProperty("--i", Math.min(i, 14));
  });
  grid.classList.add("intro");
  setTimeout(function () { grid.classList.remove("intro"); }, 1800);

  addEventListener("scroll", function () {
    header.classList.toggle("scrolled", scrollY > 8);
  }, { passive: true });
})();
