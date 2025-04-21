import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import BorrowermodelTable from "../Tables/BorrowermodelTable";

const Borrowermodel = ({ data, open, hidefun }) => {
    const [lgShow, setLgShow] = useState(true);
    const [showpassowrd, setshowpassword] = useState(false)
    console.log(data)
    const hidingStatementModal = () => {
        setLgShow(!lgShow);
        hidefun();
    };



    return (
        <Modal
            size="xl"
            show={lgShow}
            onHide={hidingStatementModal}
            aria-labelledby="example-modal-sizes-title-xl"
        >
            <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-xl">
                    Borrowers Info
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* <BorrowermodelTable data={data} /> */}

                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Borrower Id</th>
                            <th scope="col">Borrower Name</th>
                            <th scope="col">Mobile Number</th>
                            <th scope="col">Documents </th>
                            <th scope="col">Risk Category</th>
                            <th scope="col">Document Password</th>




                        </tr>
                    </thead>
                    <tbody>
                        {/* <tr>
                            <th scope="row">1</th>
                            <td>Mark</td>
                            <td>Otto</td>
                            <td>@mdo</td>
                            <td>Otto</td>
                            <td>@mdo</td>
                        </tr> */}
                        {data.length !== 0 ? (
                            data.map((item, index) => (
                                <tr key={index}>
                                    <th scope="row">{item.borrowerId}</th>
                                    <td>{item.borrowerName}</td>
                                    <td>{item.mobileNumber}</td>
                                    {item.panFilePath ? (
                                        <td>
                                            <a href={item.panFilePath} target="_blank" rel="noopener noreferrer">Pan</a>
                                            <br></br>
                                            <a href={item.aadharFilePath} target="_blank" rel="noopener noreferrer">Aadhar</a> <br></br>
                                            <a href={item.adminUploadCreditReportfile} target="_blank" rel="noopener noreferrer">Credit Report</a>
                                        </td>
                                    ) : (
                                        <td></td>
                                    )}

                                    <td>
                                        <p>{item.riskCategory}</p>
                                    </td>
                                    <td>
                                        {showpassowrd[index] ? (
                                            <p>{item.password}</p>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn button bg-success"
                                                style={{ zIndex: '1000', color: 'white !important', color: 'white' }}
                                                onClick={() =>
                                                    setshowpassword(prevState => ({
                                                        ...prevState,
                                                        [index]: !prevState[index]
                                                    }))
                                                }
                                            >
                                                <i className="fa fa-eye"></i> Show password
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            "No data"
                        )}

                        <div className="col-auto mt-2">
                            <a
                                href={localStorage.getItem("dealLink")}
                                className="badge "
                                target="_blank" style={{ backgroundColor: 'gray' }}
                            >
                                <i className="fa fa-eye"></i> View Borrower
                                Documents
                            </a>
                        </div>

                    </tbody>
                </table>
            </Modal.Body>
        </Modal>
    );
};

export default Borrowermodel;
