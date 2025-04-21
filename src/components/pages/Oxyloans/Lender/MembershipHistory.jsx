import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { getMembershiphistory } from "../../../HttpRequest/afterlogin";

const MembershipHistory = () => {
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
        console.log(data)
        setmembershiphistory({
          ...membershiphistory,
          apiData: data.data,
          loading: false,
          hasdata: data.data.count == 0 ? false : true,
        });
      } else {
        setmembershiphistory({
          ...membershiphistory,
          loading: false,
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
            DealId: data.dealId,
          });
        })
      : "";
  }

  const columns = [
    {
      title: "Payment Date",
      dataIndex: "PaymentDate",
      sorter: (a, b) => new Date(a.PaymentDate) - new Date(b.PaymentDate),
    },
    {
      title: "Transaction Number",
      dataIndex: "TransactionNumber",
      sorter: (a, b) => a.TransactionNumber.length - b.TransactionNumber.length,
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
    },
    {
      title: "Deal Id",
      dataIndex: "DealId",
      sorter: (a, b) => a.dealId - b.dealId,
    },
    {
      title: "Paid Through",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
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
                  <h3 className="page-title">
                    Membership Transactions History
                  </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Membership History
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

export default MembershipHistory;
