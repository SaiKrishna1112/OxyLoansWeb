import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Table } from "antd";

import { getMyfinancialEarnings } from "../../../HttpRequest/afterlogin";
import { confirmationAlertFyYear } from "../../Base UI Elements/SweetAlert";

const EarningCertificate = () => {
  const [myfyearnings, setmyfyearnings] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
  });

  const profitearnedCertificate = (startdate, enddate, downloadType, status) => {
    confirmationAlertFyYear(startdate, enddate, downloadType, status);
  };

  useEffect(() => {
    const response = getMyfinancialEarnings();
    response.then((data) => {
      if (data.request.status == 200) {
        setmyfyearnings({
          ...myfyearnings,
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
    myfyearnings.apiData != ""
      ? myfyearnings.apiData.map((data) => {
        datasource.push({
          key: Math.random(),
          SO: data.sNo,
          FY: data.financialYear,
          EARNINGS: data.incomeEarned,
          DOWNLOADFYREPORT: (
            <span
              className="badge bg-success"
              type="button"
              onClick={() => {
                profitearnedCertificate(
                  data.startDate,
                  data.endDate,
                  "DOWNLOAD",
                  "dealsum"
                );
              }}
            >
              <i className="fa-solid fa-download"></i> Download FY Report
            </span>
          ),
          DOWNLOADMONTREPORT: (
            <span
              className="badge bg-warning"
              type="button"
              onClick={() => {
                profitearnedCertificate(
                  data.startDate,
                  data.endDate,
                  "DOWNLOAD",
                  "dealsumMonthly"
                );
              }}
            >
              <i className="fa-solid fa-download"></i> Download MONTHLY Report
            </span>
          ),

          EMAILFYREPORT: (
            <span
              className="badge bg-info"
              type="button"
              onClick={() => {
                profitearnedCertificate(
                  data.startDate,
                  data.endDate,
                  "EMAIL"
                );
              }}
            >
              <i className="fa-solid fa-envelope"></i> Get FY Email Report
            </span>
          ),
        });
      })
      : "";
  }

  const columns = [
    {
      title: "SNO",
      dataIndex: "SO",
      sorter: (a, b) => a.SO - b.SO,
    },
    {
      title: "FY",
      dataIndex: "FY",
      sorter: (a, b) => a.FY.length - b.FY.length,
    },
    {
      title: "EARNINGS",
      dataIndex: "EARNINGS",
      sorter: (a, b) => a.EARNINGS - b.EARNINGS,
    },
    {
      title: "DOWNLOAD FY REPORT",
      dataIndex: "DOWNLOADFYREPORT",
    },
    {
      title: "DOWNLOAD MONTHLY REPORT",
      dataIndex: "DOWNLOADMONTREPORT",
    },

    {
      title: "EMAIL FY REPORT",
      dataIndex: "EMAILFYREPORT",
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
                  <h3 className="page-title">Financial Reports</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Financial Reports
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
                          total: datasource.length,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                        }}
                        columns={columns}
                        dataSource={myfyearnings.hasdata ? datasource : []}
                        expandable={true}
                        loading={myfyearnings.loading}
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

export default EarningCertificate;
