import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { PrincipalTransfer } from "../Base UI Elements/SweetAlert";
import { principal_return_account_type } from "../../HttpRequest/afterlogin";

function ModalComponet({
  data,
  heading,
  sendDataToParent,
  dealIdInfo,
  trasferMethod,
}) {
  const [show, setShow] = useState(true);

  const handleClose = async () => {
    sendDataToParent();
  };
  const handleShow = () => setShow(true);

  const confirmTrasferPrincipal = () => {
    sendDataToParent();
    const response = principal_return_account_type(dealIdInfo, trasferMethod);
    response.then((data) => {
      if (data.request.status == 200) {
        PrincipalTransfer(
          "success",
          "You have successfully updated the payout option."
        );
      } else if (data.response.data.errorCode != "200") {
        PrincipalTransfer("warning", data.response.data.errorMessage, "");
      }
    });
  };

  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}

      <Modal
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={show}
        onHide={handleClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>{heading}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{data}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
          <Button variant="primary" onClick={confirmTrasferPrincipal}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalComponet;
