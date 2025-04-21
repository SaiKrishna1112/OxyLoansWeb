import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";

import { Table } from "antd";

const AutoInvestHistory = () => {
  const datasource = [
    {
      key: Math.random(),
      SO: "1",
      Createdon: "01-09-23",
      DealType: "ESCROW",
      status: "Enabled",
      ViewReferee: (
        <span className="badge badge-danger" type="button">
          Enable Auto Invest
        </span>
      ),
    },
    {
      key: Math.random(),
      SO: "2",
      Createdon: "02-09-23",
      DealType: "PERSONAL",
      status: "Disable",
      ViewReferee: (
        <span className="badge badge-success" type="button">
          Disable Auto Invest
        </span>
      ),
    },
  ];
  const column = [
    {
      title: "SO",
      dataIndex: "SO",
      sorter: (a, b) => a.SO.length - b.SO.length,
    },
    {
      title: "Createdon",
      dataIndex: "Createdon",
      sorter: (a, b) => a.Createdon.length - b.Createdon.length,
    },
    {
      title: "status",
      dataIndex: "status",
      sorter: (a, b) => a.status.length - b.status.length,
    },
    {
      title: "DealType",
      dataIndex: "DealType",
      sorter: (a, b) => a.DealType.length - b.DealType.length,
    },

    {
      title: "ViewReferee",
      dataIndex: "ViewReferee",
      sorter: (a, b) => a.ViewReferee.length - b.ViewReferee.length,
    },
  ];
  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <Header />

        {/* Sidebar */}
        <SideBar />

        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">Lender Auto Invest History</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      autoInvestHistory
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card card-table">
                  <div className="card-body">
                    {/* Page Header */}

                    <div className="table-responsive">
                      <Table
                        className="table border-0 star-student table-hover table-center mb-0 datatable table-striped dataTable no-footer"
                        pagination={{
                          total: datasource.length,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                        }}
                        columns={column}
                        dataSource={datasource}
                        // rowSelection={rowSelection}
                        // rowKey={(record) => record.id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          {/* <Footer /> */}
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default AutoInvestHistory;
