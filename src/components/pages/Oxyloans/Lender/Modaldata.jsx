import { useState } from "react";

import Modal from "react-bootstrap/Modal";
import Table1 from "./Table1";
import { Table, Pagination, Spin, Tag } from "antd";


function Modaldata({ data, open, hidingStatement,loading }) {
  const [lgShow, setLgShow] = useState(open);
  const [donloadlink, setdownloadlink] = useState(data.downloadStatement);
  const [statementDeal, setstatementDeal] = useState(data.dealName);

  const hidingStatementModal = () => {
    setLgShow(!lgShow);
    hidingStatement();
    // setModelStatement(false);
  // setLoading(false);

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
           {loading ==true? (
 <div className="row d-flex justify-content-center">
                      <Spin
                        tip="Loading..."
                        className="text-center"
                        large="large"
                      ></Spin>
                    </div>
                        ) : (
          <Table1 data={data} />
                        )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Modaldata;
