/**
 * DILF score card scanner: the server half of the Submit a Game page on dilf.gg.
 *
 * Paste this file into the Apps Script editor of the scores Google Sheet
 * (Extensions > Apps Script), set the Script Properties listed in README.md,
 * and deploy it as a web app (Execute as: Me, Who has access: Anyone).
 *
 * The page sends JSON as text/plain (so browsers skip the CORS preflight) with
 * one of these actions:
 *   names   -> player names already in the sheet
 *   scan    -> save the card photo to Drive and read it with Claude
 *   submit  -> append one game row, with the same columns the Google Form writes
 *
 * Secrets live only in Script Properties, never in the website or the repo.
 */

var MODEL = 'claude-opus-5-5';
var MAX_PHOTO_BYTES = 5 * 1024 * 1024;
var DEFAULT_DAILY_SCANS = 30;
var DEFAULT_DAILY_SUBMITS = 20;
var PHOTO_FOLDER_NAME = 'DILF Score Cards';
var SOURCE_HEADER = 'Submitted Via';
var SOURCE_VALUE = 'Scanner';

function doGet() {
  return json_({ ok: true, service: 'dilf-score-scan' });
}

function doPost(e) {
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var props = PropertiesService.getScriptProperties();
    var code = props.getProperty('LEAGUE_CODE');
    if (!code) return fail_('setup', 'The scanner is not set up yet.');
    if (String(req.code || '').trim().toLowerCase() !== code.trim().toLowerCase()) {
      return fail_('code', 'That league code is not right.');
    }
    if (req.action === 'names') return json_({ ok: true, names: sheetNames_() });
    if (req.action === 'scan') return scan_(req, props);
    if (req.action === 'submit') return submit_(req, props);
    return fail_('action', 'Unknown action.');
  } catch (err) {
    console.error(err && err.stack || err);
    return fail_('server', 'Something went wrong on our end. Please try again or use the Google Form.');
  }
}

// ---------- scan ----------

function scan_(req, props) {
  if (!underDailyLimit_('scan', Number(props.getProperty('DAILY_SCAN_LIMIT')) || DEFAULT_DAILY_SCANS)) {
    return fail_('limit', 'Too many scans today. Please use the Google Form.');
  }
  var b64 = String(req.image || '');
  var mime = /^image\/(jpeg|png|webp)$/.test(req.mimeType) ? req.mimeType : 'image/jpeg';
  var bytes = Utilities.base64Decode(b64);
  if (!bytes.length) return fail_('photo', 'No photo was received.');
  if (bytes.length > MAX_PHOTO_BYTES) return fail_('photo', 'That photo is too large.');

  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmmss');
  var file = photoFolder_(props).createFile(
    Utilities.newBlob(bytes, mime, 'Score card ' + stamp + (mime === 'image/png' ? '.png' : '.jpg')));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var result = { ok: true, photoId: file.getId(), photoUrl: file.getUrl() };
  try {
    result.reading = readCard_(b64, mime, sheetNames_(), props);
  } catch (err) {
    console.error(err && err.stack || err);
    result.reading = null;
    result.readError = 'We saved the photo but could not read it. Please type the scores.';
  }
  return json_(result);
}

var CARD_SCHEMA = {
  type: 'object',
  properties: {
    game_date: { type: 'string', description: 'Date written on the card as YYYY-MM-DD, or empty' },
    players: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_on_card: { type: 'string' },
          matched_name: { type: 'string' },
          rounds: { type: 'array', items: { type: 'integer' } },
          halftime_written: { type: 'integer' },
          total_written: { type: 'integer' },
          unsure: { type: 'boolean' },
        },
        required: ['name_on_card', 'matched_name', 'rounds', 'halftime_written', 'total_written', 'unsure'],
        additionalProperties: false,
      },
    },
  },
  required: ['game_date', 'players'],
  additionalProperties: false,
};

function cardPrompt_(roster) {
  return [
    'This photo is a handwritten score card from a game of Chicken Foot dominoes.',
    'There are 13 rounds. Layouts vary: a printed card with Round 1 to 13, a sheet that counts rounds',
    'from 12 down to 0, or plain paper. Each player has one column with the name written at the top.',
    'A dash, a circled zero or a slashed zero means 0. If a number is crossed out and rewritten, use the new number.',
    'Partway down there is a halftime or subtotal row, and at the bottom a total row.',
    '',
    'For each player column, left to right, return:',
    '- name_on_card: the name exactly as written',
    '- matched_name: the closest name from the roster below, "NEW" if none fits, or "AMBIGUOUS" if 2 fit equally well',
    '- rounds: the 13 round scores in the order written, top to bottom (0 for dashes)',
    '- halftime_written: the halftime or subtotal number written on the card (0 if there is none)',
    '- total_written: the total written on the card (0 if there is none)',
    '- unsure: true if any number in the column was hard to read',
    'Also return game_date (YYYY-MM-DD) if a date is written on the card, otherwise an empty string.',
    'Report the numbers as written, even if they do not add up.',
    '',
    'Roster: ' + roster.join(', '),
  ].join('\n');
}

function readCard_(b64, mime, roster, props) {
  var key = props.getProperty('ANTHROPIC_API_KEY');
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  var body = {
    model: MODEL,
    max_tokens: 16000,
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: CARD_SCHEMA } },
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mime, data: b64 } },
        { type: 'text', text: cardPrompt_(roster) },
      ],
    }],
  };
  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'server-side-fallback-2026-07-01',
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });
  var status = res.getResponseCode();
  var data = JSON.parse(res.getContentText());
  if (status !== 200) throw new Error('Claude API ' + status + ': ' + JSON.stringify(data.error || data));
  if (data.stop_reason === 'refusal') throw new Error('Claude declined to read the card');
  var text = (data.content || []).filter(function (b) { return b.type === 'text'; })
    .map(function (b) { return b.text; }).join('');
  var reading = JSON.parse(text);
  reading.usage = data.usage || null;
  return reading;
}

// ---------- submit ----------

function submit_(req, props) {
  if (!underDailyLimit_('submit', Number(props.getProperty('DAILY_SUBMIT_LIMIT')) || DEFAULT_DAILY_SUBMITS)) {
    return fail_('limit', 'Too many games submitted today. Please use the Google Form.');
  }
  var game = req.game || {};
  var players = Array.isArray(game.players) ? game.players : [];
  var problem = checkGame_(game, players);
  if (problem) return fail_('invalid', problem);

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = scoresSheet_(props);
    ensureSourceColumn_(sheet);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var row = headers.map(function () { return ''; });
    var set = function (header, value) {
      var i = headers.indexOf(header);
      if (i === -1) throw new Error('Sheet is missing the column "' + header + '"');
      row[i] = value;
    };
    set('Timestamp', new Date());
    set('Email Address', String(game.email).trim());
    set(SOURCE_HEADER, SOURCE_VALUE);
    set('What day was the game played?', parseDate_(game.date));
    set('How many players?', players.length);
    players.forEach(function (p, i) {
      var n = i + 1;
      set(nameHeader_(headers, n), String(p.name).trim());
      set('Player ' + n + ' Half Time Score?', Number(p.half));
      set('Player ' + n + ' Total Score?', Number(p.total));
    });
    if (game.photoUrl) set('Upload a picture of the scorecard', String(game.photoUrl));
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  notify_(props, game, players);
  return json_({ ok: true });
}

function checkGame_(game, players) {
  if (players.length < 2 || players.length > 8) return 'A game needs 2 to 8 players.';
  if (!parseDate_(game.date)) return 'Please enter the game date.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(game.email || '').trim())) return 'Please enter your email address.';
  var seen = {};
  for (var i = 0; i < players.length; i++) {
    var p = players[i] || {};
    var name = String(p.name || '').trim();
    if (!name) return 'Player ' + (i + 1) + ' needs a name.';
    if (seen[name.toLowerCase()]) return name + ' is listed twice.';
    seen[name.toLowerCase()] = true;
    var half = Number(p.half), total = Number(p.total);
    if (!isWholeScore_(half) || !isWholeScore_(total)) return name + "'s scores must be whole numbers.";
    if (total < half) return name + "'s total can't be less than their half time score.";
  }
  return '';
}

// Adds the "Submitted Via" column at the end of the header row the first time,
// so scanner rows can be told apart from Google Form rows (which leave it blank).
function ensureSourceColumn_(sheet) {
  var last = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, last).getValues()[0];
  if (headers.indexOf(SOURCE_HEADER) === -1) sheet.getRange(1, last + 1).setValue(SOURCE_HEADER);
}

function isWholeScore_(n) {
  return isFinite(n) && n >= 0 && n <= 2000 && Math.floor(n) === n;
}

// The form's header is "Player N First & Last Name"; older copies say "Player N Name".
function nameHeader_(headers, n) {
  var full = 'Player ' + n + ' First & Last Name';
  return headers.indexOf(full) !== -1 ? full : 'Player ' + n + ' Name';
}

function parseDate_(value) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function notify_(props, game, players) {
  var to = props.getProperty('NOTIFY_EMAIL');
  if (!to) return;
  var lines = players.map(function (p) { return p.name + ': ' + p.half + ' half, ' + p.total + ' total'; });
  MailApp.sendEmail(to, 'DILF game submitted for ' + game.date,
    lines.join('\n') + '\n\nCard photo: ' + (game.photoUrl || 'none') +
    (game.note ? '\nNote: ' + game.note : ''));
}

// ---------- helpers ----------

function scoresSheet_(props) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = props.getProperty('SHEET_NAME');
  var sheet = name ? ss.getSheetByName(name) : ss.getSheets()[0];
  if (!sheet) throw new Error('No sheet named ' + name);
  return sheet;
}

function sheetNames_() {
  var sheet = scoresSheet_(PropertiesService.getScriptProperties());
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var cols = [];
  headers.forEach(function (h, i) { if (/^Player \d Name$|^Player \d First & Last Name$/.test(h)) cols.push(i); });
  var names = {};
  for (var r = 1; r < values.length; r++) {
    cols.forEach(function (c) {
      var n = String(values[r][c] || '').trim();
      if (n) names[n] = true;
    });
  }
  return Object.keys(names).sort();
}

function photoFolder_(props) {
  var id = props.getProperty('PHOTO_FOLDER_ID');
  if (id) return DriveApp.getFolderById(id);
  var found = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  var folder = found.hasNext() ? found.next() : DriveApp.createFolder(PHOTO_FOLDER_NAME);
  props.setProperty('PHOTO_FOLDER_ID', folder.getId());
  return folder;
}

// Counts actions per day so a leaked code can't run up the bill.
function underDailyLimit_(kind, limit) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties();
    var day = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd');
    var key = 'COUNT_' + kind + '_' + day;
    var count = Number(props.getProperty(key)) || 0;
    if (count >= limit) return false;
    props.setProperty(key, String(count + 1));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail_(code, message) {
  return json_({ ok: false, error: code, message: message });
}
