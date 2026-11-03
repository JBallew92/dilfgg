import { pickName, rankNames } from './nameMatch';
import { analyzePlayer, gameProblems } from './scoreCheck';
import { exifDate } from './image';

const ROSTER = ['Kat Herzog', 'Katie Herzog', 'Kristen Herzog', 'Dave Herzog', 'Dan Herzog',
  'Teresa Henrich', 'Aven-itza De Primavera', 'James Ballew', 'Sarah St. Johns', 'Remy Ballew'];

test('first names on the card find the right player', () => {
  expect(rankNames('Teressa', ROSTER)[0].name).toBe('Teresa Henrich');
  expect(rankNames('Aven', ROSTER)[0].name).toBe('Aven-itza De Primavera');
  expect(rankNames('Kris H', ROSTER)[0].name).toBe('Kristen Herzog');
  expect(pickName('James', '', ROSTER)).toBe('James Ballew');
  expect(pickName('Remy', '', ROSTER)).toBe('Remy Ballew');
});

test('Kat could be Kat or Katie, so both are suggested', () => {
  const top = rankNames('Kat', ROSTER, 2).map((r) => r.name);
  expect(top).toEqual(['Kat Herzog', 'Katie Herzog']);
});

test("Claude's match wins when it is on the roster", () => {
  expect(pickName('Kat', 'Katie Herzog', ROSTER)).toBe('Katie Herzog');
  expect(pickName('Zed', 'NEW', ROSTER)).toBe('');
});

test('the add-up check explains card math errors and misreads', () => {
  // James on the lined paper: halftime after 7 rounds, the 17 was left out of the written scores.
  const james = { half: '123', total: '290', split: 7, rounds: [17, 0, 0, 8, 11, 70, 34, 75, 30, 0, 49, 0, 13] };
  expect(analyzePlayer(james)).toMatchObject({ kind: 'math', fix: { half: 140, total: 307 } });
  // Kat on the Mexican Train sheet: half time right, total added up wrong.
  const kat = { half: '129', total: '429', split: 6, rounds: [29, 26, 14, 11, 24, 25, 5, 16, 26, 31, 34, 34, 57] };
  expect(analyzePlayer(kat)).toMatchObject({ kind: 'math', fix: { half: 129, total: 332 } });
  // A misread round: neither score fits, so no fix is offered.
  const aven = { half: '200', total: '469', split: 6, rounds: [69, 30, 20, 30, 30, 30, 30, 30, 30, 30, 30, 30, 50] };
  expect(analyzePlayer(aven)).toMatchObject({ kind: 'read', fix: null });
  const dave = { half: '123', total: '332', rounds: [27, 5, 4, 48, 15, 24, 71, 0, 0, 47, 28, 12, 51] };
  expect(analyzePlayer(dave)).toBeNull();
});

test('the form needs a date, 2 to 8 named players and whole scores', () => {
  const ok = { date: '2026-05-26', email: 'a@b.co', roster: ['A', 'B', 'a'], players: [{ name: 'A', half: '1', total: '2' }, { name: 'B', half: '3', total: '4' }] };
  expect(gameProblems(ok)).toEqual([]);
  expect(gameProblems({ ...ok, date: '' })).toContain('Enter the game date.');
  expect(gameProblems({ ...ok, email: '' })).toContain('Enter your email address.');
  expect(gameProblems({ ...ok, email: 'james@' })).toContain('Enter your email address.');
  expect(gameProblems({ ...ok, players: [ok.players[0]] })).toContain('A game needs 2 to 8 players.');
  expect(gameProblems({ ...ok, players: [ok.players[0], { name: 'a', half: '5', total: '1' }] }))
    .toEqual(['a is listed twice.', "a's total can't be less than their half time score."]);
  const newbie = (name) => gameProblems({ ...ok, players: [ok.players[0], { name, half: '3', total: '4' }] });
  expect(newbie('Teressa LastName')).toEqual(['Type Teressa\'s last name in place of "LastName".']);
  expect(newbie('Teressa')).toEqual(['Add a last name for Teressa.']);
  expect(newbie('Teressa Smith')).toEqual([]);
});

test('reads the date a JPEG photo was taken', () => {
  // Minimal JPEG: SOI, APP1 Exif with one IFD0 entry (DateTime, ASCII, 20 bytes).
  const date = '2024:03:03 04:37:57\0';
  const tiff = [0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x32, 0, 2, 0, 0, 0, 20, 0, 0, 0, 26, 0, 0, 0, 0,
    ...[...date].map((c) => c.charCodeAt(0))];
  const app1 = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const bytes = [0xff, 0xd8, 0xff, 0xe1, 0, app1.length + 2, ...app1];
  expect(exifDate(new DataView(new Uint8Array(bytes).buffer))).toBe('2024-03-03');
});
