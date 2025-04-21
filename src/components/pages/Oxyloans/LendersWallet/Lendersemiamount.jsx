import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Table } from "antd";

import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/AdminSidebar";
import { onShowSizeChange } from "../../../Pagination";
import { getMembershiphistory } from "../../../HttpRequest/afterlogin";

const Lendersemiamount = () => {
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
      title: "Lender ID",
      dataIndex: "PaymentDate",
      sorter: (a, b) => a.PaymentDate - b.PaymentDate,
    },
    {
      title: "Lender Name",
      dataIndex: "TransactionNumber",
      sorter: (a, b) => a.TransactionNumber.length - b.TransactionNumber.length,
    },
    {
      title: "Lender",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
    },
    {
      title: "Account Number",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
    },
    {
      title: "EMI Amount",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
    },
    {
      title: "DueDateOn",
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
                  <h3 className="page-title">
                    Monthly Transfers EMI Amount To The Lenders
                  </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Search Fd Types</li>
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
                      <div className="col-12 col-sm-3">
                        <div className="form-group local-forms">
                          {/* <label>
   
      <span className="login-danger">*</span>
    </label> */}
                          <select
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enther the Lender ID "
                          >
                            <option>-- Choose Month and year --</option>
                            <option> MONTH&YEAR </option>
                          </select>
                        </div>
                      </div>

                      <div className="col-3">
                        <div className="student-submit">
                          <button type="button" className="btn btn-primary">
                            Fetch Deatils
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p>
                        <strong>Note:</strong> Our immediate goal is to showcase
                        your wallet transactions, interest earnings, principal
                        returns and principal return upon withdrawal request. In
                        the Future, We will be adding much more meaningful
                        details and map them to Running Loans.
                      </p>
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
                        onChange={membershiphistoryPagination}
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

export default Lendersemiamount;
