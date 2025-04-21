import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Table } from "antd";

import Header from "../../../../Header/Header";
import Sidebar from "../../../../SideBar/AdminSidebar";
import { onShowSizeChange } from "../../../../Pagination";
import { getMembershiphistory } from "../../../../HttpRequest/afterlogin";

const ViewPartnerAndDealer = () => {
  const [membershiphistory, setmembershiphistory] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
  });

  const membershiphisatoryPagination = (Pagination) => {
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
      title: "UTM Name",
      dataIndex: "PaymentDate",
      sorter: (a, b) => a.PaymentDate - b.PaymentDate,
    },
    {
      title: "User Type",
      dataIndex: "TransactionNumber",
      sorter: (a, b) => a.TransactionNumber.length - b.TransactionNumber.length,
    },
    {
      title: "Loan duration",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
    },
    {
      title: "Repayment Method",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
    },
    {
      title: "CIBIL 400-500 ROI",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
    },
    {
      title: "CIBIL 500-600 ROI",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
    },
    {
      title: "CIBIL 600-700 ROI",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
    },
    {
      title: "CIBIL 800-900 ROI",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
    },
    {
      title: "Modify",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
    },
  ];

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        {/*Page wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/*Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">View Partners</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Lender Loans Information
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
                    <div className="row">
                      <div className="col-3 mb-2">
                        <div className="student-submit">
                          <button type="button" className="btn btn-primary">
                            Fetch Deatils
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
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
                        dataSource={membershiphistory.hasdata ? datasource : []}
                        expandable={true}
                        loading={membershiphistory.loading}
                        onChange={membershiphisatoryPagination}
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

export default ViewPartnerAndDealer;
