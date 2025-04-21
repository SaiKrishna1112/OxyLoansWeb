import { useState } from "react";

import Modal from "react-bootstrap/Modal";
import "./InvoiceGrid.css";
import { Table, Tag } from "antd";
import { Link } from "react-router-dom";
const { Column, ColumnGroup } = Table;

function AlertTable({ data, open: propOpen, sendRunningDealStatement }) {
  const [show, setShow] = useState(propOpen);

  const handleClose = async () => {
    setShow(false);
    sendRunningDealStatement();
  };

  const tableapi = [];
  {
    data.lenderParticipationUpdatedInfo !== "" ? (
      data.lenderParticipationUpdatedInfo.map((api, index) => {
        tableapi.push({
          key: index + 1,
          upatedDate: api.upatedDate,
          amount: api.amount,
        });
      })
    ) : (
      <p>No data found</p>
    );
  }

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="modal-90w lg-down"
        aria-labelledby="example-custom-modal-styling-title"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
             Participation Amount Info
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            If you've any queries please write to us{" "}
            <Link to="/writetous">Click Here</Link>{" "}
          </p>
          <Table dataSource={tableapi} pagination={false}>
            <Column
              title="Participation Date"
              dataIndex="upatedDate"
              key="upatedDate"
            />

            <Column title="Amount" dataIndex="amount" key="amount" />
          </Table>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AlertTable;
