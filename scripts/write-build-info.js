// Records when the site was built, for the "Last updated" line.
// Runs automatically before `npm start`, `npm run build` and `npm test`.
const fs = require('fs');
const path = require('path');

const outFile = path.join(__dirname, '..', 'src', 'buildInfo.json');
fs.writeFileSync(outFile, JSON.stringify({ builtAt: new Date().toISOString() }) + '\n');
