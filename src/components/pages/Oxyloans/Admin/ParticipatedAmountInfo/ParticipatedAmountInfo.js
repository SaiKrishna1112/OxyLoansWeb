import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Button,
  message,
  Spin,
  Table,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import { API_USER_URL } from "../../../../../config";

const { Title, Text } = Typography;

const API_URL = `${API_USER_URL}getParticipatedAmountInfo`;

const FIELD_MAP = [
  {
    key: "totalMonthlyParticipations",
    label: "Total Monthly Participations",
  },
  {
    key: "totalQuarterlyParticipations",
    label: "Total Quarterly Participations",
  },
  {
    key: "totalHalfYearlyParticipations",
    label: "Total Half‑Yearly Participations",
  },
  {
    key: "totalYearlyParticipations",
    label: "Total Yearly Participations",
  },
  {
    key: "totalCurrentParticipations",
    label: "Total Current Participations",
  },
];

export default function ParticipatedAmountInfo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInfo = async () => {
    const accessToken =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");

    if (!accessToken) {
      message.error("Access token not found – please log in again.");
      return;
    }

    setLoading(true);
    try {
      const { data: res } = await axios.get(API_URL, {
        headers: { accessToken },
      });
      setData(res);
    } catch (e) {
      console.error("GET error:", e);
      message.error("Failed to fetch participated‑amount info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const renderSummaryCards = (obj) => (
    <Row gutter={[16, 16]}>
      {FIELD_MAP.map(({ key, label }) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={key}>
          <Card>
            <Statistic
              title={label}
              value={obj[key]}
              precision={2}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  
  const renderSummaryTable = (arr) => {
    const columns = FIELD_MAP.map(({ key, label }) => ({
      title: label,
      dataIndex: key,
      key,
    }));
    return (
      <Table
        columns={columns}
        dataSource={arr}
        pagination={false}
        bordered
        rowKey={(r, i) => i}
      />
    );
  };


  return (
    <div className="page-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="content container-fluid">
        <div
          className="page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            <i className="fas fa-sack-dollar" style={{ marginRight: 8 }} />
            Participated Amount Info
          </Title>
          <Button icon={<ReloadOutlined />} onClick={fetchInfo} loading={loading}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <Spin size="large" />
        ) : !data ? (
          <Text>No data available.</Text>
        ) : Array.isArray(data) ? (
          renderSummaryTable(data) 
        ) : (
          <>
            {renderSummaryCards(data)}
            <div style={{ marginTop: 24 }}>{renderSummaryTable([data])}</div>
          </>
        )}
      </div>
    </div>
  );
}
