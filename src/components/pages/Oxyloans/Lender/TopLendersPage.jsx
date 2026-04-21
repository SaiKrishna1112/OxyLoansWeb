import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spin, Button } from "antd";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import { useNavigate } from "react-router-dom";
import { API_USER_URL } from "../../../../config";

export default function TopLendersInfo() {
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLenders = async () => {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("Access token missing");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_USER_URL}getTopLendersInfo`,
          { headers: { accessToken } }
        );

        console.log("TopLenders API response:", response.data);

        // Ensure response.data is an array (adjust if your API wraps it)
        const arr = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        const topFive = (arr || []).slice(0, 5);

        setLenders(topFive);
        try {
          sessionStorage.setItem("topLenders", JSON.stringify(topFive));
          console.log("Saved topLenders to sessionStorage:", topFive);
        } catch (err) {
          console.error("Failed to save topLenders to sessionStorage:", err);
        }

      } catch (error) {
        console.error("CORS or API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLenders();
  }, []);

  const columnConfig = [
    {
      title: "Lender ID",
      key: "lenderId",
      dataIndex: "lenderId",
      render: (text) => `LR${text ?? ""}`,
    },
    // {
    //   title: "Total Cumulative Participation Amount",
    //   key: "totalParticipationAmount",
    //   dataIndex: "totalParticipationAmount",
    //   isCurrency: true,
    // },
    { title: "City", key: "city", dataIndex: "city" },
    { title: "State", key: "state", dataIndex: "state" },
  ];

  const columns = columnConfig.map((col) => ({
    title: col.title,
    key: col.key,
    dataIndex: col.dataIndex,
    render: col.isCurrency
      ? (amount) => `₹ ${amount?.toLocaleString("en-IN") || "-"}`
      : col.render,
  }));

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />

        <div className="page-wrapper" style={{ paddingTop: 80, paddingLeft: 20, paddingRight: 20 }}>
          <div className="content container-fluid" style={{ padding: 12, minHeight: "100vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3>Top Lenders of Oxyloans </h3>
              <Button type="primary" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div> 
            {loading ? (
              <Spin size="small" tip="Loading lenders..." />
            ) : (
              <Table
                dataSource={lenders}
                columns={columns}
                rowKey="lenderId"
                bordered
                pagination={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

