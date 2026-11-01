import Container from 'react-bootstrap/Container';
import styles from "./styles.css"


function FormSubmission({player}) {

    return (
      <Container fluid className="w-100 vh-100 p-0">
        <iframe src="https://docs.google.com/forms/d/14A70uEHr0OEK_oDunD_ZRopLIrT7i3CNCjJjnNKlvNQ/viewform?embedded=true"
         title="Submit a game"
         className="w-100 h-100 border-0">
        Loading…
        </iframe>
      </Container>
      
    );
  }

  export default FormSubmission;