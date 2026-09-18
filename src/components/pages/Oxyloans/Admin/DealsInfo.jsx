import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_USER_URL } from "../../../../config";
import { Table, Spin } from "antd";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import { formatAmountWithCommas } from "../../../../utils/formatAmount";

export default function DealsInfo() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );

    const fetchDeals = async () => {
      const accessToken =
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("Access token missing");
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(
          `${API_USER_URL}WEB/notachieved-deals1`,
          { headers: { accessToken } },
        );
        setDeals(data || []);
      } catch (error) {
        console.error("Failed to fetch deals info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const formatCurrency = (val) =>
    val != null ? `₹ ${Number(val).toLocaleString("en-IN")}` : "-";

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalDealAmount = deals.reduce(
    (sum, d) => sum + (d.dealAmount ?? 0),
    0,
  );
  const totalParticipated = deals.reduce(
    (sum, d) => sum + (d.paticipatedAmount ?? 0),
    0,
  );
  const totalRemaining = deals.reduce(
    (sum, d) => sum + (d.remainingAmount ?? 0),
    0,
  );
  // ────────────────────────────────────────────────────────────────────────────

  const columns = [
    {
      title: "Deal ID",
      dataIndex: "dealId",
      key: "dealId",
    },
    {
      title: "Deal Name",
      dataIndex: "dealName",
      key: "dealName",
    },
    {
      title: "Deal Amount",
      dataIndex: "dealAmount",
      key: "dealAmount",
      render: formatCurrency,
    },
    {
      title: "Participated Amount",
      dataIndex: "paticipatedAmount",
      key: "paticipatedAmount",
      render: formatCurrency,
    },
    {
      title: "Remaining Amount",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      render: formatCurrency,
    },
  ];

  // ── Summary footer row ───────────────────────────────────────────────────
  const summaryRow = () => (
    <Table.Summary fixed>
      <Table.Summary.Row
        style={{ backgroundColor: "#fafafa", fontWeight: 700 }}
      >
        <Table.Summary.Cell index={0} colSpan={2}>
          Total
        </Table.Summary.Cell>
        <Table.Summary.Cell index={1} style={{ color: "#1677ff" }}>
          {formatCurrency(totalDealAmount)}
        </Table.Summary.Cell>
        <Table.Summary.Cell index={2} style={{ color: "#52c41a" }}>
          {formatCurrency(totalParticipated)}
        </Table.Summary.Cell>
        <Table.Summary.Cell index={3} style={{ color: "#fa541c" }}>
          {formatCurrency(totalRemaining)}
        </Table.Summary.Cell>
      </Table.Summary.Row>
    </Table.Summary>
  );
  // ────────────────────────────────────────────────────────────────────────────

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#0f172a",
                  }}
                >
                  <i className="fas fa-handshake" />
                  Active Long-Term Deals
                </h2>

                <p
                  className="text-sm"
                  style={{
                    marginTop: 6,
                    marginBottom: 0,
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Monitor currently active deals and
                  participation details.
                </p>
              </div>

              <span
                style={{
                  fontSize: 14,
                  color: "#555",
                  whiteSpace: "nowrap",
                  marginTop: 4,
                }}
              >
                {today}
              </span>
            </div>

            {loading ? (
              <Spin size="small" tip="Loading deals..." />
            ) : (
              <Table
                dataSource={deals}
                columns={columns}
                rowKey="dealId"
                bordered
                summary={summaryRow}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
