// Put this file next to your game and add <script src="nx-save.js"></script> to the game's HTML.
// (Only works for games you can edit, and only when the game is opened inside the hub.)
//
//   NX.save(state);                      // call whenever progress changes (level cleared, score, etc.)
//   NX.onLoad(state => { ... });         // called with the saved state, or null if there isn't one
//
// "state" can be any JSON-friendly value (object, array, number, string).
(() => {
  const listeners = [];
  let last, got = false;

  window.addEventListener("message", e => {
    const m = e.data;
    if (!m || m.nx !== "loaded") return;
    last = m.data; got = true;
    listeners.forEach(fn => fn(m.data));
  });

  window.NX = {
    save(data) { parent.postMessage({ nx: "save", data }, "*"); },
    load() { parent.postMessage({ nx: "load" }, "*"); },
    onLoad(fn) { listeners.push(fn); if (got) fn(last); }
  };

  // Ask the hub for any existing save right away.
  parent.postMessage({ nx: "load" }, "*");
})();
