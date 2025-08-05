import React, { useState, useEffect } from "react";
import { DatePicker, Button, Table, message } from "antd";
import dayjs from "dayjs";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { MonthlyInterestLendersapi } from "../../../../HttpRequest/admin";

const MonthlyInterestLenders = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const accessToken = sessionStorage.getItem("accessToken");
  const columns = [
    { title: "User ID", dataIndex: "userId", key: "userId" },

    { title: "User Name", dataIndex:"userName", key:"username"},

    // {title:"Mobile Number", dataIndex:"mobileNumber", key:"mobileNumber"},  
      {
      title: "Participated Amount",
      dataIndex: "participatedAmount",
      key: "participatedAmount",
      render: (value) => value.toLocaleString("en-IN"),
    },
    {
      title: "Current Amount",
      dataIndex: "currentAmount",
      key: "currentAmount",
      render: (value) => value.toLocaleString("en-IN"),
    },
    { title: "ROI (%)", dataIndex: "roi", key: "roi" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <span style={{ color: text === "INITIATED" ? "orange" : "green" }}>
          {text}
        </span>
      ),
    },
  
   {
    title: "Actual Date",
    dataIndex: "actualDate",
    key: "actualDate",
  
}
  ];

  const fetchLenders = async () => {
    if (!selectedDate) return;

    const month = selectedDate.format("MMMM"); 
    const year = selectedDate.format("YYYY");  
    const startDate = selectedDate.format("D"); 

    setLoading(true);
    try {
      const response = await MonthlyInterestLendersapi(month, year, startDate);
      setLenders(response?.data || []);
    } catch (error) {
      console.error("Error fetching interest data:", error);
      message.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLenders();
  }, []);

  return (
    <div className="main-wrapper">
      <OxyloansAdminSidebar />
      <OxyloansAdminHeader />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div style={{ padding: 12 }}>
            <h2>Monthly Interest Info</h2>

            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              format="DD-MM-YYYY"
              style={{ marginRight: 16 }}
            />

            <Button type="primary" onClick={fetchLenders}>
              Fetch Data
            </Button>

            <div style={{ marginTop: 24 }}>
              <Table
                columns={columns}
                dataSource={lenders}
                loading={loading}
                rowKey="userId"
                bordered
                pagination={{ pageSize: 10 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyInterestLenders;
