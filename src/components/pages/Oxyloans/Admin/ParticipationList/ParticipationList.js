import React, { useState, useEffect } from "react";
import { Table, message, Select } from "antd";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { ParticipationListApi } from "../../../../HttpRequest/admin";

const { Option } = Select;

const ParticipationList = () => {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("ACTIVE");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchParticipationDetails = async (pageNo = 1, pageSize = 10, statusValue = status) => {
    setLoading(true);
    try {
      const response = await ParticipationListApi(pageNo, pageSize, statusValue);
      const data = response?.data?.offlineReadData || [];
      const totalCount = response?.data?.count || 0; 

      setParticipations(data);
      setPagination({
        current: pageNo,
        pageSize,
        total: totalCount,
      });
    } catch (error) {
      console.error("API Error:", error);
      message.error("Failed to fetch participation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipationDetails(1, pagination.pageSize, status); 
  }, [status]);

  const handleTableChange = (pagination) => {
    fetchParticipationDetails(pagination.current, pagination.pageSize, status);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPagination({ ...pagination, current: 1 }); 
  };

  const columns = [
    { title: "User ID", dataIndex: "userId", key: "userId" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Participated Amount",
      dataIndex: "participatedAmount",
      key: "participatedAmount",
      render: (val) => (val ? `₹ ${val.toLocaleString("en-IN")}` : "—"),
    },
    {
      title: "Returned Principal",
      dataIndex: "returnedPrincipalAmount",
      key: "returnedPrincipalAmount",
      render: (val) => (val ? `₹ ${val.toLocaleString("en-IN")}` : "—"),
    },
    { title: "Pay Out Type", dataIndex: "payOutType", key: "payOutType" },
    { title: "Amount Type", dataIndex: "amountType", key: "amountType" },
    {
      title: "Participation Status",
      dataIndex: "paricipatioStatus",
      key: "paricipatioStatus",
      render: (val) => (
        <span style={{ color: val === "ACTIVE" ? "green" : "red" }}>{val}</span>
      ),
    },
    { title: "Participation Type", dataIndex: "participationType", key: "participationType" },
  ];
     
  return (
    <div className="main-wrapper">
      <OxyloansAdminSidebar />
      <OxyloansAdminHeader />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div style={{ padding: 12 }}>
            <h2>Offline Participation List</h2>

            <div style={{ marginBottom: 16 }}>
              <Select
                defaultValue={status}
                style={{ width: 200 }}
                onChange={handleStatusChange}
              >
                <Option value="ACTIVE">Active Participations</Option>
                <Option value="CLOSED">Closed Participations</Option>
              </Select>
            </div>

            <Table
            columns={columns}
            dataSource={participations}
            loading={loading}
            rowKey="userId"
               bordered
             pagination={{
              current: pagination.current,
             pageSize: pagination.pageSize,
             total: pagination.total,
              showSizeChanger: false,
  }}
  onChange={(pagination) => {
    fetchParticipationDetails(pagination.current, pagination.pageSize, status);
  }}
/>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipationList;
