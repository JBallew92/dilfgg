import { SCAN_ENDPOINT } from '../links';

// Talks to the Apps Script web app. Sent as text/plain so the browser skips
// the CORS preflight, which Apps Script can't answer.
export async function callScanner(action, payload) {
  if (!SCAN_ENDPOINT) throw new ScanError('setup', 'The scanner is not set up yet.');
  let res;
  try {
    res = await fetch(SCAN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    throw new ScanError('network', 'Could not reach the scanner. Check your connection and try again.');
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new ScanError('server', 'The scanner sent back something unexpected. Please try again.');
  }
  if (!data.ok) throw new ScanError(data.error, data.message || 'Something went wrong.');
  return data;
}

export class ScanError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
