import React, { useEffect, useState } from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { getBorrowerRunningloans } from "../../../HttpRequest/afterlogin";

const MyLoanApplication = () => {
  const [myLoanHistory, setMyLoanApplication] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 10,
    defaultPageSize: 10,
  });
  const mywithdrawalPagination = (Pagination) => {
    setMyLoanApplication({
      ...myLoanHistory,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  useEffect(() => {
    const response = getBorrowerRunningloans(
      myLoanHistory.pageNo,
      myLoanHistory.pageSize
    );
    response.then((data) => {
      if (data.request.status == 200) {
        setMyLoanApplication({
          ...myLoanHistory,
          apiData: data.data,
          loading: false,
          hasdata: data.data.results.length == 0 ? false : true,
        });
      }
    });
    return () => {};
  }, [myLoanHistory.pageNo, myLoanHistory.pageSize]);

  const datasource = [];
  {
    myLoanHistory.apiData != ""
      ? myLoanHistory.apiData.results.map((data) => {
          datasource.push({
            key: Math.random(),
            AppID: data.applicationId,
            DisbursementAmount: data.disbursmentAmount,
            DisbursementDate: data.disbursedDate,
            ViewLendersForthisLoan: "button",
          });
        })
      : "";
  }

  const columns = [
    {
      title: "App ID",
      dataIndex: "AppID",
      sorter: (a, b) => a.AppID - b.AppID,
    },
    {
      title: "Disbursement Amount",
      dataIndex: "DisbursementAmount",
      sorter: (a, b) => a.DisbursementAmount - b.DisbursementAmount,
    },
    {
      title: "Disbursement Date",
      dataIndex: "DisbursementDate",
      sorter: (a, b) => a.DisbursementDate.length - b.DisbursementDate.length,
    },
    {
      title: "View Lenders For this Loan",
      dataIndex: "ViewLendersForthisLoan",
      sorter: (a, b) =>
        a.ViewLendersForthisLoan.length - b.ViewLendersForthisLoan.length,
    },
  ];

  return (
    <>
      <div className="main-wrapper">
        <BorrowerHeader />
        <BorrowerSidebar />
        {/*Page wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/*Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">Running Loans</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      My Loan Application
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">
                    <div>
                      <Table
                        className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                        pagination={{
                          total: myLoanHistory.apiData.totalCount,
                          defaultPageSize: myLoanHistory.defaultPageSize,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={columns}
                        dataSource={myLoanHistory.hasdata ? datasource : []}
                        expandable={true}
                        loading={myLoanHistory.loading}
                        onChange={mywithdrawalPagination}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Page wrapper */}
      </div>
    </>
  );
};

export default MyLoanApplication;
