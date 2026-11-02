import photoIndex from './photoIndex.json';

const PHOTO_DIR = process.env.PUBLIC_URL + '/images/profile_pics/';

export const DEFAULT_PHOTO = PHOTO_DIR + 'default.webp';

// Returns the best photo for a player in a given season:
// that season's photo if there is one, otherwise their most recent earlier
// photo, otherwise their newest photo, otherwise the default silhouette.
// Names are matched ignoring case, spaces and punctuation, so a file named
// "Sarah St Johns 2024" still matches the player "Sarah St. Johns".
const key = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
const fileNames = {};
for (const fileName of Object.keys(photoIndex)) fileNames[key(fileName)] = fileName;

export function getPlayerPhoto(name, year) {
  const fileName = fileNames[key(name)];
  const years = fileName && photoIndex[fileName];
  if (!years || years.length === 0) return DEFAULT_PHOTO;
  const wanted = String(year);
  const earlier = years.filter((y) => y <= wanted);
  const pick = earlier.length ? earlier[earlier.length - 1] : years[years.length - 1];
  return PHOTO_DIR + fileName + ' ' + pick + '.webp';
}
