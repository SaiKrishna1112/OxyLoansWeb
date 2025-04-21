import React, { useEffect, useState } from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { myagreedloanapplication } from "../../../HttpRequest/afterlogin";

const AgreedLoan = () => {
  const [myagreedloanInfo, setmyAgrredHistory] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 10,
    defaultPageSize: 10,
  });
  const mywithdrawalPagination = (Pagination) => {
    setmyAgrredHistory({
      ...myagreedloanInfo,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  useEffect(() => {
    const response = myagreedloanapplication(
      myagreedloanInfo.pageNo,
      myagreedloanInfo.pageSize
    );
    response.then((data) => {
      if (data.request.status == 200) {
        setmyAgrredHistory({
          ...myagreedloanInfo,
          apiData: data.data,
          loading: false,
          hasdata: data.data.results.length == 0 ? false : true,
        });
      }
    });
    return () => {};
  }, [myagreedloanInfo.pageNo, myagreedloanInfo.pageSize]);

  const datasource = [];
  {
    myagreedloanInfo.apiData != ""
      ? myagreedloanInfo.apiData.results.map((data) => {
          datasource.push({
            key: Math.random(),
            raisedon: data.createdOn,
            amount: data.amount,
            reason: data.withdrawalReason,
            requestedFrom: data.requestFrom,
            status: data.status,
          });
        })
      : "";
  }

  const columns = [
    {
      title: "Lender Info",
      dataIndex: "LenderInfo",
      sorter: (a, b) => new Date(a.raisedon) - new Date(b.raisedon),
    },
    {
      title: "Loan Amount Info",
      dataIndex: "LoanAmountInfo",
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "status",
      dataIndex: "status",
      sorter: (a, b) => a.reason.length - b.reason.length,
    },
    {
      title: "Download Aggrement",
      dataIndex: "downloadAggrement",
      sorter: (a, b) => a.requestedFrom.length - b.requestedFrom.length,
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
                  <h3 className="page-title">Agreed Loans</h3>
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
                          total: myagreedloanInfo.apiData.totalCount,
                          defaultPageSize: myagreedloanInfo.defaultPageSize,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={columns}
                        dataSource={myagreedloanInfo.hasdata ? datasource : []}
                        expandable={true}
                        loading={myagreedloanInfo.loading}
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

export default AgreedLoan;
