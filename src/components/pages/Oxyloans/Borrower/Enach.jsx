import React, { useEffect, useState } from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Link } from "react-router-dom";
import { Table, Pagination } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { enachmandate } from "../../../HttpRequest/afterlogin";
import { cancelwithdrawalRequestInformation } from "../../Base UI Elements/SweetAlert";

const Enach = () => {
  const [myEnach, setEnach] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 10,
    defaultPageSize: 10,
  });
  const mywithdrawalPagination = (Pagination) => {
    setEnach({
      ...myEnach,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  const confirmcancelrequest = (fromrequest, id) => {
    cancelwithdrawalRequestInformation(fromrequest, id);
  };

  useEffect(() => {
    const response = enachmandate(myEnach.pageNo, myEnach.pageSize);
    response.then((data) => {
      if (data.request.status == 200) {
        setEnach({
          ...myEnach,
          apiData: data.data,
          loading: false,
          hasdata: data.data.length == 0 ? false : true,
        });
      }
    });
    return () => {};
  }, [myEnach.pageNo, myEnach.pageSize]);

  const datasource = [];
  {
    myEnach.apiData != ""
      ? myEnach.apiData.results.map((data) => {
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
      title: "Lender info",
      dataIndex: "Lenderinfo",
      sorter: (a, b) => a.Lenderinfo - b.Lenderinfo,
    },
    {
      title: "Loan info",
      dataIndex: "loaninfo",
      sorter: (a, b) => a.loaninfo - b.loaninfo,
    },
    {
      title: "enach status",
      dataIndex: "enachstatus",
      sorter: (a, b) => a.enachstatus.length - b.enachstatus.length,
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
                  <h3 className="page-title">Enach</h3>
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
                          total: myEnach.apiData.totalCount,
                          defaultPageSize: myEnach.defaultPageSize,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={columns}
                        dataSource={myEnach.hasdata ? datasource : []}
                        expandable={true}
                        loading={myEnach.loading}
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

export default Enach;
