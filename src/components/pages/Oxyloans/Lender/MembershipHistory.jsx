
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Table, DatePicker, Button, message } from "antd";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { onShowSizeChange } from "../../../Pagination";
import { getMembershiphistory, fetchFinancialEarnings } from "../../../HttpRequest/afterlogin";
import moment from "moment";

const { RangePicker } = DatePicker;

const MembershipHistory = () => {
  const [membershiphistory, setmembershiphistory] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
    isLoading: false,
  });
  const [dateRange, setDateRange] = useState([null, null]);

  const membershiphistoryPagination = (Pagination) => {
    setmembershiphistory({
      ...membershiphistory,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  useEffect(() => {
    if (!Array.isArray(dateRange)) {
      console.warn("dateRange is not an array:", dateRange);
      setmembershiphistory({
        ...membershiphistory,
        loading: false,
      });
      return;
    }

    const response = getMembershiphistory(
      membershiphistory.pageNo,
      membershiphistory.pageSize,
      dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : null,
      dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : null
    );
    response
      .then((data) => {
        if (data.request.status === 200) {
          setmembershiphistory({
            ...membershiphistory,
            apiData: data.data,
            loading: false,
            hasdata: data.data.count === 0 ? false : true,
          });
        } else {
          console.error("getMembershiphistory failed with status:", data.request.status, "Response:", data);
          setmembershiphistory({
            ...membershiphistory,
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.error("getMembershiphistory error:", error, "Response:", error.response);
        setmembershiphistory({
          ...membershiphistory,
          loading: false,
        });
      });
    return () => {};
  }, [membershiphistory.pageNo, membershiphistory.pageSize, dateRange]);

  const handleSearch = async () => {
    if (!Array.isArray(dateRange) || !dateRange[0] || !dateRange[1]) {
      console.warn("Invalid dateRange for fetchFinancialEarnings:", dateRange);
      message.warning("Please select a valid date range.");
      return;
    }

    // Validate dates are not in the future
    const today = moment();
    if (dateRange[0].isAfter(today) || dateRange[1].isAfter(today)) {
      console.warn("Selected dates are in the future:", dateRange);
      message.warning("Please select dates up to today.");
      return;
    }

    // Validate endDate is not before startDate
    if (dateRange[1].isBefore(dateRange[0])) {
      console.warn("endDate is before startDate:", dateRange);
      message.warning("End date cannot be before start date.");
      return;
    }

    setmembershiphistory({
      ...membershiphistory,
      isLoading: true,
    });

    const payload = {
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD"),
    };

    console.log("Sending to fetchFinancialEarnings:", {
      pageNo: membershiphistory.pageNo,
      pageSize: membershiphistory.pageSize,
      payload,
    });

    try {
      const response = await fetchFinancialEarnings(
        payload
      );
      if (response != null) {
        const url = response.data;
        if (response.request.status === 200 && url) {
          // Trigger PDF download
          const link = document.createElement("a");
          link.href = url;
          link.download = "FinancialEarningsSummary.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setmembershiphistory({
            ...membershiphistory,
            apiData: response.data,
            hasdata: response.data.count === 0 ? false : true,
            isLoading: false,
          });
          message.success("PDF downloaded successfully!");
        } else {
          console.error("fetchFinancialEarnings failed with status:", response.request.status, "Response:", response);
          setmembershiphistory({
            ...membershiphistory,
            isLoading: false,
          });
          message.success("No data found for Summary PDF.");
        }
      } else {
        console.error("fetchFinancialEarnings response is null");
        setmembershiphistory({
          ...membershiphistory,
          isLoading: false,
        });
        message.success("No data found for Summary PDF.");
      }
    } catch (error) {
      console.error("Error fetching financial earnings:", error, "Response:", error.response);
      setmembershiphistory({
        ...membershiphistory,
        isLoading: false,
      });
      message.error("An error occurred while fetching the Summary PDF.");
    }
  };

  const handleDateRangeChange = (dates) => {
    console.log("Date range changed:", dates);
    setDateRange(dates || [null, null]);
    setmembershiphistory({
      ...membershiphistory,
      pageNo: 1,
      loading: true,
    });
  };

  const datasource = useMemo(() => {
    if (membershiphistory.apiData === "" || !membershiphistory.apiData.listOfTransactions) {
      return [];
    }
    return membershiphistory.apiData.listOfTransactions.map((data) => ({
      key: data.transactionNumber || Math.random(),
      PaymentDate: data.paymentDate,
      TransactionNumber: data.transactionNumber,
      Amount: data.amount ? data.amount.toLocaleString("en-IN") : null,
      PaidThrough: data.paidType,
      DealId: data.dealId,
    }));
  }, [membershiphistory.apiData]);

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
      sorter: (a, b) => a.DealId - b.DealId,
    },
    {
      title: "Paid Through",
      dataIndex: "PaidThrough",
      sorter: (a, b) => a.PaidThrough.length - b.PaidThrough.length,
    },
  ];

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid">
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

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="mb-3 d-flex align-items-center">
                    <RangePicker
                      onChange={handleDateRangeChange}
                      format="YYYY-MM-DD"
                      style={{ width: "300px", marginRight: "10px" }}
                      placeholder={["Start Date", "End Date"]}
                      disabledDate={(current) => current && current > moment().endOf("day")}
                    />
                    <Button
                      type="primary"
                      onClick={handleSearch}
                      disabled={!Array.isArray(dateRange) || !dateRange[0] || !dateRange[1]}
                      loading={membershiphistory.isLoading}
                    >
                      Search
                    </Button>
                  </div>
                  <div>
                    <Table
                      className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                      pagination={{
                        total: membershiphistory.apiData.count || 0,
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
    </div>
  );
};

export default MembershipHistory;