import React, { useEffect, useState } from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { getMyWithdrawalHistory } from "../../../HttpRequest/afterlogin";
import { cancelwithdrawalRequestInformation } from "../../Base UI Elements/SweetAlert";

const PayEmi = () => {
  const [mywithdrawalHistory, setmywithdrawalHistory] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 10,
    defaultPageSize: 10,
  });
  const mywithdrawalPagination = (Pagination) => {
    setmywithdrawalHistory({
      ...mywithdrawalHistory,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  const confirmcancelrequest = (fromrequest, id) => {
    cancelwithdrawalRequestInformation(fromrequest, id);
  };

  useEffect(() => {
    const response = getMyWithdrawalHistory(
      mywithdrawalHistory.pageNo,
      mywithdrawalHistory.pageSize
    );
    response.then((data) => {
      if (data.request.status == 200) {
        setmywithdrawalHistory({
          ...mywithdrawalHistory,
          apiData: data.data,
          loading: false,
          hasdata: data.data.results.length == 0 ? false : true,
        });
      }
    });
    return () => {};
  }, [mywithdrawalHistory.pageNo, mywithdrawalHistory.pageSize]);

  const datasource = [];
  {
    mywithdrawalHistory.apiData != ""
      ? mywithdrawalHistory.apiData.results.map((data) => {
          datasource.push({
            key: Math.random(),
            raisedon: data.createdOn,
            amount: data.amount,
            reason: data.withdrawalReason,
            requestedFrom: data.requestFrom,
            status: data.status,
            action: (
              <button
                type="submit"
                className="btn  w-70 btn-primary btn-xs"
                disabled={
                  data.status == "APPROVED" ||
                  data.status == "REJECTED" ||
                  data.status == "ADMINREJECTED" ||
                  data.status == "USERREJECTED" ||
                  data.status == "AUTOREJECTED"
                    ? true
                    : false
                }
                onClick={() => {
                  confirmcancelrequest(data.requestFrom, data.id);
                }}
              >
                Cancel Request
              </button>
            ),
          });
        })
      : "";
  }

  const columns = [
    {
      title: "Raised on",
      dataIndex: "raisedon",
      sorter: (a, b) => new Date(a.raisedon) - new Date(b.raisedon),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      sorter: (a, b) => a.reason.length - b.reason.length,
    },
    {
      title: "Requested From",
      dataIndex: "requestedFrom",
      sorter: (a, b) => a.requestedFrom.length - b.requestedFrom.length,
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.status.length - b.status.length,
    },
    {
      title: "Action",
      dataIndex: "action",
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
                  <h3 className="page-title">Pay EMI</h3>
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
                          total: mywithdrawalHistory.apiData.totalCount,
                          defaultPageSize: mywithdrawalHistory.defaultPageSize,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={columns}
                        dataSource={
                          mywithdrawalHistory.hasdata ? datasource : []
                        }
                        expandable={true}
                        loading={mywithdrawalHistory.loading}
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

export default PayEmi;
