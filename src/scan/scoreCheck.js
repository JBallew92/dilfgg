const add = (list) => list.reduce((a, b) => a + Number(b || 0), 0);

// Works out whether a player's rounds agree with the half time and total
// written on the card, and if not, whether the card's math or the scan is the
// likely culprit. Returns null when there's nothing to check or it all adds up.
//   kind 'math': the rounds are consistent, a written number was added up wrong
//   kind 'read': both halves disagree, so a round was probably misread
// Cards draw the halftime line after 6 or 7 rounds. Use what the scan saw,
// else whichever split matches the written half time.
export function splitAt({ half, rounds, split }) {
  if (split === 6 || split === 7) return split;
  return add(rounds.slice(0, 7)) === Number(half) ? 7 : 6;
}

export const hasRounds = (player) => Array.isArray(player.rounds) && player.rounds.length === 13;

export function analyzePlayer(player) {
  const { half, total, rounds } = player;
  if (!hasRounds(player) || half === '' || total === '') return null;
  const h = Number(half);
  const t = Number(total);
  const at = splitAt(player);
  const first = add(rounds.slice(0, at));
  const second = add(rounds.slice(at));
  const base = { split: at, first, second };
  const halfOk = first === h;
  const totalOk = t === h + second;
  if (halfOk && totalOk) return null;
  if (halfOk) {
    return {
      ...base, kind: 'math', fix: { half: h, total: h + second },
      message: `The second half adds to ${second}, so the total should be ${h + second}, not ${t}.`,
    };
  }
  if (totalOk) {
    return {
      ...base, kind: 'math', fix: { half: first, total: first + second },
      message: `The first ${at} rounds add to ${first}, not ${h}. That makes it ${first} / ${first + second}.`,
    };
  }
  const off = Math.abs(first - h);
  return {
    ...base, kind: 'read', fix: { half: first, total: first + second },
    message: `The first half adds to ${first}, but the card says ${h}.`,
  };
}

// Placeholder put in the name box for a new player, so the last name gets typed in.
export const LAST_NAME = 'LastName';

// Problems that stop the form from being sent.
export function gameProblems({ date, email = '', players, roster = [] }) {
  const problems = [];
  if (!date) problems.push('Enter the game date.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) problems.push('Enter your email address.');
  if (players.length < 2 || players.length > 8) problems.push('A game needs 2 to 8 players.');
  const seen = new Set();
  players.forEach((p, i) => {
    const label = p.name || `Player ${i + 1}`;
    if (!p.name.trim()) problems.push(`Player ${i + 1} needs a name.`);
    else if (p.name.includes(LAST_NAME)) problems.push(`Type ${p.name.split(' ')[0]}'s last name in place of "${LAST_NAME}".`);
    else if (!roster.includes(p.name.trim()) && !/\S\s+\S/.test(p.name.trim())) problems.push(`Add a last name for ${p.name.trim()}.`);
    else if (seen.has(p.name.trim().toLowerCase())) problems.push(`${p.name} is listed twice.`);
    seen.add(p.name.trim().toLowerCase());
    if (!/^\d+$/.test(String(p.half)) || !/^\d+$/.test(String(p.total))) {
      problems.push(`${label} needs a half time and total score.`);
    } else if (Number(p.total) < Number(p.half)) {
      problems.push(`${label}'s total can't be less than their half time score.`);
    }
  });
  return problems;
}
