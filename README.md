# dilf.gg

Website for the Dominoes International League Federation.

## Adding player photos

Player photos must be `.png` files. Other formats (like `.jpg`) are skipped.

1. Save the photo in `public/images/profile_pics` named `First Last YEAR.png`, e.g. `James Ballew 2026.png`.
2. That's it: the nightly job (`scripts/nightly.ps1`) keeps a copy of the original in `G:\dilf\photo-originals`, shrinks it to a small `.webp`, and publishes it with the next stats update.

To do it by hand instead, run `npm run photos` (needs Node.js 20 or newer) and commit the new `.webp` file.

A player with no photo for a season shows their most recent earlier photo, and the default silhouette if they have none.

## Working on the site

Built with [Vite](https://vite.dev) and React. Needs Node.js 20 or newer.

| Command | What it does |
| --- | --- |
| `npm start` | Runs the site locally at http://localhost:3000 and reloads on changes. |
| `npm test` | Runs the tests once. |
| `npm run build` | Builds the site into the `build` folder. |
| `npm run preview` | Serves the `build` folder locally to check a build before it goes live. |
