#!/usr/bin/env python3
"""Build games.json for the html repo.

Usage: python3 -I gen_games.py <html_repo_dir> <assets_repo_dir> <out_json>
Picks the newest variant of each game id, guesses a display name, and records
alternate variants so the launcher can offer a "try another version" button.
"""
import json, os, re, sys, collections, urllib.parse

html_dir, assets_dir, out_path = sys.argv[1:4]

NAME_RE = re.compile(r'^(\d+)(?:-(.*))?\.html(-a)?$')
GENERIC_H1 = re.compile(
    r'(does not appear to support|running from local|^settings$|^error$|^welcome to$|'
    r'^this file is from|game options|search map name|live wallpaper|gn code editor)', re.I)
BROKEN_H1 = re.compile(r'(is broken|removed due to a dmca|^error$)', re.I)
GENERIC_SLUG = {'assets', 'asset', 'game', 'games', 'html', 'index', 'main', 'master', 'dist',
                'build', 'public', 'static', 'web', 'cdn', 'files', 'play', 'og'}


def variant_rank(suffix):
    """Higher = newer. 'fix4' > 'fix3' > 'fix2' > 'fix' > '' ; unknown tags rank by trailing digit."""
    if suffix is None:
        return (0, 0)
    m = re.search(r'(\d+)$', suffix)
    n = int(m.group(1)) if m else 1
    return (1, n)


def pretty(slug):
    slug = urllib.parse.unquote(slug)
    slug = re.sub(r'@.*$', '', slug)
    slug = re.sub(r'[-_.]+', ' ', slug).strip()
    if not slug or slug.lower() in GENERIC_SLUG or slug.isdigit() or re.fullmatch(r'[0-9a-f]{20,}', slug):
        return None
    if len(re.findall(r'\d', slug)) >= 3:  # random-looking ids like "ov464534asa4rb"
        return None
    return slug.title() if slug.islower() else slug


def guess_name(text):
    """Return (name, broken_flag)."""
    h = re.search(r'<h1[^>]*>\s*([^<]{2,80}?)\s*</h1>', text, re.I)
    if h:
        t = h.group(1).strip()
        if BROKEN_H1.search(t):
            return None, True
        if not GENERIC_H1.search(t):
            return t, False
    t = re.search(r'<title>\s*([^<]{2,80}?)\s*</title>', text, re.I)
    if t:
        return t.group(1).strip(), False
    m = re.search(r'<base href="([^"]+)"', text)
    if m:
        segs = [s for s in urllib.parse.urlparse(m.group(1)).path.split('/') if s]
        for seg in reversed(segs):
            p = pretty(seg) if '@' not in seg else None
            if p:
                return p, False
    return None, False


by_id = collections.defaultdict(list)
for f in sorted(os.listdir(html_dir)):
    m = NAME_RE.match(f)
    if not m:
        continue
    by_id[int(m.group(1))].append((variant_rank(m.group(2)), len(f), f))

games = []
for gid in sorted(by_id):
    variants = sorted(by_id[gid], reverse=True)
    best = variants[0][2]
    text = open(os.path.join(html_dir, best), errors='ignore').read()
    name, broken = guess_name(text)
    if name is None and not broken:
        # try the other variants for a name
        for _, _, alt in variants[1:]:
            name, _ = guess_name(open(os.path.join(html_dir, alt), errors='ignore').read())
            if name:
                break
    entry = {'id': gid, 'name': name or f'Game #{gid}', 'file': best}
    alts = [v[2] for v in variants[1:]]
    if alts:
        entry['alts'] = alts
    if broken:
        entry['broken'] = True
    if os.path.isfile(os.path.join(assets_dir, str(gid), 'cover.png')):
        entry['cover'] = f'{gid}/cover.png'
    games.append(entry)

with open(out_path, 'w') as fh:
    json.dump(games, fh, indent=1, ensure_ascii=False)

named = sum(1 for g in games if not g['name'].startswith('Game #'))
print(f'{len(games)} games | named: {named} | unnamed: {len(games)-named} | '
      f'with alts: {sum(1 for g in games if "alts" in g)} | '
      f'flagged broken: {sum(1 for g in games if g.get("broken"))} | '
      f'with cover: {sum(1 for g in games if "cover" in g)}')
