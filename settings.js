(() => {
  const BGS = [["stars", "Warp stars"], ["network", "Network"], ["matrix", "Matrix rain"], ["waves", "Waves"], ["grid", "Retro grid"], ["orbs", "Glow orbs"], ["none", "Off"]];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DEFAULTS = {
    fontSize: 16,
    accent: "#ffffff",
    bg: "#000000",
    card: "#0b0b0b",
    text: "#f2f2f2",
    bgStyle: reduce ? "none" : "stars"
  };
  const ACCENTS = ["#ffffff", "#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#4d4d4d"];
  const KEY = "nx_settings_v2";

  const panel = document.getElementById("settingsPanel");
  let s;
  try { s = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { s = { ...DEFAULTS }; }
  if (!BGS.some(b => b[0] === s.bgStyle)) s.bgStyle = DEFAULTS.bgStyle;

  function onAccent(hex) {
    const n = parseInt(hex.slice(1), 16);
    const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return lum > 150 ? "#000000" : "#ffffff";
  }

  function apply() {
    const r = document.documentElement.style;
    r.fontSize = s.fontSize + "px";
    r.setProperty("--accent", s.accent);
    r.setProperty("--on-accent", onAccent(s.accent));
    r.setProperty("--bg", s.bg);
    r.setProperty("--card", s.card);
    r.setProperty("--text", s.text);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
    window.dispatchEvent(new CustomEvent("settingschange", { detail: s }));
  }

  function build() {
    panel.innerHTML = `
      <div class="sp-head"><h3>Settings</h3><button class="icon-btn" id="closeSettings" aria-label="Close">✕</button></div>

      <div class="sp-row">Animated background
        <div class="bg-choices" id="bgChoices">
          ${BGS.map(([id, name]) => `<button class="bg-opt ${s.bgStyle === id ? "active" : ""}" data-bg="${id}">${name}</button>`).join("")}
        </div>
      </div>

      <label class="sp-row">Text size <b id="fsVal">${s.fontSize}px</b>
        <input type="range" id="fontSize" min="12" max="24" step="1" value="${s.fontSize}">
      </label>

      <div class="sp-row">Accent
        <div class="swatches" id="swatches">
          ${ACCENTS.map(c => `<button class="swatch" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join("")}
        </div>
      </div>

      <div class="sp-grid">
        <label>Accent <input type="color" data-key="accent" value="${s.accent}"></label>
        <label>Background <input type="color" data-key="bg" value="${s.bg}"></label>
        <label>Cards <input type="color" data-key="card" value="${s.card}"></label>
        <label>Text <input type="color" data-key="text" value="${s.text}"></label>
      </div>

      <div class="sp-row">Game progress
        <div class="sp-btns">
          <button class="btn ghost" id="exportData">Export backup</button>
          <button class="btn ghost" id="importData">Import backup</button>
        </div>
        <input type="file" id="importFile" accept="application/json,.json" hidden>
        <small class="muted" id="dataMsg">Progress is stored in this browser. Export a backup to move it to another device.</small>
      </div>

      <button class="btn" id="resetSettings">Reset appearance</button>`;
  }

  panel.addEventListener("input", e => {
    const t = e.target;
    if (t.id === "fontSize") { s.fontSize = +t.value; panel.querySelector("#fsVal").textContent = t.value + "px"; }
    else if (t.dataset.key) { s[t.dataset.key] = t.value; }
    else return;
    apply();
  });

  function msg(text) { const m = panel.querySelector("#dataMsg"); if (m) m.textContent = text; }

  panel.addEventListener("click", e => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.classList.contains("swatch")) {
      s.accent = t.dataset.c;
      panel.querySelector('[data-key="accent"]').value = s.accent;
      apply();
    } else if (t.classList.contains("bg-opt")) {
      s.bgStyle = t.dataset.bg;
      panel.querySelectorAll(".bg-opt").forEach(b => b.classList.toggle("active", b === t));
      apply();
    } else if (t.id === "closeSettings") {
      close();
    } else if (t.id === "resetSettings") {
      s = { ...DEFAULTS }; build(); apply();
    } else if (t.id === "exportData") {
      const blob = new Blob([JSON.stringify(NXSaves.exportAll(), null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "node-x-progress.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      msg("Backup downloaded.");
    } else if (t.id === "importData") {
      panel.querySelector("#importFile").click();
    }
  });

  panel.addEventListener("change", e => {
    if (e.target.id !== "importFile") return;
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(txt => {
      const n = NXSaves.importAll(JSON.parse(txt));
      msg(`Imported ${n} item${n === 1 ? "" : "s"}. Reloading...`);
      setTimeout(() => location.reload(), 700);
    }).catch(() => msg("That file isn't a valid node.x backup."));
    e.target.value = "";
  });

  function open() { panel.hidden = false; requestAnimationFrame(() => panel.classList.add("open")); }
  function close() { panel.classList.remove("open"); setTimeout(() => (panel.hidden = true), 200); }

  document.getElementById("openSettings").addEventListener("click", () => (panel.hidden ? open() : close()));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) close(); });

  build();
  apply();
  window.NXSettings = { get: () => s };
})();
