import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";

import Footer from "../../../Footer/Footer";
import { Earning, referralEarningsInfo } from "../../../HttpRequest/afterlogin";
import { Success, WarningBackendApi } from "../../Base UI Elements/SweetAlert";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import BorrowerHeader from "../../../Header/BorrowerHeader";

const MyEarnings = () => {
  const [referalMyearnigs, setreferalMyearnigs] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
    Invitelender: "",
    inviteborrower: "",
    invitenri: "",
    borrowerlink: true,
    earninglink: "",
    lenderlink: true,
    invitenrilink: true,
  });

  const referalMyearnigsPagination = (Pagination) => {
    setreferalMyearnigs({
      ...referalMyearnigs,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  useEffect(() => {
    const response = referralEarningsInfo(
      referalMyearnigs.pageNo,
      referalMyearnigs.pageSize
    );
    response.then((data) => {
      if (data.request.status == 200) {
        setreferalMyearnigs({
          ...referalMyearnigs,
          apiData: data.data,
          loading: false,
          hasdata: data.data.count == 0 ? false : true,
        });
      }
    });
  }, [referalMyearnigs.pageNo, referalMyearnigs.pageSize]);

  const datasource = [];
  {
    referalMyearnigs.apiData != ""
      ? referalMyearnigs.apiData.lenderReferenceAmountResponse.map((data) => {
          datasource.push({
            key: Math.random(),
            RefereeName: data.userName,
            RefereeId: data.refereeNewId,
            EarnedAmount: data.amount,
            PaymentStatus: data.paymentStatus,
            TransferredOn:
              data.transferredOn == ""
                ? "Yet To be Credit"
                : data.transferredOn,
            Remarks: data.remarks == null ? "No Remarks" : data.remarks,
          });
        })
      : "";
  }

  const Invitelender = async () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.oxyloans.com/new/register_lender?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setreferalMyearnigs({
      ...referalMyearnigs,
      Invitelender: !referalMyearnigs.Invitelender,
      lenderlink: false,
    });
  };
  const Inviteborrower = async () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.oxyloans.com/new/register_borrower?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setreferalMyearnigs({
      ...referalMyearnigs,
      Inviteborrower: !referalMyearnigs.Inviteborrower,
      borrowerlink: false,
    });
  };
  const Invitenri = async () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.oxyloans.com/new/nrilenderregistration?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setreferalMyearnigs({
      ...referalMyearnigs,
      invitenri: !referalMyearnigs.invitenri,
      invitenrilink: false,
    });
  };

  const EarningStatementlink = async () => {
    const response = Earning("");
    response.then((data) => {
      if (data.request.status == 200) {
        setreferalMyearnigs({
          ...referalMyearnigs,
          earninglink: data.data.downloadLink,
        });
        Success("success", "File Sucessfully Downloaded");
        window.open(data.data.downloadLink, "_blank");
      } else if (data.response.data.errorCode != "200") {
        WarningBackendApi("warning", `${data.response.data.errorMessage}`);
      }
    });
  };

  const column = [
    {
      title: "Referee Name",
      dataIndex: "RefereeName",
      sorter: (a, b) => a.RefereeName.length - b.RefereeName.length,
    },

    {
      title: "Earned Amount",
      dataIndex: "EarnedAmount",
      sorter: (a, b) => a.EarnedAmount - b.EarnedAmount,
    },
    {
      title: "Payment Status",
      dataIndex: "PaymentStatus",
      sorter: (a, b) => a.PaymentStatus.length - b.PaymentStatus.length,
    },
    {
      title: "Transferred On",
      dataIndex: "TransferredOn",
      sorter: (a, b) =>
        new Date(a.TransferredOn.length) - new Date(b.TransferredOn.length),
    },
    {
      title: "Remarks",
      dataIndex: "Remarks",
      sorter: (a, b) => a.Remarks.length - b.Remarks.length,
    },
  ];

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <BorrowerHeader />

        {/* Sidebar */}
        <BorrowerSidebar />

        {/* Page Wrapper */}

        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">
                    My Earnings Through Invite Friend
                  </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">My Network</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="student-group-form">
              <div className="row" style={{ display: "none" }}>
                <div className="col-lg-3 col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by Payment Status "
                    />
                  </div>
                </div>

                <div className="col-lg-2 pull-right">
                  <div className="search-student-btn">
                    <button type="btn" className="btn btn-primary">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <div className="card card-table">
                  <div className="card-header">
                    <button
                      onClick={Inviteborrower}
                      className="btn btn-xs col-md-2 btn-info col-12 text-white"
                    >
                      {referalMyearnigs.borrowerlink ? (
                        <>Invite Borrower</>
                      ) : (
                        <> copied</>
                      )}
                    </button>
                    <button
                      onClick={Invitelender}
                      className="btn btn-xs col-md-2 btn-warning  mx-lg-1 col-12 text-white"
                    >
                      {referalMyearnigs.lenderlink ? (
                        <>Invite Lender</>
                      ) : (
                        <> copied</>
                      )}
                    </button>
                    <button
                      onClick={Invitenri}
                      className="btn btn-xs col-md-2 btn-success mx-lg-1  col-12"
                    >
                      {referalMyearnigs.invitenrilink ? (
                        <>Invite An NRI</>
                      ) : (
                        <>copied</>
                      )}
                    </button>
                    <button
                      className="btn btn-xs col-md-3 btn-danger col-12"
                      onClick={() => EarningStatementlink()}
                    >
                      <i className="fa-solid fa-download"></i> Earning Statement
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="page-header m-0 p-0"></div>
                    <div className="table-responsive">
                      <Table
                        className="table table-stripped table-hover datatable"
                        pagination={{
                          total: referalMyearnigs.apiData.count,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: false,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={column}
                        dataSource={referalMyearnigs.hasdata ? datasource : []}
                        expandable={true}
                        loading={referalMyearnigs.loading}
                        onChange={referalMyearnigsPagination}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <Footer />
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default MyEarnings;
