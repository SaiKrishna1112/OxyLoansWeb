import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spin } from "antd";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";

export default function TopLendersInfo() {
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
          "https://fintech.oxyloans.com/oxyloans/v1/user/getTopLendersInfo",
          {
            headers: {
              accessToken: accessToken,
              
            },
          }
        );

        setLenders(response.data || []);
      } catch (error) {
        console.error("CORS or API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLenders();
  }, []);

  
  const columnConfig = [
    { title: "Lender ID", key: "lenderId", dataIndex: "lenderId", render: (text) => `LR${text ?? ""}`,
},
    { title: "Name", key: "lenderName", dataIndex: "lenderName" },
    {
      title: "Participation Amount",
      key: "totalParticipationAmount",
      dataIndex: "totalParticipationAmount",
      isCurrency: true,
    },
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
      <OxyloansAdminSidebar />
      <div style={{ flex: 1 }}>
        <OxyloansAdminHeader />
        <div
          className="page-wrapper"
          style={{ paddingTop: 80, paddingLeft: 20, paddingRight: 20 }}
        >
          <div
            className="content container-fluid"
            style={{ padding: 12, minHeight: "100vh" }}
          >
            <h2 style={{ marginBottom: 16 }}>Top Lenders Info</h2>

            {loading ? (
              <Spin size="small" tip="Loading lenders..." />
            ) : (
              <Table
                dataSource={lenders}
                columns={columns}
                rowKey="lenderId"
                bordered
                pagination={{ pageSize: 10 }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
     

