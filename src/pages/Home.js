import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import { org, topOfTable, currentSeason } from '../league';

const IMG = process.env.PUBLIC_URL + '/images';

const APP_SHOTS = [
  ['mid-game', 'A Chickenfoot game in progress with tiles on the board'],
  ['main-menu', 'Chickenfoot app main menu'],
  ['tutorial', 'Henrietta the chicken explaining the rules in the tutorial'],
  ['gameplay', 'A Chickenfoot game looking for the double 7'],
  ['round-start', 'Round 1 of 10 starting with four players'],
  ['profile', 'Player profile with stats and podium finishes'],
  ['choose-character', 'Choose your character screen with 15 farm pals'],
];

// How many cards fit side by side at the current screen width.
function useCardsPerPage() {
  const measure = () => {
    const w = window.innerWidth;
    if (w >= 1180) return 3;
    if (w >= 820) return 2;
    return 1;
  };
  const [perPage, setPerPage] = useState(measure);
  useEffect(() => {
    const onResize = () => setPerPage(measure());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return perPage;
}

function CurrentStandings() {
  const perPage = useCardsPerPage();
  const [start, setStart] = useState(0);
  const max = Math.max(0, topOfTable.length - perPage);
  const first = Math.min(start, max);
  const visible = topOfTable.slice(first, first + perPage);

  return (
    <section id="players" className="wrap section">
      <div className="section-head">
        <div>
          <p className="eyebrow">{currentSeason} season</p>
          <h2 className="section-title">Current Standings</h2>
        </div>
        <Link to="/Standings">Full standings →</Link>
      </div>
      <div className="carousel-row">
        <div className="carousel-arrow">
          {first > 0 && (
            <button type="button" className="round-btn" aria-label="Previous players"
              onClick={() => setStart(Math.max(0, first - perPage))}>‹</button>
          )}
        </div>
        <div className="carousel-cards">
          {visible.map((p, i) => (
            <div className="ranked-card" key={p.name}>
              <span className="rank">#{first + i + 1}</span>
              <div className="card-scale"><PlayerCard player={p} /></div>
            </div>
          ))}
        </div>
        <div className="carousel-arrow">
          {first < max && (
            <button type="button" className="round-btn" aria-label="Next players"
              onClick={() => setStart(Math.min(max, first + perPage))}>›</button>
          )}
        </div>
      </div>
    </section>
  );
}

function AppShots() {
  const [i, setI] = useState(0);
  const n = APP_SHOTS.length;
  const [file, alt] = APP_SHOTS[i];
  return (
    <div className="app-shots">
      <div className="phone-frame">
        <img src={`${IMG}/app/${file}.webp`} alt={alt} width="904" height="430" />
      </div>
      <div className="shot-controls">
        <button type="button" className="round-btn small" aria-label="Previous screenshot"
          onClick={() => setI((i - 1 + n) % n)}>‹</button>
        <div className="dots">
          {APP_SHOTS.map(([f], j) => (
            <button key={f} type="button" className={'dot' + (j === i ? ' active' : '')}
              aria-label={`Screenshot ${j + 1}`} aria-current={j === i}
              onClick={() => setI(j)} />
          ))}
        </div>
        <button type="button" className="round-btn small" aria-label="Next screenshot"
          onClick={() => setI((i + 1) % n)}>›</button>
      </div>
    </div>
  );
}

export default function Home() {
  const leader = topOfTable[0];
  return (
    <>
      <section className="wrap hero">
        <div className="hero-copy">
          <p className="eyebrow">Dominoes International League Federation · Est. 2022</p>
          <h1>13 ROUNDS.<br />One Belt.</h1>
          <p className="hero-text">
            A family Chickenfoot league from outside Portland, Oregon. Every game is scored,
            every stat is tracked, and the lowest score takes the belt.
          </p>
          <div className="hero-actions">
            <Link className="btn-gold" to="/Standings">See the {currentSeason} standings</Link>
            <a className="btn-ghost" href="#players">Meet the players</a>
          </div>
        </div>
        {leader && (
          <div className="hero-card">
            <p className="card-label">{currentSeason} belt leader</p>
            <div className="card-scale"><PlayerCard player={leader} /></div>
          </div>
        )}
      </section>

      <section aria-label="League totals" className="band">
        <div className="wrap totals">
          <div><div className="total-value">{org['Games Played']}</div><div className="total-label">games played</div></div>
          <div><div className="total-value">{org['Total Players']}</div><div className="total-label">players</div></div>
          <div><div className="total-value">{org['Nations']}</div><div className="total-label">nations</div></div>
          <div><div className="total-value">{org['Winners']}</div><div className="total-label">belt winners</div></div>
          <div className="neon">
            <div className="total-value">{org['Total Score'].toLocaleString()}</div>
            <div className="total-label">Lifetime score</div>
          </div>
        </div>
      </section>

      <CurrentStandings />

      <section id="history" className="band">
        <div className="wrap section split">
          <div className="copy">
            <p className="eyebrow">Our story</p>
            <h2 className="section-title">Founded at the Kitchen Table</h2>
            <p className="lead">
              DILF was founded in 2022 outside of Portland, Oregon. Our highly competitive family
              decided playing dominoes simply wasn't enough, so we started tracking the stats.
            </p>
            <p className="lead" style={{ marginBottom: 24 }}>
              Today the league spans {org['Nations']} nations and an East Coast chapter, and{' '}
              {org['Winners']} players have won the belt after 13 hard-fought rounds.
            </p>
            <Link className="text-link" to="/History">Read the full history and past champions →</Link>
          </div>
          <img className="belt-img" src={`${IMG}/assets/belt.webp`} alt="The DILF championship belt" loading="lazy" />
        </div>
      </section>

      <section id="app" className="wrap section split">
        <AppShots />
        <div className="copy">
          <p className="eyebrow">New</p>
          <h2 className="section-title">Chickenfoot, in your Pocket</h2>
          <p className="lead" style={{ marginBottom: 24 }}>
            Play online with your friends or practice with some friendly farm pals. Pick your own
            farm persona and track your stats from each complete game.
          </p>
          <ul className="feature-list">
            <li>Online and Offline Play</li>
            <li>Tutorial led by Henrietta</li>
            <li>Fun farm theme with music and 15 pals</li>
          </ul>
          <span className="coming-soon">Coming soon</span>
        </div>
      </section>
    </>
  );
}
