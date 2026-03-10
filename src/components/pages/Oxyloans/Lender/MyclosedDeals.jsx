import React, { useState, useEffect } from "react";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Table } from "antd";
import { Link } from "react-router-dom";
import {
  onShowSizeChange,
  itemRender,
} from "../../../Pagination";
import {
  handelapi,
  myclosedDealsInfo,
  handelsubmitcanceldatafilter,
} from "../../../HttpRequest/afterlogin";
import Modaldata from "./Modaldata";
import {
  paypendingprocessingAmount,
  downloadClosedLoanStatementAlert,
} from "../../Base UI Elements/SweetAlert";

const MyclosedDeals = () => {
  const [myclosedDeals, setmyclosedDeals] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
    statement: "",
    modelStatement: false,
  });

  const [filterData, setFilterData] = useState([]); // 🔹 stores filtered data
  const [searchInput, setSearchInput] = useState("");
  const [isFiltering, setIsFiltering] = useState(false); // 🔹 helps toggle between full data and filtered data

  // Pagination handler
  const myclosedDealsPagination = (Pagination) => {
    setmyclosedDeals({
      ...myclosedDeals,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  // Fetch closed deals
  useEffect(() => {
    if (isFiltering) return; // skip auto-fetch when filtering active

    const fetchDeals = async () => {
      setmyclosedDeals((prev) => ({ ...prev, loading: true }));
      try {
        const response = await myclosedDealsInfo(
          myclosedDeals.pageNo,
          myclosedDeals.pageSize
        );
        if (response.request.status === 200) {
          setmyclosedDeals((prev) => ({
            ...prev,
            apiData: response.data,
            loading: false,
            hasdata:
              response.data.lenderReturnsResponseDto.length > 0,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDeals();
  }, [myclosedDeals.pageNo, myclosedDeals.pageSize, isFiltering]);

  // Handle statement view
  const handelSatement = async (dealId, dealName) => {
     setmyclosedDeals((prev) => ({
        ...prev, 
        // statement: response.data,
        modelStatement: true,
      }));
    try {
      const response = await handelapi(dealId, dealName);
      setmyclosedDeals((prev) => ({
        ...prev, 
        statement: response.data,
        // modelStatement: false,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 Handle input change 
  const handleChange = (event) => {
    setSearchInput(event.target.value);
  };

  // 🔍 Handle filter submit
  const handleSubmitFilterDeal = async () => {
    if (!searchInput.trim()) {
      setIsFiltering(false); // if empty, show total data again
      return;
    }

    try {
      setmyclosedDeals((prev) => ({ ...prev, loading: true }));
      const response = await handelsubmitcanceldatafilter(searchInput);
      setFilterData(response.data || []);
      setIsFiltering(true);
      setmyclosedDeals((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.log(error);
      setmyclosedDeals((prev) => ({ ...prev, loading: false }));
    }
  };

  // Close modal
  const hidingStatement = () => {
    setmyclosedDeals((prev) => ({
      ...prev,
      modelStatement: false,
    }));
  };

  // 🧮 Convert API data into AntD datasource
  const getTableData = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return [];
    return dataArray.map((data) => ({
      key: data.dealId,
      DealId: data.dealId,
      DealName: data.dealName,
      Participated: "INR " + data.totalPaticipation,
      ProcessingFee:
        data.feeStatus === "COMPLETED" ? (
          <button className="btn w-40 btn-primary btn-xs" disabled>
            {data.feeStatus}
          </button>
        ) : (
          <span
            type="button"
            className="badge bg-danger"
            onClick={() =>
              paypendingprocessingAmount(data.dealId, data.processingFee)
            }
          >
            <i className="fa fa-money"></i> Fee Pending
          </span>
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
    }));
  };

  // Decide which data to show: filtered or all
  const displayedData = isFiltering
    ? getTableData(filterData)
    : getTableData(myclosedDeals.apiData?.lenderReturnsResponseDto || []);

  const columns = [
    { title: "Deal Id", dataIndex: "DealId" },
    { title: "Deal Name", dataIndex: "DealName" },
    { title: "Participated", dataIndex: "Participated" },
    { title: "Processing Fee", dataIndex: "ProcessingFee" },
    { title: "ROI", dataIndex: "ROI" },
    { title: "Start Date", dataIndex: "Dealstart" },
    { title: "Closed Date", dataIndex: "DealClosed" },
    { title: "Payout Type", dataIndex: "lenderReturnType" },
    { title: "Statement", dataIndex: "Statement" },
  ];

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <h3 className="page-title">Closed Deals</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active">Closed deals</li>
            </ul>
          </div>

          {/* 🔍 Search Box */}
          <div className="col-md-3">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Deal Name..."
                value={searchInput}
                onChange={handleChange}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleSubmitFilterDeal}
              >
                Search
              </button>
            </div>
          </div>

          <div className="card card-table">
            <div className="card-body">
              <div className="text-end mb-2">
                <Link
                  to="#"
                  className="btn btn-outline-primary me-2"
                  onClick={() =>
                    downloadClosedLoanStatementAlert("CLOSED")
                  }
                >
                  <i className="fas fa-download"></i> Download
                </Link>
              </div>

              {myclosedDeals.modelStatement && (
                <Modaldata
                  data={myclosedDeals.statement}
                  open={myclosedDeals.modelStatement}
                  hidingStatement={hidingStatement}
                  loading={myclosedDeals.loading}
                />
              )}

              <div className="table-responsive">
                <Table
                  className="table border-0 star-student table-center mb-0"
                  pagination={{
                    total: myclosedDeals.apiData?.countValue,
                    defaultPageSize: myclosedDeals.defaultPageSize,
                    showTotal: (total, range) =>
                      `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    showSizeChanger: true,
                    onShowSizeChange: onShowSizeChange,
                    itemRender: itemRender,
                    position: ["topRight"],
                  }}
                  columns={columns}
                  dataSource={displayedData}
                  loading={myclosedDeals.loading}
                  onChange={myclosedDealsPagination}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyclosedDeals;
