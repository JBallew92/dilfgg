import { useEffect, useMemo, useRef, useState } from 'react';
import { list as playerRows } from '../playerStats.js';
import { GAME_FORM_URL, NEW_TAB, NewTab, SCAN_ENDPOINT } from '../links';
import { callScanner } from '../scan/api';
import { photoDate, shrinkPhoto, today } from '../scan/image';
import { pickName, rankNames } from '../scan/nameMatch';
import { checkPlayer, gameProblems } from '../scan/scoreCheck';

const CODE_KEY = 'dilf-league-code';
const EMAIL_KEY = 'dilf-email';
const KNOWN = [...new Set(playerRows.map((r) => r.Player))].sort();

const readCode = () => {
  try { return localStorage.getItem(CODE_KEY) || ''; } catch { return ''; }
};
const saveCode = (code) => {
  try { localStorage.setItem(CODE_KEY, code); } catch { /* private browsing */ }
};
const readEmail = () => {
  try { return localStorage.getItem(EMAIL_KEY) || ''; } catch { return ''; }
};
const saveEmail = (email) => {
  try { localStorage.setItem(EMAIL_KEY, email); } catch { /* private browsing */ }
};

const blankPlayer = () => ({ name: '', written: '', half: '', total: '', rounds: null, unsure: false });

export default function Submit() {
  const [code, setCode] = useState(readCode);
  const [roster, setRoster] = useState(KNOWN);
  const [step, setStep] = useState(code ? 'capture' : 'code');
  const [error, setError] = useState('');

  // Pull in names from the sheet that the nightly export hasn't picked up yet.
  useEffect(() => {
    if (!code || !SCAN_ENDPOINT) return;
    callScanner('names', { code })
      .then((d) => setRoster((r) => [...new Set([...r, ...d.names])].sort()))
      .catch((e) => {
        if (e.code === 'code') { setStep('code'); setError(e.message); }
      });
  }, [code]);

  const [photo, setPhoto] = useState(null); // { dataUrl, url }
  const [readNote, setReadNote] = useState('');
  const [game, setGame] = useState({ date: today(), email: readEmail(), players: [blankPlayer(), blankPlayer()] });
  const [sent, setSent] = useState(null);

  async function onPhoto(file) {
    if (!file) return;
    setError('');
    setStep('scanning');
    try {
      const [small, taken] = await Promise.all([shrinkPhoto(file), photoDate(file)]);
      setPhoto({ dataUrl: small.dataUrl });
      const res = await callScanner('scan', { code, image: small.base64, mimeType: small.mimeType });
      setPhoto({ dataUrl: small.dataUrl, url: res.photoUrl });
      const reading = res.reading;
      setReadNote(res.readError || '');
      const players = reading && reading.players.length
        ? reading.players.slice(0, 8).map((p) => ({
          name: pickName(p.name_on_card, p.matched_name, roster),
          written: p.name_on_card,
          half: p.halftime_written ? String(p.halftime_written) : '',
          total: p.total_written ? String(p.total_written) : '',
          rounds: p.rounds,
          unsure: p.unsure,
        }))
        : [blankPlayer(), blankPlayer()];
      setGame((g) => ({ ...g, date: (reading && reading.game_date) || taken || today(), players }));
      setStep('review');
    } catch (e) {
      if (e.code === 'code') { setStep('code'); setError(e.message); return; }
      setError(e.message);
      setStep('capture');
    }
  }

  function typeByHand() {
    setPhoto(null);
    setReadNote('');
    setGame((g) => ({ date: today(), email: g.email, players: [blankPlayer(), blankPlayer()] }));
    setStep('review');
  }

  async function send() {
    const problems = gameProblems(game);
    if (problems.length) { setError(problems.join(' ')); return; }
    setError('');
    setStep('sending');
    const payload = {
      date: game.date,
      email: game.email.trim(),
      photoUrl: photo && photo.url,
      players: game.players.map((p) => ({ name: p.name.trim(), half: Number(p.half), total: Number(p.total) })),
    };
    try {
      await callScanner('submit', { code, game: payload });
      saveEmail(payload.email);
      setSent(payload);
      setStep('done');
    } catch (e) {
      setError(e.message);
      setStep('review');
    }
  }

  function startOver() {
    setPhoto(null);
    setSent(null);
    setError('');
    setGame((g) => ({ date: today(), email: g.email, players: [blankPlayer(), blankPlayer()] }));
    setStep('capture');
  }

  return (
    <section className="wrap scan-page" aria-labelledby="submit-title">
      <p className="eyebrow">Submit a game</p>
      <h1 id="submit-title" className="page-title">Scan Your Score Card</h1>

      {!SCAN_ENDPOINT && (
        <p className="lead">
          Card scanning is coming soon. For now, please use the{' '}
          <a href={GAME_FORM_URL} {...NEW_TAB}>Google Form <NewTab /></a>.
        </p>
      )}

      {SCAN_ENDPOINT && step === 'code' && (
        <CodeStep error={error} onDone={(c) => { saveCode(c); setCode(c); setError(''); setStep('capture'); }} />
      )}

      {SCAN_ENDPOINT && step === 'capture' && (
        <CaptureStep error={error} onPhoto={onPhoto} onType={typeByHand} />
      )}

      {step === 'scanning' && (
        <div className="scan-busy" role="status">
          {photo && <img src={photo.dataUrl} alt="" />}
          <p><span className="spinner" aria-hidden="true" /> Reading the card. This takes about 30 seconds.</p>
        </div>
      )}

      {(step === 'review' || step === 'sending') && (
        <ReviewStep
          photo={photo}
          readNote={readNote}
          game={game}
          setGame={setGame}
          roster={roster}
          error={error}
          sending={step === 'sending'}
          onSend={send}
          onBack={startOver}
        />
      )}

      {step === 'done' && sent && (
        <div className="submit-done" role="status">
          <h2>Game Saved</h2>
          <p>Thanks! The standings update overnight.</p>
          <ul>
            {sent.players.map((p) => (
              <li key={p.name}><strong>{p.name}</strong> {p.half} half time, {p.total} total</li>
            ))}
          </ul>
          <button type="button" className="btn-gold" onClick={startOver}>Submit Another Game</button>
        </div>
      )}

      {SCAN_ENDPOINT && step !== 'done' && (
        <p className="submit-fallback">
          Having trouble? Use the <a href={GAME_FORM_URL} {...NEW_TAB}>Google Form <NewTab /></a> instead.
        </p>
      )}
    </section>
  );
}

function CodeStep({ error, onDone }) {
  const [value, setValue] = useState('');
  return (
    <form className="submit-panel" onSubmit={(e) => { e.preventDefault(); if (value.trim()) onDone(value.trim()); }}>
      <label htmlFor="league-code">League code</label>
      <p className="hint">Ask a DILF organizer for the code. You only enter it once on this phone.</p>
      <input id="league-code" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" autoCapitalize="none" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn-gold">Continue</button>
    </form>
  );
}

function CaptureStep({ error, onPhoto, onType }) {
  const cameraRef = useRef(null);
  const libraryRef = useRef(null);
  return (
    <div className="submit-panel capture">
      <div className="frame-guide" aria-hidden="true"><span>Fit the whole card in the frame</span></div>
      <ul className="tips">
        <li>Lay the card flat in good light.</li>
        <li>Get every name and the Total row in the photo.</li>
      </ul>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="capture-actions">
        <button type="button" className="btn-gold" onClick={() => cameraRef.current.click()}>Scan Score Card</button>
        <button type="button" className="btn-outline-gold" onClick={() => libraryRef.current.click()}>Choose a Photo</button>
        <button type="button" className="link-btn" onClick={onType}>Type scores without a photo</button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => onPhoto(e.target.files[0])} />
      <input ref={libraryRef} type="file" accept="image/*" hidden
        onChange={(e) => onPhoto(e.target.files[0])} />
    </div>
  );
}

function ReviewStep({ photo, readNote, game, setGame, roster, error, sending, onSend, onBack }) {
  const update = (i, patch) => setGame((g) => ({
    ...g, players: g.players.map((p, j) => (j === i ? { ...p, ...patch } : p)),
  }));
  const remove = (i) => setGame((g) => ({ ...g, players: g.players.filter((_, j) => j !== i) }));
  const add = () => setGame((g) => ({ ...g, players: [...g.players, blankPlayer()] }));
  const flagged = game.players
    .map((p, i) => (checkPlayer(p).length ? p.name || p.written || `Player ${i + 1}` : null))
    .filter(Boolean);

  return (
    <form className="review" noValidate onSubmit={(e) => { e.preventDefault(); onSend(); }}>
      {photo && (
        <a className="review-photo" href={photo.url || photo.dataUrl} {...NEW_TAB}>
          <img src={photo.dataUrl} alt="Your score card photo" />
          <span className="zoom-label">Tap to zoom <NewTab /></span>
        </a>
      )}
      <div className="review-fields">
        {readNote && <p className="form-note">{readNote}</p>}
        {photo && !readNote && (
          <p className="hint">Check each name and score against the card. Gold boxes were hard to read.</p>
        )}
        {flagged.length > 0 && (
          <p className="form-note" role="status">
            {flagged.length === 1 ? `${flagged[0]}'s numbers don't` : `${flagged.length} players' numbers don't`} add
            up. Check the gold notes against the card before you submit.
          </p>
        )}
        <div className="field-row">
          <label htmlFor="game-date">Game date</label>
          <input id="game-date" type="date" value={game.date} max={today()}
            onChange={(e) => setGame((g) => ({ ...g, date: e.target.value }))} />
        </div>

        <ol className="player-list">
          {game.players.map((p, i) => (
            <PlayerFields key={i} index={i} player={p} roster={roster}
              onChange={(patch) => update(i, patch)}
              onRemove={game.players.length > 2 ? () => remove(i) : null} />
          ))}
        </ol>
        {game.players.length < 8 && (
          <button type="button" className="btn-ghost btn-sm" onClick={add}>Add Player</button>
        )}

        <div className="field-row">
          <label htmlFor="game-email">Your email</label>
          <input id="game-email" type="email" required value={game.email} autoComplete="email"
            onChange={(e) => setGame((g) => ({ ...g, email: e.target.value }))} />
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="review-actions">
          <button type="submit" className="btn-gold" disabled={sending}>
            {sending ? 'Saving…' : 'Submit Game'}
          </button>
          <button type="button" className="btn-ghost" onClick={onBack} disabled={sending}>Start Over</button>
        </div>
      </div>
    </form>
  );
}

function PlayerFields({ index, player, roster, onChange, onRemove }) {
  const n = index + 1;
  const suggestions = useMemo(() => {
    const basis = player.written || player.name;
    // Only close matches, so a confident pick doesn't come with random extras.
    return basis
      ? rankNames(basis, roster, 3).filter((s) => s.score <= 3).map((s) => s.name).filter((s) => s !== player.name)
      : [];
  }, [player.written, player.name, roster]);
  const isNew = player.name.trim() && !roster.includes(player.name.trim());
  const warnings = checkPlayer(player);
  const roundsSum = Array.isArray(player.rounds) && player.rounds.length === 13
    ? player.rounds.reduce((a, b) => a + Number(b || 0), 0)
    : null;
  const flag = player.unsure ? ' unsure' : '';

  return (
    <li className="player-fields">
      <div className="player-head">
        <span className="player-num">Player {n}</span>
        {player.written && <span className="written">Card says “{player.written}”</span>}
        {onRemove && <button type="button" className="link-btn" onClick={onRemove}>Remove</button>}
      </div>
      <label className="visually-hidden" htmlFor={`name-${n}`}>Player {n} name</label>
      <input id={`name-${n}`} className="name-input" list="known-players" value={player.name}
        placeholder="First and last name" autoComplete="off"
        onChange={(e) => onChange({ name: e.target.value })} />
      {index === 0 && (
        <datalist id="known-players">{roster.map((r) => <option key={r} value={r} />)}</datalist>
      )}
      {(suggestions.length > 0 || isNew) && (
        <div className="name-chips">
          {isNew && <span className="new-tag">New player</span>}
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => onChange({ name: s })}>{s}</button>
          ))}
        </div>
      )}
      <div className="score-pair">
        <div>
          <label htmlFor={`half-${n}`}>Half time</label>
          <input id={`half-${n}`} className={`score-input${flag}`} inputMode="numeric" pattern="[0-9]*"
            value={player.half} onChange={(e) => onChange({ half: e.target.value.replace(/\D/g, '') })} />
        </div>
        <div>
          <label htmlFor={`total-${n}`}>Total</label>
          <input id={`total-${n}`} className={`score-input${flag}`} inputMode="numeric" pattern="[0-9]*"
            value={player.total} onChange={(e) => onChange({ total: e.target.value.replace(/\D/g, '') })} />
        </div>
      </div>
      {warnings.length > 0 && (
        <div className="form-warn">
          {warnings.map((w) => <p key={w}>{w}</p>)}
          <p>Check this column on the card. The total is saved exactly as entered above.</p>
          {roundsSum !== null && roundsSum !== Number(player.total) && (
            <button type="button" className="chip" onClick={() => onChange({ total: String(roundsSum) })}>
              Use {roundsSum}, the rounds added up
            </button>
          )}
        </div>
      )}
    </li>
  );
}
