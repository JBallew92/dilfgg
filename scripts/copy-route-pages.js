// GitHub Pages only knows the files in build/. Deep links like /Submit used to be
// answered by 404.html, which shows the app but with a 404 status, and some
// in-app browsers and link checkers stop there. Writing Submit.html etc. makes
// Pages answer each route with a normal 200.
const fs = require('fs');
const path = require('path');

const ROUTES = ['Standings', 'History', 'Submit', 'FormSubmission', 'Stats'];
const build = path.join(__dirname, '..', 'build');
const index = path.join(build, 'index.html');

fs.copyFileSync(index, path.join(build, '404.html'));
for (const route of ROUTES) fs.copyFileSync(index, path.join(build, `${route}.html`));
