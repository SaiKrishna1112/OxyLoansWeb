import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { getMyWithdrawalHistory } from "../../../HttpRequest/afterlogin";
import { cancelwithdrawalRequestInformation } from "../../Base UI Elements/SweetAlert";

const MywithdrawalHistory = () => {
  const [mywithdrawalHistory, setmywithdrawalHistory] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 10,
    defaultPageSize: 10,
    pagecount: 0
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
    return () => { };
  }, [mywithdrawalHistory.pageNo, mywithdrawalHistory.pageSize]);

  const datasource = [];
  {
    mywithdrawalHistory.apiData != ""
      ? mywithdrawalHistory.apiData.results.map((data) => {
        datasource.push({
          key: Math.random(),
          raisedon: data.createdOn,
          amount: data.amount ? data.amount.toLocaleString("en-IN") : null,
          approvedOn: data.requestFrom == "DEAL" ? data.createdOn : data.approvedOn,
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
                  data.status == "CANCELLED" ||
                  data.status == "AUTOREJECTED" ||
                  data.status == "ADMIN REJECTED"
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
      title: "UpdatedOn",
      dataIndex: "approvedOn",
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
        <Header />
        <SideBar />
        {/*Page wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/*Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">My Withdrawal Request Info</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      My Withdrawal History
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

export default MywithdrawalHistory;
