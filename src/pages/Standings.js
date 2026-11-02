import { useMemo, useState } from 'react';
import { DEFAULT_PHOTO } from '../photos';
import { byBelts, seasons, standingsFor, lastUpdated } from '../league';

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

function SortHeader({ id, sort, setSort, children }) {
  return (
    <th scope="col" aria-sort={sort === id ? 'descending' : undefined}>
      <button type="button" className="sort-btn" onClick={() => setSort(id)}>
        {children} {sort === id ? '▾' : ''}
      </button>
    </th>
  );
}

export default function Standings() {
  const [season, setSeason] = useState(seasons[0]);
  const [sort, setSort] = useState('belts');

  const rows = useMemo(() => standingsFor(season).sort(SORTS[sort]), [season, sort]);
  const header = { sort, setSort };

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
                    <img src={r.photo} alt="" loading="lazy"
                      onError={(e) => { e.currentTarget.src = DEFAULT_PHOTO; }} />
                    <span className="name">{r.name}</span>
                    {r.nation !== 'United States' && (
                      <span className="nation-tag" title={r.nation}>{NATION_CODES[r.nation] || r.nation.slice(0, 3).toUpperCase()}</span>
                    )}
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
      <p className="updated-note">Stats update nightly · Last updated {lastUpdated}</p>
    </div>
  );
}
