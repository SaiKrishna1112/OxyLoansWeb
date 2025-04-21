import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Table } from "antd";
import { onShowSizeChange, itemRender } from "../../../Pagination";
import { getMyTransactions } from "../../../HttpRequest/afterlogin";
import { downloadMytransactionAlert } from "../../Base UI Elements/SweetAlert";

const Mytransactions = () => {
  const [mytransactions, setmytransactions] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 6,
    defaultPageSize: 6,
    donloadlink: "",
  });

  const mytransactionpagination = (dats) => {
    setmytransactions({
      ...mytransactions,
      defaultPageSize: dats.pageSize,
      pageNo: dats.current,
      pageSize: dats.pageSize,
    });
  };

  useEffect(() => {
    const response = getMyTransactions(
      mytransactions.pageNo,
      mytransactions.pageSize
    );
    response.then((data) => {
      if (data.request.status == 200) {
        setmytransactions({
          ...mytransactions,
          apiData: data.data,
          loading: false,
          hasdata: data.data.count == 0 ? false : true,
        });
      }
    });
    return () => {};
  }, [mytransactions.pageNo, mytransactions.pageSize]);

  const datasource = [];
  {
    mytransactions.apiData != ""
      ? mytransactions.apiData.map((data) => {
          datasource.push({
            key: Math.random(),
            TransactionDate: data.transactionDate,
            CreditedAmount: data.creditedAmount,
            DebitedAmount: data.debitedAmount,
            Status: data.amountFrom == " " ? " No data found" : data.amountFrom,
          });
        })
      : "";
  }

  const columns = [
    {
      title: "Transaction Date",
      dataIndex: "TransactionDate",
      sorter: (a, b) => a.raisedon - b.raisedon,
    },
    {
      title: "Credited Amount",
      dataIndex: "CreditedAmount",
      sorter: (a, b) => a.CreditedAmount - b.CreditedAmount,
    },
    {
      title: "Debited Amount",
      dataIndex: "DebitedAmount",
      sorter: (a, b) => a.DebitedAmount - b.DebitedAmount,
    },
    {
      title: "Description",
      dataIndex: "Status",
      sorter: (a, b) => a.Status - b.Status,
    },
  ];

  const handeltranscationAlert = () => {
    downloadMytransactionAlert();
  };

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
                  <h3 className="page-title">My Transactions</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">my transactions</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header">
                    <button
                      className="btn btn-xs col-12 col-md-2 btn-success pull-right"
                      onClick={handeltranscationAlert}
                    >
                      <i className="fa fa-download"></i> Download
                    </button>
                  </div>
                  <div className="card-body">
                    <div>
                      <Table
                        className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                        pagination={{
                          total: datasource.length,
                          defaultPageSize: mytransactions.defaultPageSize,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: false,
                          onShowSizeChange: onShowSizeChange,
                          size: "default",
                          showLessItems: true,
                          pageSizeOptions: [5, 10, 15, 20],
                          responsive: true,
                        }}
                        columns={columns}
                        dataSource={mytransactions.hasdata ? datasource : []}
                        expandable={true}
                        loading={mytransactions.loading}
                        onChange={mytransactionpagination}
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

export default Mytransactions;
