// Checks one player's numbers the way a careful scorekeeper would.
// Returns a list of plain-language warnings (empty when everything adds up).
export function checkPlayer({ half, total, rounds }) {
  const warnings = [];
  const h = Number(half);
  const t = Number(total);
  if (half !== '' && total !== '' && t < h) warnings.push('Total is less than the half time score.');
  if (Array.isArray(rounds) && rounds.length === 13) {
    const sum = rounds.reduce((a, b) => a + Number(b || 0), 0);
    if (total !== '' && sum !== t) {
      warnings.push(`The rounds read from the card add up to ${sum}, but the total says ${t}.`);
    }
  }
  return warnings;
}

// Problems that stop the form from being sent.
export function gameProblems({ date, players }) {
  const problems = [];
  if (!date) problems.push('Enter the game date.');
  if (players.length < 2 || players.length > 8) problems.push('A game needs 2 to 8 players.');
  const seen = new Set();
  players.forEach((p, i) => {
    const label = p.name || `Player ${i + 1}`;
    if (!p.name.trim()) problems.push(`Player ${i + 1} needs a name.`);
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
