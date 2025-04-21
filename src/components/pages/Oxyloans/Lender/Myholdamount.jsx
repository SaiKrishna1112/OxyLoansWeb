import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { getholdamountInfo } from "../../../HttpRequest/afterlogin";

const Myholdamount = () => {
  const [holdamountInfo, setholdamountInfo] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
  });

  useEffect(() => {
    const response = getholdamountInfo();
    response.then((data) => {
      if (data.request.status == 200) {
        setholdamountInfo({
          ...holdamountInfo,
          apiData: data.data,
          loading: false,
          hasdata: data.data.length == 0 ? false : true,
        });
      }
    });
    return () => { };
  }, []);

  const datasource = [];
  {
    holdamountInfo.apiData != ""
      ? holdamountInfo.apiData.map((data) => {
        datasource.push({
          key: Math.random(),
          Extraamount: data.holdAmount,
          Extraamountpaiddetails: data.comments,
          Deductiondetails: data.comments,
          Status: data.status,
        });
      })
      : [];
  }

  const columns = [
    {
      title: "Sno",
      dataIndex: "Sno",
      sorter: (a, b) => a.key - b.key,
    },
    {
      title: "Extra amount",
      dataIndex: "Extraamount",
      sorter: (a, b) => a.Extraamount - b.Extraamount,
    },
    {
      title: "Extra Amount paid details",
      dataIndex: "Extraamountpaiddetails",
      sorter: (a, b) =>
        a.Extraamountpaiddetails.length - b.Extraamountpaiddetails.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      sorter: (a, b) => a.Status.length - b.Status.length,
    },
    {
      title: "Deduction details",
      dataIndex: "Deductiondetails",
      sorter: (a, b) => a.Deductiondetails.length - b.Deductiondetails.length,
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
                  <h3 className="page-title">Hold Amount From Deals</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active"> hold amount</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header text-bold">
                    <code>
                      <strong>Note : </strong>
                    </code>
                    <br />
                    Please take note that if there is an overpayment made for
                    any transaction, we will clearly display the excess amount
                    here. These surplus funds will be subtracted from upcoming
                    interest or principal payments. Please refer to the
                    following details for a comprehensive understanding of this
                    process.
                  </div>
                  <div className="card-body">
                    <div>
                      <Table
                        className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                        pagination={{
                          total: datasource.length,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={columns}
                        dataSource={holdamountInfo.hasdata ? datasource : []}
                        expandable={true}
                        loading={holdamountInfo.loading}
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

export default Myholdamount;
