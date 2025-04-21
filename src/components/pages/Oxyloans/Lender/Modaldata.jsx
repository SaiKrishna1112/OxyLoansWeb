import { useState } from "react";

import Modal from "react-bootstrap/Modal";
import Table1 from "./Table1";

function Modaldata({ data, open, hidingStatement }) {
  const [lgShow, setLgShow] = useState(open);
  const [donloadlink, setdownloadlink] = useState(data.downloadStatement);
  const [statementDeal, setstatementDeal] = useState(data.dealName);

  const hidingStatementModal = () => {
    setLgShow(!lgShow);
    hidingStatement();
  };

  return (
    <>
      <Modal
        size="lg"
        show={lgShow}
        onHide={hidingStatementModal}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            <a href={donloadlink} className="pull-right mx-2">
              <i className="fa-solid fa-download" typeof="download"></i>   {""}Download     {""}    {""}
            </a>
            {""}
            {statementDeal} {""} Statement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table1 data={data} />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Modaldata;
