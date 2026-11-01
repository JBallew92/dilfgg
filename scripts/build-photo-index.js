// Lists which player photos exist so the site can pick the right one.
// Runs automatically before `npm start`, `npm run build` and `npm test`.
// Output: src/photoIndex.json, e.g. { "James Ballew": ["2023"] }
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images', 'profile_pics');
const outFile = path.join(__dirname, '..', 'src', 'photoIndex.json');

const index = {};
for (const file of fs.readdirSync(dir)) {
  const match = file.match(/^(.+) (\d{4})\.webp$/);
  if (!match) continue;
  const [, name, year] = match;
  (index[name] = index[name] || []).push(year);
}
for (const name of Object.keys(index)) index[name].sort();

fs.writeFileSync(outFile, JSON.stringify(index, null, 2) + '\n');
console.log(`Photo index: ${Object.keys(index).length} players`);
