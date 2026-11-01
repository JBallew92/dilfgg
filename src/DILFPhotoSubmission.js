import Container from 'react-bootstrap/Container';
import styles from "./styles.css"


function DILFPhotoSubmission({player}) {

    return (
      <Container fluid className="w-100 vh-100 p-0">
        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSey8Qo12SB1c4ILGwX00c4K-q7OrzGuDVd65UbCSTO8-CwjqA/viewform?embedded=true"
         title="form"
         className="w-100 h-100 border-0">
        Loading…
        </iframe>
      </Container>
      
    );
  }

  export default DILFPhotoSubmission;