import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import MyReffereeTable from "../Tables/MyReffereeTable";

const MyReffereeModal = ({ data, open }) => {
  const [lgShow, setLgShow] = useState(open);

  const hidingStatementModal = () => {
    setLgShow(!lgShow);
  };

  return (
    <Modal
      size="lg"
      show={lgShow}
      onHide={hidingStatementModal}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          Refferee Info
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <MyReffereeTable data={data} />
      </Modal.Body>
    </Modal>
  );
};

export default MyReffereeModal;
