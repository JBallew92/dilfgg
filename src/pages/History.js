import { org, seasons, seasonSummaries } from '../league';
import { getPlayerPhoto, DEFAULT_PHOTO } from '../photos';

const ASSETS = process.env.PUBLIC_URL + '/images/assets';
const cardBack = { backgroundImage: `url(${ASSETS}/card_back_2023.webp)`, backgroundSize: 'cover', backgroundPosition: 'center' };

const LEADERSHIP = [
  ['Dave Herzog', '2023', 'Co-Founder'],
  ['Kristen Herzog', '2024', 'Co-Founder'],
  ['James Ballew', '2023', 'Co-Founder'],
  ['Aven-itza De Primavera', '2023', 'Head of Marketing & Branding'],
  ['Zach Blaylock', '2024', 'Chapter Lead, East Coast'],
  ['Judith Williams-Jones', '2024', 'Chapter Lead, East Coast'],
];

const fallback = (e) => { e.currentTarget.src = DEFAULT_PHOTO; };

export default function History() {
  return (
    <>
      <section className="wrap history-intro">
        <div className="copy">
          <p className="eyebrow">Our history</p>
          <h1>From One Game to a Federation</h1>
          <p>
            The Dominoes International League Federation was founded in 2022 outside of Portland,
            Oregon. Our highly competitive family decided playing dominoes simply wasn't enough, so
            we started tracking the stats.
          </p>
          <p>
            {seasons.length} seasons later, {org['Games Played']} games have been played by{' '}
            {org['Total Players']} players across {org['Nations']} nations, and the belt has been in
            the hands of {org['Winners']} players.
          </p>
        </div>
        <img src={`${ASSETS}/belt.webp`} alt="The DILF championship belt" />
      </section>

      <section aria-labelledby="seasons" className="wrap" style={{ paddingTop: 24, paddingBottom: 72 }}>
        <h2 id="seasons" className="section-title" style={{ fontSize: 32, marginBottom: 24 }}>Season by Season</h2>
        <ol className="season-list">
          {seasonSummaries.map((s) => (
            <li key={s.year} className="season">
              <div className="season-year">
                <div className="year">{s.year}</div>
                {s.milestone && <div className="milestone">{s.milestone}</div>}
              </div>
              <div className="season-body">
                <div className="season-photo" style={cardBack}>
                  <img src={s.photo} alt={s.leader} loading="lazy" onError={fallback} />
                </div>
                <div className="season-leader">
                  <div className="label">Most belts</div>
                  <div className="who">{s.leader}</div>
                  <div className="belts">
                    <img src={`${ASSETS}/belt-icon.webp`} alt="" />
                    {s.leaderBelts}
                  </div>
                </div>
                <dl className="season-stats">
                  <div><dt>Games</dt><dd>{s.games}</dd></div>
                  <div><dt>Players</dt><dd>{s.players}</dd></div>
                  <div><dt>Best game</dt><dd>{s.best}</dd><dd className="by">{s.bestBy}</dd></div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="leadership" className="band">
        <div className="wrap" style={{ paddingTop: 64, paddingBottom: 64 }}>
          <h2 id="leadership" className="section-title" style={{ fontSize: 32, marginBottom: 32 }}>League Leadership</h2>
          <div className="leaders">
            {LEADERSHIP.map(([name, year, title]) => (
              <div className="leader" key={name}>
                <div className="oval" style={cardBack}>
                  <img src={getPlayerPhoto(name, year)} alt={name} loading="lazy" onError={fallback} />
                </div>
                <div className="name">{name}</div>
                <div className="title">{title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
