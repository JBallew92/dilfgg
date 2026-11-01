import { GAME_FORM_URL, NEW_TAB } from './links';

// The game form has a file upload, which Google doesn't allow in an
// embedded form, so this page links out to it instead.
function FormSubmission() {
  return (
    <div className="wrap submit-page">
      <h1 className="page-title">Submit a Game</h1>
      <p>Played a game of Chickenfoot? Send in the results using the game form.</p>
      <a className="btn-gold" href={GAME_FORM_URL} {...NEW_TAB}>Open the game form ↗</a>
    </div>
  );
}

export default FormSubmission;
