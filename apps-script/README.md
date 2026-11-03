# Score Card Scanner (Apps Script)

`Code.gs` is the server half of the Submit a Game page (`/Submit`). It runs inside the
scores Google Sheet, under the sheet owner's Google account, so the website itself stays
static and holds no secrets.

## Set It Up

Do this on a **copy** of the scores sheet first. Switch to the real sheet only after a few
real games have gone through cleanly.

1. Open the sheet, then **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with this folder's `Code.gs`, then save.
3. **Project Settings (gear) → Script Properties → Add script property** for each of these:

   | Property | Required | Value |
   | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | Yes | Key from console.anthropic.com (set a monthly spend limit there) |
   | `LEAGUE_CODE` | Yes | The code players type once on their phone |
   | `NOTIFY_EMAIL` | No | Gets an email with the scores and photo link for every game |
   | `SHEET_NAME` | No | Tab to write to. Defaults to the first tab (the form responses) |
   | `DAILY_SCAN_LIMIT` | No | Defaults to 30 scans a day |
   | `DAILY_SUBMIT_LIMIT` | No | Defaults to 20 games a day |

   `PHOTO_FOLDER_ID` is filled in automatically the first time a card is scanned (a
   "DILF Score Cards" folder in your Drive).
4. **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**.
   Approve the permissions it asks for (Sheets, Drive, outside requests, email).
5. Copy the web app URL (ends in `/exec`) and put it in `SCAN_ENDPOINT` in `src/links.jsx`.

After changing `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**
so the URL stays the same.

## What It Writes

One row per game, matched to the sheet's own column headers, so column order doesn't matter:
Timestamp, Email Address ("dilf.gg scan" when left blank), game date, number of players,
each player's name / half time / total, and the Drive link to the card photo in
"Upload a picture of the scorecard". The nightly `statsload.py` import picks it up like a
form response.

## Cost

Each scan is one Claude API call with the card photo (model `claude-opus-5-5`, medium
effort). Every scan's token counts come back in the response (`reading.usage`), so the real
cost per card can be checked on the console's usage page after the first few games.
