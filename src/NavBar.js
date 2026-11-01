import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from "react-router-bootstrap";


    const openDILFPhotoForm = () => {
    window.open(
      "https://docs.google.com/forms/d/e/1FAIpQLSey8Qo12SB1c4ILGwX00c4K-q7OrzGuDVd65UbCSTO8-CwjqA/viewform", // replace with your Google Form link
      "googleFormPopup",
      "width=800,height=700,left=200,top=100"
    );
  };

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
              <LinkContainer to="/FormSubmission">
                <Nav.Link>Submit a Game</Nav.Link>
              </LinkContainer>
              <Nav.Link
                onClick={openDILFPhotoForm}
                style={{ cursor: "pointer" }} // makes it behave like a clickable link
              >
                Submit a Photo
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
}

export default DilfNavBar;