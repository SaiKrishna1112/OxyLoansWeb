import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function Freeparticipate({ apidata, paramount }) {
  const [show, setShow] = useState(true);

  const handleClose = () => setShow(false);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please review the lending details!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div>
              <div>Lending Amount: INR {paramount}</div>
              <div>Deal Name: {apidata.monthlyInterest}</div>
              <div>
                Pay-out Method:
                {apidata.monthlyInterest && <>Monthly</>}
                {apidata.quartlyInterest && <>Quartly</>}
                {apidata.yearlyInterest && <>Yearly</>}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Freeparticipate;
