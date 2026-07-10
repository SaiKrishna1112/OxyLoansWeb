

// import React, { useState, useMemo } from "react";
// import {
//   DatePicker,
//   Button,
//   Table,
//   message,
//   Tabs,
//   Modal,
//   Spin,
// } from "antd";
// import dayjs from "dayjs";
// import axios from "axios";
// import * as XLSX from "xlsx"; // kept in case of future client‑side export fallback
// import { saveAs } from "file-saver";
// import { InterestDetailsTableApi } from "../../../../HttpRequest/admin";
// import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
// import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";

// /* ------------------------------ constants ------------------------------ */
// const DOWNLOAD_URL =
//   "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/user/generateSdlotInterestFile";
// const DETAILS_URL =
//   "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/user/userInterestStatements";

// /* ---------------------------------------------------------------------- */
// const InterestDetailsTable = () => {
//   /* --------------------------- page‑level state -------------------------- */
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [loading, setLoading] = useState(false);
//   const [interestData, setInterestData] = useState([]);
//   const [activeTab, setActiveTab] = useState("CX");

//   /* ---------------------------- modal state ----------------------------- */
//   const [detailsVisible, setDetailsVisible] = useState(false);
//   const [detailsLoading, setDetailsLoading] = useState(false);
//   const [detailsData, setDetailsData] = useState([]);

//   /* ------------------------ auth token retrieval ------------------------ */
//   const authToken =
//     sessionStorage.getItem("accessToken") ||
//     localStorage.getItem("accessToken");

//   /* ------------------------ main table columns ------------------------- */
//   const columns = [
//     { title: "User ID", dataIndex: "userId", key: "userId" },
//     { title: "User Name", dataIndex: "userName", key: "userName" },
//     {
//       title: "Participated Amount",
//       dataIndex: "participatedAmount",
//       key: "participatedAmount",
//       render: (v) => `₹ ${v.toLocaleString("en-IN")}`,
//     },
//     {
//       title: "Current Amount",
//       dataIndex: "currentAmount",
//       key: "currentAmount",
//       render: (v) => `₹ ${v.toLocaleString("en-IN")}`,
//     },
//     { title: "ROI (%)", dataIndex: "roi", key: "roi" },
//     {
//       title: "Total Interest Amount",
//       dataIndex: "totalInterestAmount",
//       key: "totalInterestAmount",
//       render: (v) => `₹ ${v.toLocaleString("en-IN")}`,
//     },
//     { title: "Payout Type", dataIndex: "payOutType", key: "payOutType" },
//     { title: "Days", dataIndex: "days", key: "days" },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, row) => (
//         <Button type="link" onClick={() => handleViewDetails(row.userId)}>
//           View Details
//         </Button>
//       ),
//     },
//   ];

//   /* ------------------------ fetch main list API ------------------------ */
//   const fetchInterestDetails = async () => {
//     if (!authToken) {
//       message.error("No auth token found. Please log in again.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const formattedDate = selectedDate.format("DD/MM/YYYY");
//       const res = await InterestDetailsTableApi(formattedDate, "INITIATED");
//       setInterestData(res?.data ?? []);
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to fetch interest user details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- download XLSX from back‑end ----------------- */
//   const handleDownload = async (payOutType) => {
//     if (!authToken) {
//       message.error("No auth token found. Please log in again.");
//       return;
//     }

//     try {
//       const settlementDate = selectedDate.format("DD/MM/YYYY");

//       const { data: blob, headers } = await axios.post(
//         DOWNLOAD_URL,
//         { settlementDate, payOutType },
//         {
//           headers: { accessToken: authToken },
//           responseType: "blob", // expect binary XLSX file
//         }
//       );

//       /* ---------- DEV diagnostics ---------- */
//       console.log("Downloaded blob type:", blob.type);
//       console.log("Downloaded blob size:", blob.size);
//       if (blob.size === 0) {
//         message.warning(
//           "Downloaded file is empty – no data returned for the selected criteria."
//         );
//         return;
//       }

//       /* ---------- derive filename ---------- */
//       let filename = headers["content-disposition"]
//         ? /filename="?([^";]+)"?/i.exec(headers["content-disposition"])?.[1]
//         : null;
//       if (!filename) {
//         filename = `${payOutType}_${selectedDate.format("DD-MM-YYYY")}.xlsx`;
//       }

//       const fileBlob = new Blob([blob], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });

//       saveAs(fileBlob, filename);
//       message.success(`${payOutType} sheet downloaded successfully.`);
//     } catch (err) {
//       console.error("Download error:", err?.response || err);
//       const msg =
//         err?.response?.status === 401
//           ? "Unauthorized – please log in again."
//           : err?.response?.data?.message ||
//             "Failed to download XLSX. Please verify data availability.";
//       message.error(msg);
//     }
//   };

//   /* -------------------- user statements modal flow -------------------- */
//   const handleViewDetails = async (userId) => {
//     if (!authToken) {
//       message.error("No auth token found. Please log in again.");
//       return;
//     }
//     setDetailsVisible(true);
//     setDetailsLoading(true);
//     try {
//       const { data } = await axios.get(`${DETAILS_URL}/${userId}`, {
//         headers: { accessToken: authToken },
//       });
//       const list = Array.isArray(data) ? data : data?.interestStatements ?? [];
//       if (!list.length)
//         message.info("No statements found for this user for the chosen date.");
//       setDetailsData(list);
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to fetch user interest statements.");
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   /* ---------------------- build modal table columns -------------------- */
//   const detailsColumns = useMemo(() => {
//     if (!detailsData.length) return [];
//     return Object.keys(detailsData[0]).map((k) => ({
//       title: k
//         .replace(/([A-Z])/g, " $1")
//         .replace(/^./, (c) => c.toUpperCase()),
//       dataIndex: k,
//       key: k,
//     }));
//   }, [detailsData]);

//   /* ---------------------- separate data for tabs ----------------------- */
//   const cxData = interestData.filter((row) => row.payOutType === "CX");
//   const onlineData = interestData.filter((row) => row.payOutType === "ONLINE");

//   /* ------------------------------ render ------------------------------- */
//   return (
//     <div className="main-wrapper">
//       <OxyloansAdminSidebar />
//       <OxyloansAdminHeader />

//       <div className="page-wrapper">
//         <div className="content container-fluid" style={{ padding: 12 }}>
//           <h2>Users Interest Details</h2>

//           {/* ------------------- controls row ------------------- */}
//           <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
//             <DatePicker
//               value={selectedDate}
//               onChange={setSelectedDate}
//               format="DD/MM/YYYY"
//             />
//             <Button type="primary" onClick={fetchInterestDetails}>
//               Fetch Data
//             </Button>
//             <Button onClick={() => handleDownload("CX")}>Download CX Sheet</Button>
//             <Button onClick={() => handleDownload("ONLINE")}>
//               Download Online Sheet
//             </Button>
//           </div>

//           {/* ------------------------ data tabs ------------------------ */}
//           <Tabs
//             activeKey={activeTab}
//             onChange={setActiveTab}
//             items={[
//               {
//                 key: "CX",
//                 label: "CX Payout Users",
//                 children: (
//                   <Table
//                     columns={columns}
//                     dataSource={cxData}
//                     rowKey="userId"
//                     loading={loading}
//                     bordered
//                     pagination={{ pageSize: 10 }}
//                   />
   




import React, { useState } from "react";
import {
  DatePicker,
  Button,
  Table,
  message,
  Tabs,
  Modal,
  Spin,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { saveAs } from "file-saver";
import { InterestDetailsTableApi } from "../../../../HttpRequest/admin";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";


const DOWNLOAD_URL =
  "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/user/generateSdlotInterestFile";
const DETAILS_URL =
  "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/user/userInterestStatements";


const InterestDetailsTable = () => {
  const [selectedDate, setSelectedDate]   = useState(dayjs());
  const [loading, setLoading]             = useState(false);
  const [interestData, setInterestData]   = useState([]);
  const [activeTab, setActiveTab]         = useState("CX");

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData]       = useState([]);

  const authToken =
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken");

  const columns = [
    { title: "User ID", dataIndex: "userId", key: "userId" },
    { title: "User Name", dataIndex: "userName", key: "userName" },
    { title: "Mobile Number", dataIndedx:"mobileNumber", key:"mobileNumber",
      render: (text)=> text || "-",
    },
    {
      title: "Participated Amount",
      dataIndex: "participatedAmount",
      key: "participatedAmount",
      render: (v) => (v ? `₹ ${v.toLocaleString("en-IN")}` : "–"),
    },
    {
      title: "Current Amount",
      dataIndex: "currentAmount",
      key: "currentAmount",
      render: (v) => (v ? `₹ ${v.toLocaleString("en-IN")}` : "–"),
    },
    { title: "ROI (%)", dataIndex: "roi", key: "roi" },
    {
      title: "Total Interest Amount",
      dataIndex: "totalInterestAmount",
      key: "totalInterestAmount",
      render: (v) => (v ? `₹ ${v.toLocaleString("en-IN")}` : "–"),
    },
    { title: "Payout Type", dataIndex: "payOutType", key: "payOutType" },
    { title: "Days", dataIndex: "days", key: "days" },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <Button type="link" onClick={() => handleViewDetails(row.userId)}>
          View Details
        </Button>
      ),
    },
  ];

  
  const fetchInterestDetails = async () => {
    if (!authToken) {
      message.error("No auth token found. Please log in again.");
      return;
    }
    setLoading(true);
    try {
      const formattedDate = selectedDate.format("DD/MM/YYYY");
      const res = await InterestDetailsTableApi(formattedDate, "INITIATED");
      setInterestData(res?.data ?? []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch interest user details.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleDownload = async (payOutType) => {
    if (!authToken) {
      message.error("No auth token found. Please log in again.");
      return;
    }

    try {
      const filteredData = interestData.filter(
        (item) => item.payOutType === payOutType
      );

      const requestBody = {
        usersInterestsResponse: filteredData.map((item) => ({
          userId: item.userId,
          interestAmount:
            item.interestAmount ?? item.totalInterestAmount ?? 0,
          days: item.days,
        })),
      };

      const { data: blob, headers } = await axios.post(
        DOWNLOAD_URL,
        requestBody,
        {
          headers: { accessToken: authToken },
          responseType: "blob",
        }
      );

      if (blob.size === 0) {
        message.warning("Downloaded file is empty.");
        return;
      }

      const filename =
        headers["content-disposition"]
          ? /filename="?([^\";]+)"?/i.exec(headers["content-disposition"])?.[1]
          : `${payOutType}_${dayjs().format("DD-MM-YYYY")}.xlsx`;

      saveAs(
        new Blob([blob], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        filename
      );
      message.success(`${payOutType} sheet downloaded.`);
    } catch (err) {
      console.error("Download error:", err?.response || err);
      const msg =
        err?.response?.status === 401
          ? "Unauthorized – please log in again."
          : err?.response?.data?.message || "Failed to download XLSX.";
      message.error(msg);
    }
  };

  const handleViewDetails = async (userId) => {
    if (!authToken) {
      message.error("No auth token found. Please log in again.");
      return;
    }
    setDetailsVisible(true);
    setDetailsLoading(true);
    try {
      const { data } = await axios.get(`${DETAILS_URL}/${userId}`, {
        headers: { accessToken: authToken },
      });
      const list = Array.isArray(data)
        ? data
        : data?.interestStatements ?? [];

      const formatted = list.map((interestData) => ({
        userId: interestData.userId,
        userName: interestData.userName,
        interestAmount: interestData.interestAmount,
        amountType: interestData.amountType || "LENDERINTEREST",
        actualDate: interestData.actualDate,           
      }));

      if (!formatted.length)
        message.info("No interest statements found for this user.");
      setDetailsData(formatted);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch user interest statements.");
    } finally {
      setDetailsLoading(false);
    }
  };

  
  const detailsColumns = [
    { title: "User ID", dataIndex: "userId", key: "userId" },
    { title: "User Name", dataIndex: "userName", key: "userName" },
    {
      title: "Interest Amount",
      dataIndex: "interestAmount",
      key: "interestAmount",
      render: (v) => (v ? `₹ ${v.toLocaleString("en-IN")}` : "–"),
    },
    { title: "Amount Type", dataIndex: "amountType", key: "amountType" },
    {
      title: "Actual Payment Date",      
      dataIndex: "actualDate",
      key: "actualDate",
      render: (text) => (text ? text : "null" ),
    },
  ];

  
  const cxData     = interestData.filter((r) => r.payOutType === "CX");
  const onlineData = interestData.filter((r) => r.payOutType === "ONLINE");

  
  return (
    <div className="main-wrapper">
      <OxyloansAdminSidebar />
      <OxyloansAdminHeader />

      <div className="page-wrapper">
        <div className="content container-fluid" style={{ padding: 12 }}>
          <h2 style={{ marginBottom: 16 }}>Users Interest Details</h2>

          {/* controls */}
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <DatePicker
              value={selectedDate}
              format="DD/MM/YYYY"
              onChange={(d) => d && setSelectedDate(d)}
            />

            <Button type="primary" onClick={fetchInterestDetails}>
              Fetch Details
            </Button>

            <Button
              onClick={() => handleDownload("CX")}
              disabled={!cxData.length}
            >
              Download CX Sheet
            </Button>
            <Button
              onClick={() => handleDownload("ONLINE")}
              disabled={!onlineData.length}
            >
              Download ONLINE Sheet
            </Button>
          </div>

          {/* main tables */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                label: `CX (${cxData.length})`,
                key: "CX",
                children: (
                  <Table
                    rowKey="userId"
                    columns={columns}
                    dataSource={cxData}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                    size="middle"
                  />
                ),
              },
              {
                label: `ONLINE (${onlineData.length})`,
                key: "ONLINE",
                children: (
                  <Table
                    rowKey="userId"
                    columns={columns}
                    dataSource={onlineData}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                    size="middle"
                  />
                ),
              },
            ]}
          />

          {/* details modal */}
          <Modal
            title="User Interest Statements"
            open={detailsVisible}
            onCancel={() => setDetailsVisible(false)}
            footer={null}
            width={700}
          >
            {detailsLoading ? (
              <Spin style={{ width: "100%", marginTop: 32 }} />
            ) : (
              <Table
                rowKey={(r) => `${r.userId}-${r.amountType}-${r.actualDate}`}
                columns={detailsColumns}
                dataSource={detailsData}
                pagination={false}
                size="large"
                bordered
              />
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default InterestDetailsTable;
