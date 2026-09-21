import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Table, Card, Typography, Input, Button, Tag, message } from "antd";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { getLenderListNearByRediusForBorrower } from "../../../../HttpRequest/admin";

const { Title } = Typography;

const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const getDistanceTagColor = (distance) => {
  if (distance == null || !Number.isFinite(Number(distance))) return "default";
  if (Number(distance) <= 5) return "success";
  if (Number(distance) <= 25) return "warning";
  return "error";
};

const BorrowerNearbyLendersAdmin = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const borrowerName = location.state?.borrowerName || "Borrower";
  const mobileNumber = location.state?.mobileNumber || "";

  const [loading, setLoading] = useState(true);
  const [lenders, setLenders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchLenders = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await getLenderListNearByRediusForBorrower(userId, 1, 10000);

      if (response?.status === 200) {
        const pageData = Array.isArray(response?.data) ? response.data : [];
        const borrowerLat = Number(pageData[0]?.borrowerLat);
        const borrowerLng = Number(pageData[0]?.borrowerLng);
        const hasBorrowerCoords =
          Number.isFinite(borrowerLat) && Number.isFinite(borrowerLng);

        const uniqueLenders = pageData
          .filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (candidate) =>
                  String(candidate?.lenderId) === String(item?.lenderId)
              )
          )
          .map((item) => {
            const lenderLat = Number(item?.lenderLat);
            const lenderLng = Number(item?.lenderLng);
            let distance = item?.distance;

            if (
              (distance == null || !Number.isFinite(Number(distance))) &&
              hasBorrowerCoords &&
              Number.isFinite(lenderLat) &&
              Number.isFinite(lenderLng)
            ) {
              distance = calculateDistanceKm(
                borrowerLat,
                borrowerLng,
                lenderLat,
                lenderLng
              );
            }

            return {
              lenderId: item?.lenderId,
              lenderName: item?.lenderName?.trim() || "N/A",
              distance:
                distance != null && Number.isFinite(Number(distance))
                  ? Number(distance)
                  : null,
            };
          });
        setLenders(uniqueLenders);
      } else {
        message.error(
          response?.response?.data?.errorMessage ||
            response?.response?.data?.message ||
            "Failed to load nearby lenders"
        );
        setLenders([]);
      }
    } catch {
      message.error("Failed to load nearby lenders. Please try again.");
      setLenders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLenders();
  }, [userId]);

  const filteredLenders = useMemo(() => {
    let list = [...lenders];

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter((item) => {
        const name = item?.lenderName ? String(item.lenderName).toLowerCase() : "";
        const id = item?.lenderId ? String(item.lenderId).toLowerCase() : "";
        return name.includes(query) || id.includes(query);
      });
    }

    return list.sort(
      (a, b) => Number(a?.distance ?? Infinity) - Number(b?.distance ?? Infinity)
    );
  }, [lenders, searchQuery]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 70,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Lender Info",
      key: "lenderInfo",
      render: (_, record) => (
        <div>
          <div>
            <strong>LR{record.lenderId || "N/A"}</strong>
          </div>
          <div>
            <strong>Name:</strong> {record.lenderName}
          </div>
        </div>
      ),
    },
    {
      title: "Distance",
      key: "distance",
      width: 160,
      render: (_, record) => (
        <div>
          {record.distance != null && Number.isFinite(Number(record.distance)) ? (
            <Tag color={getDistanceTagColor(record.distance)}>
              {Number(record.distance).toFixed(2)} km
            </Tag>
          ) : (
            <Tag>N/A</Tag>
          )}
        </div>
      ),
      sorter: (a, b) => (Number(a?.distance) || 0) - (Number(b?.distance) || 0),
    },
  ];

  return (
    <div className="main-wrapper">
      <OxyloansAdminSidebar />
      <OxyloansAdminHeader />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <Card>
            <Title level={4}>Borrower Nearby Lenders</Title>

            <div
              className="mb-4 p-3"
              style={{
                background: "#f9f9f9",
                borderRadius: 6,
                border: "1px solid #f0f0f0",
              }}
            >
              <div>
                <strong>Borrower:</strong> {borrowerName}
              </div>
              <div>
                <strong>User ID:</strong> {userId}
              </div>
              {mobileNumber && (
                <div>
                  <strong>Mob:</strong> {mobileNumber}
                </div>
              )}
              <div>
                <strong>Total Nearby Lenders:</strong> {filteredLenders.length}
              </div>
            </div>

            <div className="mb-4 d-flex align-items-center flex-wrap w-100 gap-2">
              <Input
                placeholder="Search by lender name or ID"
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                style={{ width: 260 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                Search
              </Button>
              <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                className="ms-auto"
                onClick={() => navigate("/borrowerLoanApplications")}
              >
                Back to Applications
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={filteredLenders}
              rowKey={(record, index) =>
                `${record?.lenderId || "lender"}-${index}`
              }
              loading={loading}
              bordered
              scroll={{ x: 800 }}
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredLenders.length,
                onChange: (page) => setCurrentPage(page),
                showLessItems: true,
                showSizeChanger: false,
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BorrowerNearbyLendersAdmin;
