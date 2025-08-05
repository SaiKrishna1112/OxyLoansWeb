import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Spin,
  message,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";

const { Title } = Typography;

const API_URL =
  "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/user/userParicipationList";

const UserParticipationList = () => {
  const [searchName, setSearchName] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);


  const fetchParticipation = async (nameParam = searchName) => {
    const accessToken =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");

    if (!accessToken) {
      message.error("accessToken not found – please log in again.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        API_URL,                    
        { name: nameParam },       
        { headers: { accessToken } } 
      );

      const list = data?.offlineReadData ?? [];
      if (list.length === 0) {
        message.info("No participation records found.");
        setRows([]);
      } else {
        setRows(list);
      }
    } catch (err) {
      console.error("API error:", err);
      message.error("Failed to load participation list.");
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchParticipation("");
    
  }, []);

 
  const columns = [
    { title: "User ID", dataIndex: "userId", key: "userId" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Participated Amount",
      dataIndex: "participatedAmount",
      key: "participatedAmount",
      render: (v) => (v ? `₹ ${Number(v).toLocaleString("en-IN")}` : "—"),
    },
    {
      title: "Participation Status",
      dataIndex: "paricipatioStatus",
      key: "paricipatioStatus",
      render: (v) => (
        <span style={{ color: v === "ACTIVE" ? "green" : "red" }}>
          {v || "N/A"}
        </span>
      ),
    },
    {
      title: "Participation Type",
      dataIndex: "participationType",
      key: "participationType",
    },
    { title: "Payout Type", dataIndex: "payOutType", key: "payOutType" },
    { title: "Amount Type", dataIndex: "amountType", key: "amountType" },
    { title: "Interest Date", dataIndex: "interestDate", key: "interestDate" },
    {
      title: "Received Date",
      dataIndex: "receivedDate",
      key: "receivedDate",
      render: (v) => (v ? v.split("T")[0] : "—"),
    },
  ];

  
  return (
    <div className="page-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="content container-fluid">
        <div className="page-header">
          <Title level={3}>User Participation List</Title>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter user name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value.toUpperCase())}
            allowClear
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchParticipation(searchName.trim())}
          >
            Search
          </Button>
        </Space>

        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            columns={columns}
            dataSource={rows}
            rowKey={(r) => r.userId}
            bordered
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
    </div>
  );
};

export default UserParticipationList;
