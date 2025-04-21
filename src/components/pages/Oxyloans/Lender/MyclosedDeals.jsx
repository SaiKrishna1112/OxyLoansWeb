import React from "react";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { useState, useEffect } from "react";
import { Table } from "antd";
import { Link } from "react-router-dom";
import { onShowSizeChange, itemRender } from "../../../Pagination";
import { handelapi, myclosedDealsInfo } from "../../../HttpRequest/afterlogin";
import Modaldata from "./Modaldata";
import {  paypendingprocessingAmount } from "../../Base UI Elements/SweetAlert";

import { downloadClosedLoanStatementAlert } from "../../Base UI Elements/SweetAlert";

const MyclosedDeals = () => {
  const [myclosedDeals, setmyclosedDeals] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
    statement: "",
    model: false,
    modelStatement: false,
  });

  const myclosedDealsPagination = (Pagination) => {
    setmyclosedDeals({
      ...myclosedDeals,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  const handelSatement = async (dealId, dealName) => {
    const response = handelapi(dealId, dealName);
    response.then((data) => {
      setmyclosedDeals({
        ...myclosedDeals,
        statement: data.data,
        modelStatement: true,
      });
    });
  };
  useEffect(() => {
    const response = myclosedDealsInfo(
      myclosedDeals.pageNo,
      myclosedDeals.pageSize
    );

    setmyclosedDeals({
      ...myclosedDeals,
      loading: true,
    });

    response.then((data) => {
      if (data.request.status == 200) {
        setmyclosedDeals({
          ...myclosedDeals,
          apiData: data.data,
          loading: false,
          hasdata:
            data.data.lenderReturnsResponseDto.length == 0 ? false : true,
        });
      }
    });
    return () => { };
  }, [myclosedDeals.pageNo, myclosedDeals.pageSize]);

  const datasource = [];
  {
    myclosedDeals.apiData != ""
      ? myclosedDeals.apiData.lenderReturnsResponseDto.map((data) => {
        datasource.push({
          key: Math.random(),
          DealId: data.dealId,
          DealName: data.dealName,
          Participated: "INR " + data.totalPaticipation,
          ProcessingFee: (
            data.feeStatus == "COMPLETED" ? (
              <button
                type="button"
                className="btn w-40 btn-primary btn-xs"
                disabled
                // onClick={() => handleStatement(data.dealId, data.dealName)}
              >
                {data.feeStatus}
              </button>
            ) :
              <>
              <div className="col-auto">
                <span
                  type="button"
                  className="badge bg-danger"
                  onClick={() =>
                    paypendingprocessingAmount(
                      data.dealId,
                      data.processingFee
                    )
                  }
                >
                  <i className="fa fa-money"> </i> Fee Pending
                </span>
              </div>
                {/* <span>{data.processingFee}</span> */}
                </>

          ),

          ROI: data.rateOfInterest + " % PM",
          Dealstart: data.fundsAcceptanceStartDate,
          DealClosed: data.dealClosedToLender,
          lenderReturnType: data.lenderReturnType,
          Statement: (
            <button
              type="submit"
              className="btn  w-70 btn-primary btn-xs"
              onClick={() => handelSatement(data.dealId, data.dealName)}
            >
              <i className="fa-regular fa-eye"></i> Statement
            </button>
          ),
        });
      })
      : "";
  }

  const hidingStatement = () => {
    setmyclosedDeals({
      ...myclosedDeals,
      modelStatement: false,
    });
  };

  const column = [

    {
      title: "Deal Id",
      dataIndex: "DealId",
      sorter: (a, b) => a.DealName.length - b.DealName.length,
    },
    {
      title: "Deal Name",
      dataIndex: "DealName",
      sorter: (a, b) => a.DealName.length - b.DealName.length,
    },
    {
      title: "Participated",
      dataIndex: "Participated",
      sorter: (a, b) => a.Participated.length - b.Participated.length,
    },
    {
      title: "Processing Fee",
      dataIndex: "ProcessingFee",
      // sorter: (a, b) => a.Participated.length - b.Participated.length,
    },
    {
      title: "ROI",
      dataIndex: "ROI",
      sorter: (a, b) => a.ROI.length - b.ROI.length,
    },

    {
      title: "Start Date",
      dataIndex: "Dealstart",
      sorter: (a, b) => new Date(a.Dealstart) - new Date(b.Dealstart),
    },
    {
      title: "Closed Date",
      dataIndex: "DealClosed",
      sorter: (a, b) => new Date(a.DealClosed) - new Date(b.DealClosed),
    },
    {
      title: "Payout Type",
      dataIndex: "lenderReturnType",
      sorter: (a, b) => new Date(a.DealClosed) - new Date(b.DealClosed),
    },
    {
      title: "Statement",
      dataIndex: "Statement",
    },
  ];
  return (
    <div>
      <>
        <div className="main-wrapper">
          {/* Header */}
          <Header />
          {/* Sidebar */}
          <SideBar />

          <div className="page-wrapper">
            <div className="content container-fluid">
              {/* Page Header */}
              <div className="page-header">
                <div className="row align-items-center">
                  <div className="col">
                    <h3 className="page-title">Closed deals</h3>
                    <ul className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link to="/dashboard">Dashboard</Link>
                      </li>
                      <li className="breadcrumb-item active">Closed deals</li>
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
                      <div className="page-header">
                        <div className="row align-items-center">
                          <div className="col"></div>
                          <div className="col-auto text-end float-end ms-auto download-grp">
                            <Link
                              to="#"
                              className="btn btn-outline-primary me-2"
                              onClick={() => {
                                downloadClosedLoanStatementAlert("CLOSED");
                              }}
                            >
                              <i className="fas fa-download" /> {""}
                              Download
                            </Link>

                            {myclosedDeals.modelStatement && (
                              <>
                                <Modaldata
                                  data={myclosedDeals.statement}
                                  open={myclosedDeals.modelStatement}
                                  hidingStatement={hidingStatement}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* /Page Header */}
                      <div className="table-responsive">
                        <Table
                          className="table border-0 star-student table-center mb-0"
                          pagination={{
                            total: myclosedDeals.apiData.countValue,
                            defaultPageSize: myclosedDeals.defaultPageSize,
                            showTotal: (total, range) =>
                              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                            showSizeChanger: true,
                            onShowSizeChange: onShowSizeChange,
                            itemRender: itemRender,
                            position: ["topRight"],
                          }}
                          columns={column}
                          dataSource={myclosedDeals.hasdata ? datasource : []}
                          expandable={true}
                          loading={myclosedDeals.loading}
                          onChange={myclosedDealsPagination}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Main Wrapper */}
      </>
    </div>
  );
};

export default MyclosedDeals;
