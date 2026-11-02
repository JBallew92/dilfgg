import { useMemo, useState } from 'react';
import { DEFAULT_PHOTO } from '../photos';
import { byBelts, movesFor, seasons, standingsFor, lastUpdated } from '../league';

// Short codes for players from outside the US.
const NATION_CODES = { Austria: 'AUT' };

const SORTS = {
  belts: byBelts,
  games: (a, b) => b.games_played - a.games_played || b.first - a.first,
  win: (a, b) => b.win_pct - a.win_pct || b.games_played - a.games_played,
  avg: (a, b) => a.avg_total_score - b.avg_total_score,
  best: (a, b) => a.min_total_score - b.min_total_score,
  half: (a, b) => a.min_half_time_score - b.min_half_time_score,
};

// Choices for the phone sort pick list, and the stat each one shows on a collapsed row.
const SORT_OPTIONS = [
  ['belts', 'Belts', (r) => `${r.first} ${r.first === 1 ? 'belt' : 'belts'}`],
  ['games', 'Games', (r) => `${r.games_played} games`],
  ['win', 'Win %', (r) => `${r.win_pct}%`],
  ['avg', 'Avg score', (r) => `${r.avg_total_score} avg`],
  ['best', 'Best score', (r) => `${r.min_total_score} best`],
  ['half', 'Best half', (r) => `${r.min_half_time_score} half`],
];

const fallback = (e) => { e.currentTarget.src = DEFAULT_PHOTO; };

// Green up / red down arrow with the places moved since last season.
function Move({ move }) {
  if (move === undefined) return null;
  if (move === 'new') return <span className="move" title="First season">New</span>;
  if (move === 'back' || move === 0) {
    const title = move === 0 ? 'No change from last season' : 'Did not play last season';
    return <span className="move" title={title} aria-label={title}>–</span>;
  }
  const up = move > 0;
  const n = Math.abs(move);
  const title = `${up ? 'Up' : 'Down'} ${n} from last season`;
  return (
    <span className={'move ' + (up ? 'up' : 'down')} title={title} aria-label={title}>
      {up ? '▲' : '▼'} {n}
    </span>
  );
}

function NationTag({ nation }) {
  if (nation === 'United States') return null;
  return <span className="nation-tag" title={nation}>{NATION_CODES[nation] || nation.slice(0, 3).toUpperCase()}</span>;
}

function SortHeader({ id, sort, setSort, children }) {
  return (
    <th scope="col" aria-sort={sort === id ? 'descending' : undefined}>
      <button type="button" className="sort-btn" onClick={() => setSort(id)}>
        {children} {sort === id ? '▾' : ''}
      </button>
    </th>
  );
}

// Desktop: the full table.
function StandingsTable({ rows, moves, sort, setSort }) {
  const header = { sort, setSort };
  return (
    <div className="table-shell">
      <table className="standings">
        <thead>
          <tr>
            <th scope="col" className="left rank-cell" style={{ fontFamily: 'inherit', fontSize: 13 }}>#</th>
            <th scope="col" className="left">Player</th>
            <SortHeader id="games" {...header}>Games</SortHeader>
            <SortHeader id="belts" {...header}>Belts</SortHeader>
            <th scope="col">2nd</th>
            <th scope="col">3rd</th>
            <SortHeader id="win" {...header}>Win %</SortHeader>
            <SortHeader id="avg" {...header}>Avg score</SortHeader>
            <SortHeader id="best" {...header}>Best score</SortHeader>
            <SortHeader id="half" {...header}>Best half</SortHeader>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name}>
              <td className={'left rank-cell' + (i < 3 ? ' podium' : '')}>{i + 1}</td>
              <td className="left">
                <div className="player-cell">
                  <img src={r.photo} alt="" loading="lazy" onError={fallback} />
                  <span className="name">{r.name}</span>
                  <Move move={moves[r.name]} />
                  <NationTag nation={r.nation} />
                </div>
              </td>
              <td>{r.games_played}</td>
              <td className="belts">{r.first}</td>
              <td>{r.second}</td>
              <td>{r.third}</td>
              <td className="strong">{r.win_pct}%</td>
              <td className="strong">{r.avg_total_score}</td>
              <td>{r.min_total_score}</td>
              <td>{r.min_half_time_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Phones: one row per player; tap a name to see their stats.
function StandingsList({ rows, moves, sort, setSort }) {
  const [open, setOpen] = useState(null);
  const sortValue = (SORT_OPTIONS.find(([id]) => id === sort) || SORT_OPTIONS[0])[2];
  return (
    <>
      <label className="sort-pick">
        Sort by
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORT_OPTIONS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <ol className="standings-list">
        {rows.map((r, i) => {
          const isOpen = open === r.name;
          return (
            <li key={r.name} className={isOpen ? 'open' : undefined}>
              <button type="button" className="pl-head" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : r.name)}>
                <span className={'pl-rank' + (i < 3 ? ' podium' : '')}>{i + 1}</span>
                <img src={r.photo} alt="" loading="lazy" onError={fallback} />
                <span className="pl-name">{r.name}<Move move={moves[r.name]} /></span>
                <NationTag nation={r.nation} />
                <span className="pl-sort">{sortValue(r)}</span>
                <span className="chevron" aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
              </button>
              {isOpen && (
                <dl className="pl-stats">
                  <div><dt>Games</dt><dd>{r.games_played}</dd></div>
                  <div><dt>Belts</dt><dd className="gold">{r.first}</dd></div>
                  <div><dt>2nd</dt><dd>{r.second}</dd></div>
                  <div><dt>3rd</dt><dd>{r.third}</dd></div>
                  <div><dt>Win %</dt><dd>{r.win_pct}%</dd></div>
                  <div><dt>Avg score</dt><dd>{r.avg_total_score}</dd></div>
                  <div><dt>Best score</dt><dd>{r.min_total_score}</dd></div>
                  <div><dt>Best half</dt><dd>{r.min_half_time_score}</dd></div>
                </dl>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}

export default function Standings() {
  const [season, setSeason] = useState(seasons[0]);
  const [sort, setSort] = useState('belts');
  const rows = useMemo(() => standingsFor(season).sort(SORTS[sort]), [season, sort]);
  const moves = useMemo(() => movesFor(season), [season]);
  const view = { rows, moves, sort, setSort };

  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 72 }}>
      <div className="standings-head">
        <div>
          <h1 className="page-title">Standings</h1>
        </div>
        <div role="group" aria-label="Season" className="chips">
          {seasons.map((y) => (
            <button key={y} type="button" className="chip" aria-pressed={season === y} onClick={() => setSeason(y)}>
              {y}
            </button>
          ))}
          <button type="button" className="chip" aria-pressed={season === 'all'} onClick={() => setSeason('all')}>
            All time
          </button>
        </div>
      </div>

      <div className="only-desktop"><StandingsTable {...view} /></div>
      <div className="only-phone"><StandingsList key={season} {...view} /></div>
      <p className="updated-note">Stats update nightly · Last updated {lastUpdated}</p>
    </div>
  );
}
