import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Table } from "antd";
import { onShowSizeChange } from "../../../../Pagination";

import SideBar from "../../../../SideBar/SideBar";
import Footer from "../../../../Footer/Footer";
import { referralEarningsInfo } from "../../../../HttpRequest/afterlogin";

import Header from "../../../../Header/Header";

const ViewDealTypePayOut = () => {
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
            RefereeName: (
              <>
                <div className="tablepara">
                  <p>
                    <strong>Deal name :</strong>test hold today 4
                  </p>
                  <p>Deal Id :10</p>
                  <p>Aggrements : PENDING</p>
                  <p>
                    <strong>First Participation :</strong> 02-01-2024 12:52:13
                  </p>
                  <p>Last Participation : No Data</p>
                </div>
              </>
            ),
            EarnedAmount: (
              <>
                <div className="tablepara">
                  <p>Participate : 15000</p>
                  <p>Current Amount : 15000</p>
                  <p>To Wallet : 0</p>
                  <p>Return Principal : 0</p>
                </div>
              </>
            ),
            EarnedAmount: (
              <>
                <div className="tablepara">
                  <p>Participate : 15000</p>
                  <p>Current Amount : 15000</p>
                  <p>To Wallet : 0</p>
                  <p>Return Principal : 0</p>
                </div>
              </>
            ),
            PaymentStatus: (
              <>
                <div className="tablepara">
                  <p>Borrower :u</p>
                  <p>Borrower ROI :3</p>
                  <p>Lender ROI :1.5</p>
                  <p>Status :Yet to be Achieved</p>
                  <p>Deal Amount : 100,000</p>
                  <p>Emi date : 2025-01-02</p>
                </div>
              </>
            ),
            TransferredOn: (
              <>
                <div className="buttongroupline">
                  <Button>Edit</Button>
                  <Button danger>Edit</Button>
                  <Button>Deal Reopen</Button>
                  <Button>Tenure Extend</Button>
                </div>
              </>
            ),
            Remarks: (
              <>
                <div className="buttongroupline">
                  <Button> View Lenders</Button>
                  <Button> Withdrawal Request</Button>
                  <Button> Principal Summary</Button>
                </div>
              </>
            ),
            intialbutton: (
              <>
                <div className="buttongroupline">
                  <Button> Pay Interest</Button>
                  <Button> Initiating Notifications</Button>
                  <Button> Interest Summary</Button>
                </div>
              </>
            ),
          });
        })
      : "";
  }

  const column = [
    {
      title: "Deal Name",
      dataIndex: "RefereeName",
      sorter: (a, b) => a.RefereeName.length - b.RefereeName.length,
    },

    {
      title: "Deal Info",
      dataIndex: "EarnedAmount",
      sorter: (a, b) => a.EarnedAmount.length - b.EarnedAmount.length,
    },
    {
      title: "Deal User",
      dataIndex: "PaymentStatus",
      sorter: (a, b) => a.PaymentStatus.length - b.PaymentStatus.length,
    },
    {
      title: "Modify",
      dataIndex: "TransferredOn",
      sorter: (a, b) => a.TransferredOn.length - b.TransferredOn.length,
    },
    {
      title: "View Participated Users",
      dataIndex: "Remarks",
      sorter: (a, b) => a.Remarks.length - b.Remarks.length,
    },
    {
      title: "Know More",
      dataIndex: "intialbutton",
      sorter: (a, b) => a.intialbutton.length - b.intialbutton.length,
    },
  ];

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <Header />

        {/* Sidebar */}
        <SideBar />

        {/* Page Wrapper */}

        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">Running & Closed Deals</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
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
                      Equity Running Deals
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <div className="card card-table">
                  <div className="card-header">
                    <button className="btn btn-xs col-md-4 btn-info col-12">
                      {referalMyearnigs.borrowerlink ? (
                        <>Equity Participation Closed Deals </>
                      ) : (
                        <> copied</>
                      )}
                    </button>
                    <button
                      className="btn btn-xs col-md-4 btn-success col-12"
                      style={{ marginLeft: "6px" }}
                    >
                      <i class="fa-solid fa-download"></i>
                      Regular Participation Closed Deals
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

export default ViewDealTypePayOut;
