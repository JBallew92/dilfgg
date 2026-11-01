import Container from 'react-bootstrap/Container';
import styles from "./styles.css"


function FormSubmission({player}) {

    return (
      <Container fluid className="w-100 vh-100 p-0">
        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdFHzN0fT0ZuBfrrXY_h78xr5Y730bLTwm-WJKhR39RkIUbOg/viewform?embedded=true"
         title="Submit a game"
         className="w-100 h-100 border-0">
        Loading…
        </iframe>
      </Container>
      
    );
  }

  export default FormSubmission;