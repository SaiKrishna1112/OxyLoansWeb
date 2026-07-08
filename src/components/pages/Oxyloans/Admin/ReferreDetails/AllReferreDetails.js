
import React, { useEffect, useState } from "react";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import { Table, Button, Spin } from "antd";
import axios from "axios";
import { API_USER_URL } from "../../../../../config";

export default function AllRefereeDetails() {
  const [refereeData, setRefereeData] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const accessToken = sessionStorage.getItem("accessToken");

  useEffect(() => {
    fetchRefereeDetails();
  }, []);

  const fetchRefereeDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_USER_URL}getAllRefereeDetails/INVITED`,
        {
          headers: {
            accessToken: accessToken,
          },
        }
      );

      if (response.data) {
        setRefereeData(response.data.lenderReferenceSheetResponse || []);
        setDownloadUrl(response.data.downloadUrl || null);
      }
    } catch (error) {
      console.error("Error fetching referee details:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "index",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Referee ID",
      dataIndex: "refereeId",
      key: "refereeId",
      render: (text) => (text ? `LR${text}` : "-"),
    },
    {
      title: "Referee Name",
      dataIndex: "refereeName",
      key: "refereeName",
    },
    {
      title: "Referred On",
      dataIndex: "referredOn",
      key: "referredOn",
      align: "center",
    },

    {
      title: "Referrer ID",
      dataIndex: "referrerId",
      key: "referrerId",
      align: "center",
      render: (text) => (text ? `LR${text}` : "-"),
    },
    {
      title: "Referrer Name",
      dataIndex: "referrerName",
      key: "referrerName",
    },
    {
      title: "Total Participated",
      dataIndex: "refreeParticipatedTotal",
      key: "totalParticipated",
      render: (text) =>
        text ? `₹ ${Number(text).toLocaleString("en-IN")}` : "-",
    },
  ];

  // Compute paginated data
  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = refereeData.slice(startIndex, endIndex);

  const handleTableChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize,
    });
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div
            className="page-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 className="page-title">All Referee Details</h3>

            {downloadUrl && (
              <Button type="primary" href={downloadUrl} target="_blank">
                Download Sheet
              </Button>
            )}
          </div>

          <div className="card mt-4">
            <div className="card-body">
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin size="small" />
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={paginatedData}
                  rowKey={(record) => record.refereeId || record.key}
                  bordered
                  scroll={{ x: "max-content" }}
                  locale={{ emptyText: "No Data Found" }}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: refereeData.length,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 30, 50,70, 100],
                    onChange: handleTableChange,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
