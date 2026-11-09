// GitHub Pages only knows the files in build/. Deep links like /Submit used to be
// answered by 404.html, which shows the app but with a 404 status, and some
// in-app browsers and link checkers stop there. Writing Submit.html etc. makes
// Pages answer each route with a normal 200.
//
// Each copy also gets its own canonical URL (and og:url), so Google indexes
// https://www.dilf.gg/Standings rather than the redirecting or duplicate
// spellings (dilf.gg, http://, /standings, /Stats).
const fs = require('fs');
const path = require('path');

const SITE = 'https://www.dilf.gg';
const ROUTES = ['Standings', 'History', 'Submit', 'FormSubmission'];
// Old addresses that the app forwards elsewhere: route -> page Google should index.
const MOVED = { Stats: 'Standings' };

const build = path.join(__dirname, '..', 'build');
const index = fs.readFileSync(path.join(build, 'index.html'), 'utf8');

const CANONICAL = /<link rel="canonical" href="[^"]*" \/>/;
const OG_URL = /<meta property="og:url" content="[^"]*" \/>/;
if (!CANONICAL.test(index) || !OG_URL.test(index)) {
  throw new Error('index.html is missing the canonical link or og:url tag');
}

function pageFor(route) {
  const url = `${SITE}/${route}`;
  return index
    .replace(CANONICAL, `<link rel="canonical" href="${url}" />`)
    .replace(OG_URL, `<meta property="og:url" content="${url}" />`);
}

// 404.html is served for unknown paths; it shouldn't claim to be the home page.
fs.writeFileSync(path.join(build, '404.html'), index.replace(CANONICAL, ''));

const pages = { ...Object.fromEntries(ROUTES.map((r) => [r, r])), ...MOVED };
for (const [route, target] of Object.entries(pages)) {
  const html = pageFor(target);
  fs.writeFileSync(path.join(build, `${route}.html`), html);
  // Pages paths are case sensitive, so cover the lowercase spelling too (/submit).
  fs.writeFileSync(path.join(build, `${route.toLowerCase()}.html`), html);
}
