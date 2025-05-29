import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";

const Borrowermodel = ({ data, open, hidefun }) => {
  const [lgShow, setLgShow] = useState(true);
  const [showPassword, setShowPassword] = useState({});

  const hidingStatementModal = () => {
    setLgShow(false);
    hidefun();
  };

  return (
    <Modal
      size="xl"
      show={lgShow}
      onHide={hidingStatementModal}
      aria-labelledby="example-modal-sizes-title-xl"
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-xl">
          Borrowers Info
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="table table-bordered" style={{ minWidth: "900px" }}>
            <thead>
              <tr>
                <th>Borrower Id</th>
                <th>Borrower Name</th>
                <th>Mobile Number</th>
                <th>Documents</th>
                <th>Risk Category</th>
                <th>Document Password</th>
                <th>CIBIL Report</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.borrowerId}</td>
                    <td>{item.borrowerName}</td>
                    <td>{item.mobileNumber}</td>
                    <td>
                      {item.panFilePath ? (
                        <>
                          <a
                            href={item.panFilePath}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Pan
                          </a>
                          <br />
                          <a
                            href={item.aadharFilePath}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Aadhar
                          </a>
                          <br />
                          <a
                            href={item.adminUploadCreditReportfile}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Credit Report
                          </a>
                        </>
                      ) : (
                        "Not Available"
                      )}
                    </td>
                    <td>{item.riskCategory}</td>
                    <td>
                      {item.password ? (
                        showPassword[index] ? (
                          <p>{item.password}</p>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                [index]: true,
                              }))
                            }
                          >
                            <i className="fa fa-eye"></i> Show password
                          </button>
                        )
                      ) : (
                        <p>Not Available</p>
                      )}
                    </td>
                    <td>
                      {item.adminUploadCreditReportfile ? (
                        <a
                          href={item.adminUploadCreditReportfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="badge"
                          style={{ backgroundColor: "gray", color: "#fff" }}
                        >
                          <i className="fa fa-eye"></i> View CIBIL
                        </a>
                      ) : (
                        <p>No CIBIL uploaded</p>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Borrowermodel;
