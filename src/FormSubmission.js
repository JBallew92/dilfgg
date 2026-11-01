import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { GAME_FORM_URL } from './NavBar';

// The game form has a file upload, which Google doesn't allow in an
// embedded form, so this page links out to it instead.
function FormSubmission() {

    return (
      <Container className="py-5 text-center">
        <h1 className="mb-3">Submit a Game</h1>
        <p className="mb-4">Played a game of Chickenfoot? Send in the results using the game form.</p>
        <Button
          variant="primary"
          size="lg"
          href={GAME_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the game form
        </Button>
      </Container>
      
    );
  }

  export default FormSubmission;