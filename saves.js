// Game progress storage + backup/restore. Everything stays in this browser (localStorage).
(() => {
  const PREFIX = "nx_save_";
  const ANIME_KEY = "nx_anime_progress";
  const FAV_KEY = "nx_favs";
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

  window.NXSaves = {
    get(id) { return read(PREFIX + id); },                       // { data, time } or null
    set(id, data) { return write(PREFIX + id, { data, time: Date.now() }); },
    remove(id) { try { localStorage.removeItem(PREFIX + id); } catch {} },
    has(id) { try { return localStorage.getItem(PREFIX + id) !== null; } catch { return false; } },

    exportAll() {
      const out = { app: "node.x", version: 1, saves: {}, anime: read(ANIME_KEY) || {}, favs: read(FAV_KEY) || [] };
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k.startsWith(PREFIX)) out.saves[k.slice(PREFIX.length)] = read(k);
        }
      } catch {}
      return out;
    },

    // Merges an exported file into this browser. Newer data wins. Returns how many items were imported.
    importAll(obj) {
      if (!obj || obj.app !== "node.x" || typeof obj.saves !== "object") throw new Error("Not a node.x backup file");
      let n = 0;
      for (const [id, s] of Object.entries(obj.saves || {})) {
        if (!/^[\w.-]{1,64}$/.test(id) || !s || typeof s !== "object") continue;
        const cur = read(PREFIX + id);
        if (!cur || (s.time || 0) > (cur.time || 0)) { write(PREFIX + id, s); n++; }
      }
      const prog = read(ANIME_KEY) || {};
      for (const [k, v] of Object.entries(obj.anime || {})) {
        if (v && typeof v === "object" && (!prog[k] || (v.ts || 0) > (prog[k].ts || 0))) { prog[k] = v; n++; }
      }
      write(ANIME_KEY, prog);
      if (Array.isArray(obj.favs)) {
        const favs = read(FAV_KEY) || [];
        write(FAV_KEY, [...new Set([...favs, ...obj.favs.filter(f => typeof f === "string")])]);
      }
      return n;
    }
  };
})();
