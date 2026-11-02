// Everything the pages show is worked out here from the nightly stats export
// (playerStats.js and orgStats.js), so the site updates itself every night.
import { list as playerRows } from './playerStats.js';
import { list as orgRows } from './orgStats.js';
import buildInfo from './buildInfo.json';
import { getPlayerPhoto } from './photos.js';

export const org = orgRows[0];

// One row per player per season, with rounded numbers for display.
export const playerSeasons = playerRows.map((row) => ({
  ...row,
  year: Number(row['Fiscal Year']),
  name: row.Player,
  win_pct: Math.round(row.win_pct * 100),
  avg_total_score: Math.round(row.avg_total_score),
}));

// Newest first.
export const seasons = [...new Set(playerSeasons.map((p) => p.year))].sort((a, b) => b - a);
export const currentSeason = seasons[0];

export const lastUpdated = new Date(buildInfo.builtAt).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

// Ranked by belts won, then win %, then lowest average score.
export function byBelts(a, b) {
  return b.first - a.first || b.win_pct - a.win_pct || a.avg_total_score - b.avg_total_score;
}

// A player's combined numbers across every season.
function allTimeRows() {
  const byName = new Map();
  for (const p of playerSeasons) {
    const t = byName.get(p.name) || {
      name: p.name,
      Player: p.name,
      nation: p.nation,
      watermark: p.watermark,
      year: p.year,
      games_played: 0,
      first: 0,
      second: 0,
      third: 0,
      scoreSum: 0,
      min_total_score: Infinity,
      min_half_time_score: Infinity,
    };
    t.games_played += p.games_played;
    t.first += p.first;
    t.second += p.second;
    t.third += p.third;
    t.scoreSum += p.avg_total_score * p.games_played;
    t.min_total_score = Math.min(t.min_total_score, p.min_total_score);
    t.min_half_time_score = Math.min(t.min_half_time_score, p.min_half_time_score);
    if (p.year > t.year) {
      t.year = p.year;
      t.nation = p.nation;
      t.watermark = p.watermark;
    }
    byName.set(p.name, t);
  }
  return [...byName.values()].map((t) => ({
    ...t,
    'Fiscal Year': t.year,
    win_pct: t.games_played ? Math.round((t.first / t.games_played) * 100) : 0,
    avg_total_score: t.games_played ? Math.round(t.scoreSum / t.games_played) : 0,
  }));
}

// Rows for the standings table: a season (number) or 'all'.
export function standingsFor(season) {
  const rows = season === 'all' ? allTimeRows() : playerSeasons.filter((p) => p.year === season);
  return rows.map((p) => ({ ...p, photo: getPlayerPhoto(p.name, p.year) }));
}

// Places each player moved since the season before, ranked by belts.
// A number (positive = up), 'new' for a first season, or 'back' for a player
// returning after time off. All time has no previous season, so it returns {}.
export function movesFor(season) {
  if (season === 'all') return {};
  const ranked = (y) => standingsFor(y).sort(byBelts).map((r) => r.name);
  const prev = ranked(season - 1);
  const earlier = new Set(playerSeasons.filter((p) => p.year < season).map((p) => p.name));
  const moves = {};
  ranked(season).forEach((name, i) => {
    const was = prev.indexOf(name);
    moves[name] = was >= 0 ? was - i : earlier.has(name) ? 'back' : 'new';
  });
  return moves;
}

// The current season's top 10, for the home page cards.
export const topOfTable = standingsFor(currentSeason).sort(byBelts).slice(0, 10);

// Fewest games a player needs in a season to count for Best win %.
const MIN_GAMES_FOR_WIN_PCT = 3;

// One summary per season for the History page, oldest first.
export const seasonSummaries = (() => {
  const seen = new Set();
  return [...seasons].reverse().map((year, i) => {
    const rows = playerSeasons.filter((p) => p.year === year);
    const leader = [...rows].sort(byBelts)[0];
    const best = rows.reduce((a, b) => (b.min_total_score < a.min_total_score ? b : a));
    const bestHalf = rows.reduce((a, b) => (b.min_half_time_score < a.min_half_time_score ? b : a));
    // Best win % needs a few games behind it, so one lucky game doesn't top the season.
    const regulars = rows.filter((p) => p.games_played >= MIN_GAMES_FOR_WIN_PCT);
    const topWin = (regulars.length ? regulars : rows).reduce((a, b) =>
      b.win_pct > a.win_pct || (b.win_pct === a.win_pct && b.games_played > a.games_played) ? b : a);
    const nations = new Set(rows.map((p) => p.nation));
    const newNation = i > 0 && [...nations].some((n) => !seen.has(n));
    nations.forEach((n) => seen.add(n));
    let milestone = '';
    const inProgress = year === currentSeason && year === new Date().getFullYear();
    if (i === 0) milestone = 'League founded';
    else if (inProgress) milestone = 'In progress';
    else if (newNation) milestone = 'Goes international';
    return {
      year,
      leader: leader.name,
      leaderBelts: leader.first,
      card: leader,
      inProgress,
      photo: getPlayerPhoto(leader.name, year),
      games: rows.reduce((sum, p) => sum + p.first, 0),
      players: rows.length,
      best: best.min_total_score,
      bestBy: best.name,
      bestHalf: bestHalf.min_half_time_score,
      bestHalfBy: bestHalf.name,
      bestWin: topWin.win_pct,
      bestWinBy: topWin.name,
      milestone,
    };
  });
})();
