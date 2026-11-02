// Google Forms with file uploads don't work when embedded in the site,
// so these always open in a new tab.
export const GAME_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdFHzN0fT0ZuBfrrXY_h78xr5Y730bLTwm-WJKhR39RkIUbOg/viewform';
export const PHOTO_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSey8Qo12SB1c4ILGwX00c4K-q7OrzGuDVd65UbCSTO8-CwjqA/viewform';

export const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' };

// The arrow shown after links that open a new tab, with the same warning
// spelled out for screen readers.
export function NewTab() {
  return (
    <>
      <span aria-hidden="true">↗</span>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </>
  );
}
