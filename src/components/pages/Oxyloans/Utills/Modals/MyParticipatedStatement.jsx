import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import MyParticipateStatementTable from "../Tables/MyParticipateStatementTable";
import { Spin, Tag } from "antd";

const MyParticipatedStatement = ({ data, open, hidefun,loading }) => {
  const [lgShow, setLgShow] = useState(open);

  const hidingStatementModal = () => {
    setLgShow(!lgShow);
    hidefun();
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
          Interest Info
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
      <MyParticipateStatementTable data={data} />
    )}      
    </Modal.Body>
    </Modal>
  );
};

export default MyParticipatedStatement;
