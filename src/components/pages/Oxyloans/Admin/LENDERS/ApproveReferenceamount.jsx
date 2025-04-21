import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";
import Header from "../../../../Header/Header";
import Sidebar from "../../../../SideBar/AdminSidebar";
import { Table } from "antd";
import { onShowSizeChange } from "../../../../Pagination";
import { getMembershiphistory } from "../../../../HttpRequest/afterlogin";

const ApproveReferenceamount = () => {
  const [modelopen, setmodelopen] = useState(false);

  const [membershiphistory, setmembershiphistory] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
  });

  const membershiphistoryPagination = (Pagination) => {
    setmembershiphistory({
      ...membershiphistory,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  useEffect(() => {
    const response = getMembershiphistory(
      membershiphistory.pageNo,
      membershiphistory.pageSize
    );
    response.then((data) => {
      if (data.request.status == 200) {
        setmembershiphistory({
          ...membershiphistory,
          apiData: data.data,
          loading: false,
          hasdata: data.data.count == 0 ? false : true,
        });
      }
    });
    return () => {};
  }, [membershiphistory.pageNo, membershiphistory.pageSize]);

  const datasource = [];
  {
    membershiphistory.apiData != ""
      ? membershiphistory.apiData.listOfTransactions.map((data) => {
          datasource.push({
            key: Math.random(),
            PaymentDate: data.paymentDate,
            TransactionNumber: data.transactionNumber,
            Amount: data.amount,
            PaidThrough: data.paidType,
          });
        })
      : "";
  }

  const columns = [
    {
      title: "Referee ID",
      dataIndex: "PaymentDate",
      sorter: (a, b) => a.PaymentDate - b.PaymentDate,
    },
    {
      title: "Referrer ID",
      dataIndex: "TransactionNumber",
      sorter: (a, b) => a.TransactionNumber.length - b.TransactionNumber.length,
    },
    {
      title: "Referee Name",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
    },
    {
      title: "Status",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
    },
    {
      title: "Payment Status",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
    },
    {
      title: "Admin Comments",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
    },
  ];

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <Header />

        {/* Sidebar */}
        <Sidebar />

        {/* Page Wrapper */}

        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title"> Reference Amount </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Reference Amount</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header"></div>
                  <div className="card-body">
                    {/* <form> */}
                    <div
                      className="modal fade"
                      id="exampleModal"
                      tabindex="-1"
                      aria-labelledby="exampleModalLabel"
                      aria-hidden="true"
                    >
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h1
                              className="modal-title fs-5"
                              id="exampleModalLabel"
                            >
                              {" "}
                              Reference List
                            </h1>
                            <button
                              type="button"
                              className="btn-close"
                              data-bs-dismiss="modal"
                              aria-label="Close"
                            ></button>
                          </div>
                          <div className="modal-body">
                            <Table
                              className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                              pagination={{
                                total: membershiphistory.apiData.count,
                                showTotal: (total, range) =>
                                  `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                                position: ["topRight"],
                                showSizeChanger: false,
                                onShowSizeChange: onShowSizeChange,
                              }}
                              columns={columns}
                              dataSource={
                                membershiphistory.hasdata ? datasource : []
                              }
                              expandable={true}
                              loading={membershiphistory.loading}
                              onChange={membershiphistoryPagination}
                            />
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              data-bs-dismiss="modal"
                            >
                              Close
                            </button>
                            <button type="button" className="btn btn-primary">
                              Save changes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      {modelopen && <></>}
                      <div className="col-12 col-sm-4">
                        <div className="form-group local-forms">
                          <label>
                            Transfered Date
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enther the Borrower Id "
                          />
                        </div>
                      </div>

                      <div className="col-3">
                        <div className="student-submit">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={() => setmodelopen(!modelopen)}
                          >
                            List
                          </button>
                        </div>
                      </div>
                    </div>{" "}
                    <div className="col-3">
                      <div className="student-submit">
                        <button type="button" className="btn btn-primary">
                          Fetch details
                        </button>
                      </div>
                    </div>
                    {/*   </form> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default ApproveReferenceamount;
