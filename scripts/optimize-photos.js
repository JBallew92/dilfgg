// Shrinks player photos for the web.
//
// Drop a full-size photo into public/images/profile_pics named
// "First Last YEAR.png", then run `npm run photos`. Only .png files are used;
// other formats (like .jpg) are skipped.
// Each photo is resized to at most 800px tall, saved as .webp (transparency
// is kept), and the original is removed from the folder.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, '..', 'public', 'images', 'profile_pics');
const MAX_HEIGHT = 800;

async function main() {
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.png$/i.test(f));

  const skipped = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|heic|gif|bmp|tiff?)$/i.test(f));
  for (const file of skipped) {
    console.warn(`Skipped ${file}: player photos must be .png`);
  }

  if (files.length === 0) {
    console.log('No new photos to optimize.');
    return;
  }

  for (const file of files) {
    const src = path.join(dir, file);
    const out = path.join(dir, file.replace(/\.[^.]+$/, '.webp'));
    const before = fs.statSync(src).size;
    await sharp(src)
      .rotate() // respect the phone's EXIF orientation
      .resize({ height: MAX_HEIGHT, withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toFile(out);
    fs.unlinkSync(src);
    const after = fs.statSync(out).size;
    console.log(
      `${file} -> ${path.basename(out)}  ` +
        `${(before / 1e6).toFixed(1)} MB -> ${(after / 1e3).toFixed(0)} KB`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
