import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from "react-router-bootstrap";

// Google Forms with file uploads don't work when embedded in the site,
// so these open in a new tab (popup windows get blocked on phones).
export const GAME_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdFHzN0fT0ZuBfrrXY_h78xr5Y730bLTwm-WJKhR39RkIUbOg/viewform";
const PHOTO_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSey8Qo12SB1c4ILGwX00c4K-q7OrzGuDVd65UbCSTO8-CwjqA/viewform";

function DilfNavBar() {
  return (
    
      <Navbar expand="lg" className="navbar">
        <Container>
          <LinkContainer to="/">
          <Navbar.Brand>DILF</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/Stats">
                <Nav.Link>Meet Our Players</Nav.Link>
              </LinkContainer>
              <Nav.Link href={GAME_FORM_URL} target="_blank" rel="noopener noreferrer">
                Submit a Game
              </Nav.Link>
              <Nav.Link href={PHOTO_FORM_URL} target="_blank" rel="noopener noreferrer">
                Submit a Photo
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
}

export default DilfNavBar;