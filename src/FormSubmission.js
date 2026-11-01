import Container from 'react-bootstrap/Container';
import styles from "./styles.css"


function FormSubmission({player}) {

    return (
      <Container fluid className="w-100 vh-100 p-0">
        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSd-DcCCT9f01Y4bK_UzenM_l8MC8yfergtefFU4RpJzDVC4vg/viewform?embedded=true"
         title="form"
         className="w-100 h-100 border-0">
        Loading…
        </iframe>
      </Container>
      
    );
  }

  export default FormSubmission;