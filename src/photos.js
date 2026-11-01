import photoIndex from './photoIndex.json';

const PHOTO_DIR = process.env.PUBLIC_URL + '/images/profile_pics/';

export const DEFAULT_PHOTO = PHOTO_DIR + 'default.webp';

// Returns the best photo for a player in a given season:
// that season's photo if there is one, otherwise their most recent earlier
// photo, otherwise their newest photo, otherwise the default silhouette.
export function getPlayerPhoto(name, year) {
  const years = photoIndex[name];
  if (!years || years.length === 0) return DEFAULT_PHOTO;
  const wanted = String(year);
  const earlier = years.filter((y) => y <= wanted);
  const pick = earlier.length ? earlier[earlier.length - 1] : years[years.length - 1];
  return PHOTO_DIR + name + ' ' + pick + '.webp';
}
