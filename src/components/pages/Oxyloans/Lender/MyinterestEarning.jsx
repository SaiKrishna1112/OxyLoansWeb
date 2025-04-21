import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Table } from "antd";
import { onShowSizeChange, itemRender } from "../../../Pagination";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import {
  getMyToatlInterestEarnings,
  getMyinterestEarningSearch,
} from "../../../HttpRequest/afterlogin";

const MyinterestEarning = () => {
  const [myinterestEarnigs, setmyinterestEarnigs] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    totalEarnigAmount: 0,
    searchStartdate: null,
    searchEndDate: null,
    sortbased: null,
    btnvalid: true,
  });

  const searchOnchange = (pros) => {
    const { name, value } = pros.target;
    setmyinterestEarnigs({
      ...myinterestEarnigs,
      [name]: value,
    });
  };

  const searchMyinterestEarning = () => {
    const response = getMyinterestEarningSearch(myinterestEarnigs);
    response.then((data) => {
      if (data.request.status == 200) {
        setmyinterestEarnigs({
          ...myinterestEarnigs,
          apiData: data.data,
          totalEarnigAmount: data.data.totalInterestEarned,
          loading: false,
          hasdata: data.data.listOfInterestDetails.length == 0 ? false : true,
        });
      }
    });
  };

  useEffect(() => {
    const isvalidValues =
      myinterestEarnigs.searchStartdate != null &&
      myinterestEarnigs.searchEndDate != null &&
      myinterestEarnigs.sortbased != null;

    if (isvalidValues) {
      setmyinterestEarnigs({
        ...myinterestEarnigs,
        btnvalid: false,
      });
    }
    return () => {};
  }, [
    myinterestEarnigs.searchStartdate,
    myinterestEarnigs.searchEndDate,
    myinterestEarnigs.sortbased,
  ]);

  useEffect(() => {
    const response = getMyToatlInterestEarnings();
    response.then((data) => {
      if (data.request.status == 200) {
        setmyinterestEarnigs({
          ...myinterestEarnigs,
          apiData: data.data,
          totalEarnigAmount: data.data.totalInterestEarned,
          loading: false,
          hasdata: data.data.listOfInterestDetails.length == 0 ? false : true,
        });
      }
    });
    return () => {};
  }, []);

  const datasource = [];
  {
    myinterestEarnigs.apiData != ""
      ? myinterestEarnigs.apiData.listOfInterestDetails.map((data) => {
          datasource.push({
            key: Math.random(),
            DealName: data.dealName,
            InterestAmount: data.interestAmount,
            PaidDate: data.paidDate,
          });
        })
      : "";
  }

  const column = [
    {
      key: Math.random(),
      title: "Deal Name",
      dataIndex: "DealName",
      sorter: (a, b) => a.DealName.length - b.DealName.length,
    },
    {
      key: Math.random(),
      title: "Interest Amount",
      dataIndex: "InterestAmount",
      sorter: (a, b) => a.InterestAmount - b.InterestAmount,
    },
    {
      key: Math.random(),
      title: "Paid Date",
      dataIndex: "PaidDate",
      sorter: (a, b) => new Date(a.PaidDate) - new Date(b.PaidDate),
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
                  <h3 className="page-title">My Interest Info</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      My interest Earning
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="student-group-form">
              <div className="row">
                <div className="col-lg-3 col-md-6">
                  <div className="form-group">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Search by Start Date ..."
                      onChange={searchOnchange}
                      name="searchStartdate"
                    />
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="form-group">
                    <input
                      type="date"
                      className="form-control"
                      name="searchEndDate"
                      placeholder="Search by End Date..."
                      onChange={searchOnchange}
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="form-group">
                    <select
                      className="form-control"
                      name="sortbased"
                      onChange={searchOnchange}
                    >
                      ""
                      <option value="null">-- Sort Based On --</option>
                      <option value="PaidDate">Paid Date</option>
                      <option value="Amount">Amount</option>
                      <option value="DealName">Deal Name</option>
                    </select>
                  </div>
                </div>
                <div className="col-lg-2">
                  <div className="search-student-btn">
                    <button
                      type="btn"
                      className="btn btn-primary"
                      onClick={searchMyinterestEarning}
                      disabled={myinterestEarnigs.btnvalid}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <div className="card card-table">
                  <div className="card-body">
                    {/* Page Header */}
                    <div className="page-header">
                      <div className="row align-items-center">
                        <div className="col">
                          <h6 className="page-title">
                            Total Interest Earned :{" "}
                            {myinterestEarnigs.totalEarnigAmount}
                          </h6>
                        </div>
                      </div>
                    </div>
                    {/* /Page Header */}
                    <div className="table-responsive">
                      <Table
                        className="table table-stripped table-hover datatable"
                        pagination={{
                          total: datasource.length,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],

                          showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={column}
                        dataSource={myinterestEarnigs.hasdata ? datasource : []}
                        expandable={true}
                        loading={myinterestEarnigs.loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <Footer />
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default MyinterestEarning;
