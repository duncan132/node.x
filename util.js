(() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hash = str => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); };

  // Generated cover (gradient + emoji or first letter). Used whenever a game has no image.
  const genCover = (title, icon) =>
    `<div class="gen-cover" style="--h:${hash(title) % 360}"><span>${esc(icon || title.trim().charAt(0).toUpperCase())}</span></div>`;

  // If a cover image fails to load (missing file, wrong path), swap in the generated cover.
  document.addEventListener("error", e => {
    const img = e.target;
    if (!img || img.tagName !== "IMG" || !img.dataset.title) return;
    img.outerHTML = genCover(img.dataset.title, img.dataset.icon);
  }, true);

  window.NXUtil = { esc, hash, genCover };
})();
