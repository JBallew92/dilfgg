// Ranks known player names against a name written on a score card, such as
// "Kat", "Kris H" or "Teressa". Used for the suggestion chips on the Submit page.

const clean = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ').trim();

// Edit distance between two short strings.
export function distance(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
}

// 0 = perfect match; bigger = worse.
function score(written, full) {
  const w = clean(written);
  const f = clean(full);
  if (!w) return 99;
  if (w === f) return 0;
  const [wFirst, ...wRest] = w.split(' ');
  const [fFirst, ...fRest] = f.split(' ');
  const wLast = wRest.join(' ');
  const fLast = fRest.join(' ');
  let s;
  if (wFirst === fFirst) s = 1;
  else if (fFirst.startsWith(wFirst) && wFirst.length >= 3) s = 2; // "Kat" -> "Katie"
  else s = 2 + distance(wFirst, fFirst) * 1.5;
  if (wLast) {
    if (fLast.startsWith(wLast)) s -= 0.5; // "Kris H" -> Herzog
    else s += 3;
  }
  return s;
}

// Returns the best `count` names, best first, each with a score.
export function rankNames(written, roster, count = 3) {
  return [...new Set(roster)]
    .map((name) => ({ name, score: score(written, name) }))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
    .slice(0, count);
}

// Picks the name to fill in: Claude's match if it is on the roster, else the
// top-ranked name when it is a clear winner. Returns '' when unsure, so the
// player picks from the suggestion chips (e.g. "Kat" could be Kat or Katie).
export function pickName(written, matched, roster) {
  if (matched === 'AMBIGUOUS') return '';
  if (matched && roster.includes(matched)) return matched;
  const [best, next] = rankNames(written, roster, 2);
  if (!best || best.score > 3) return '';
  if (next && next.score - best.score <= 1) return '';
  return best.name;
}
