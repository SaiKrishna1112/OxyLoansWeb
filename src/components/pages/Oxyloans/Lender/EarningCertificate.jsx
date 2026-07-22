// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import Header from "../../../Header/Header";
// import SideBar from "../../../SideBar/SideBar";
// import { DatePicker, Button, message, Table } from "antd";
// import { getMyfinancialEarnings, summaryFinancialEarnings } from "../../../HttpRequest/afterlogin";
// import { confirmationAlertFyYear } from "../../Base UI Elements/SweetAlert";

// const { RangePicker } = DatePicker;

// const EarningCertificate = () => {
//   const [dateRange, setDateRange] = useState([null, null]);
//   const [isLoading, setIsLoading] = useState(false);

//   const [myfyearnings, setmyfyearnings] = useState({
//     apiData: "",
//     hasdata: false,
//     loading: true,
//   });

//   const profitearnedCertificate = (startdate, enddate, downloadType, status) => {
//     confirmationAlertFyYear(startdate, enddate, downloadType, status);
//   };

//   const handleDownloadSummaryPdf = async () => {
//     try {
//       if (!dateRange || !dateRange[0] || !dateRange[1]) {
//         message.warning("Please select a valid date range before searching.");
//         return;
//       }

//       setIsLoading(true);

//       const payload = {
//         startDate: dateRange[0].format("YYYY-MM-DD"),
//         endDate: dateRange[1].format("YYYY-MM-DD"),
//       };

//       const response = await summaryFinancialEarnings({
//         startDate: payload.startDate,
//         endDate: payload.endDate,
//         inputType: "DOWNLOAD",
//         status: "dealsum",
//       });

//       if (response!=null) {
//         const url = response.data;

//         if (url && url.length > 0) {
//           const link = document.createElement("a");
//           link.href = url;
//           link.setAttribute("download", "");
//           link.setAttribute("target", "_blank");
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);

//           message.success("PDF downloaded successfully!");
//         }
         
//       } 
      
//       else {
//         message.success("No data found for Summary PDF.");
//       } 

//     } catch (error) {
//       console.error("Error fetching financial earnings:", error);
//       message.error("An error occurred while fetching the Summary PDF.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDateChange = (dates) => {
//     setDateRange(dates);
//   };

//   useEffect(() => {
//     const response = getMyfinancialEarnings();
//     response.then((data) => {
//       if (data.request.status === 200) {
//         setmyfyearnings({
//           ...myfyearnings,
//           apiData: data.data,
//           loading: false,
//           hasdata: data.data.length !== 0,
//         });
//       }
//     });
//     return () => {};
//   }, []);

//   const datasource = [];

//   if (myfyearnings.apiData !== "") {
//     myfyearnings.apiData.map((data) => {
//       datasource.push({
//         key: Math.random(),
//         SO: data.sNo,
//         FY: data.financialYear,
//         EARNINGS: data.incomeEarned,
//         DOWNLOADFYREPORT: (
//           <span
//             className="badge bg-success"
//             type="button"
//             onClick={() =>
//               profitearnedCertificate(
//                 data.startDate,
//                 data.endDate,
//                 "DOWNLOAD",
//                 "dealsum"
//               )
//             }
//           >
//             <i className="fa-solid fa-download"></i> Download FY Report
//           </span>
//         ),
//         DOWNLOADMONTREPORT: (
//           <span
//             className="badge bg-warning"
//             type="button"
//             onClick={() =>
//               profitearnedCertificate(
//                 data.startDate,
//                 data.endDate,
//                 "DOWNLOAD",
//                 "dealsumMonthly"
//               )
//             }
//           >
//             <i className="fa-solid fa-download"></i> Download MONTHLY Report
//           </span>
//         ),
//         EMAILFYREPORT: (
//           <span
//             className="badge bg-info"
//             type="button"
//             onClick={() =>
//               profitearnedCertificate(
//                 data.startDate,
//                 data.endDate,
//                 "EMAIL"
//               )
//             }
//           >
//             <i className="fa-solid fa-envelope"></i> Get FY Email Report
//           </span>
//         ),
//       });
//     });
//   }

//   const columns = [
//     {
//       title: "SNO",
//       dataIndex: "SO",
//       sorter: (a, b) => a.SO - b.SO,
//     },
//     {
//       title: "FY",
//       dataIndex: "FY",
//       sorter: (a, b) => a.FY.length - b.FY.length,
//     },
//     {
//       title: "EARNINGS",
//       dataIndex: "EARNINGS",
//       sorter: (a, b) => a.EARNINGS - b.EARNINGS,
//     },
//     {
//       title: "DOWNLOAD FY REPORT",
//       dataIndex: "DOWNLOADFYREPORT",
//     },
//     {
//       title: "DOWNLOAD MONTHLY REPORT",
//       dataIndex: "DOWNLOADMONTREPORT",
//     },
//     {
//       title: "EMAIL FY REPORT",
//       dataIndex: "EMAILFYREPORT",
//     },
//   ];

//   return (
//     <>
//       <div className="main-wrapper">
//         <Header />
//         <SideBar />
//         <div className="page-wrapper">
//           <div className="content container-fluid">
//             <div className="page-header">
//               <div className="row">
//                 <div className="col">
//                   <h3 className="page-title">Financial Reports</h3>
//                   <ul className="breadcrumb">
//                     <li className="breadcrumb-item">
//                       <Link to="/dashboard">Dashboard</Link>
//                     </li>
//                     <li className="breadcrumb-item active">
//                       Financial Reports
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-sm-12">
//                 <div className="card">
//                   <div className="card-body">
//                     <div className="d-flex align-items-center">
//                       <RangePicker
//                         onChange={handleDateChange}
//                         format="YYYY-MM-DD"
//                         style={{ marginRight: 10 }}
//                         value={dateRange}
//                       />
//                       <Button 
//                         type="primary" 
//                         onClick={handleDownloadSummaryPdf}
//                         loading={isLoading}
//                       >
//                         Search
//                       </Button>
//                     </div>

//                     <div>
//                       <Table
//                         className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
//                         pagination={{
//                           total: datasource.length,
//                           showTotal: (total, range) =>
//                             `Showing ${range[0]} to ${range[1]} of ${total} entries`,
//                           position: ["topRight"],
//                         }}
//                         columns={columns}
//                         dataSource={myfyearnings.hasdata ? datasource : []}
//                         expandable={true}
//                         loading={myfyearnings.loading}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default EarningCertificate;


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { DatePicker, Button, message, Table, Tooltip } from "antd";
import {
  getMyfinancialEarnings,
  summaryFinancialEarnings,
} from "../../../HttpRequest/afterlogin";
import { confirmationAlertFyYear } from "../../Base UI Elements/SweetAlert";

const { RangePicker } = DatePicker;

// **FY LIST IN DESCENDING ORDER**
const FY_LIST = [
  "2025-2026",
  "2024-2025",
  "2023-2024",
  "2022-2023",
  "2021-2022",
  "2020-2021",
];

// Function to get formatted date DD/MM/YYYY
const formatDate = (date) => {
  return (
    date.getDate().toString().padStart(2, "0") +
    "/" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    date.getFullYear()
  );
};

const EarningCertificate = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [isLoading, setIsLoading] = useState(false);

  const [myfyearnings, setmyfyearnings] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
  });

  const profitearnedCertificate = (startdate, enddate, downloadType, status) => {
    confirmationAlertFyYear(startdate, enddate, downloadType, status);
  };

  const handleDownloadSummaryPdf = async () => {
    try {
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        message.warning("Please select a valid date range before searching.");
        return;
      }

      setIsLoading(true);

      const payload = {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      };

      const response = await summaryFinancialEarnings({
        startDate: payload.startDate,
        endDate: payload.endDate,
        inputType: "DOWNLOAD",
        status: "dealsum",
      });

      if (response != null) {
        const url = response.data;

        if (url && url.length > 0) {
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "");
          link.setAttribute("target", "_blank");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          message.success("PDF downloaded successfully!");
        }
      } else {
        message.success("No data found for Summary PDF.");
      }
    } catch (error) {
      console.error("Error fetching financial earnings:", error);
      message.error("An error occurred while fetching the Summary PDF.");
    } finally {
      setIsLoading(false);
    }
  };

async function handleDownloadFYReportPDF(startDate, endDate) {
  console.log("Start date",startDate,"end date",endDate);
  
  try{

      const response = await summaryFinancialEarnings({
        startDate: startDate,
        endDate: endDate,
        inputType: "DOWNLOAD",
        status: "dealsum",
      });

      if (response != null) {
        const url = response.data;

        if (url && url.length > 0) {
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "");
          link.setAttribute("target", "_blank");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          message.success("PDF downloaded successfully!");
        }
      } else {
        message.success("No data found for Summary PDF.");
      }
    } catch (error) {
      console.error("Error fetching financial earnings:", error);
      message.error("An error occurred while fetching the Summary PDF.");
    } finally {
      setIsLoading(false);
    }
}


  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  useEffect(() => {
    const response = getMyfinancialEarnings();
    response.then((data) => {
      if (data.request.status === 200) {
        setmyfyearnings({
          ...myfyearnings,
          apiData: data.data,
          loading: false,
          hasdata: data.data.length !== 0,
        });
      }
    });
  }, []);

  const today = new Date();

  // Function for calculating correct "Up To Date" based on FY
  // const getUpToDate = (fyString) => {
  //   const [startYear, endYear] = fyString.split("-");

  //   const currentFY = FY_LIST[0]; // First item = current FY

  //   if (fyString === currentFY) {
  //     return formatDate(today); // Today's date
  //   }

  //   // For old years → always 31 March
  //   return `31/03/${endYear}`;
  // };

  // Function for calculating correct "Up To Date" based on FY
const getCurrentFY = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // Jan = 1

  // FY starts in April
  return month >= 4
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
};

const getUpToDate = (fyString) => {
  const [, endYear] = fyString.split("-");

  if (fyString === getCurrentFY()) {
    return formatDate(new Date());
  }

  return `31/03/${endYear}`;
};

  const datasource = [];

  if (myfyearnings.apiData !== "") {
    myfyearnings.apiData.forEach((data, index) => {
      const upToDate = getUpToDate(data.financialYear);

      datasource.push({
        key: index,
        SO: data.sNo,
        FY: data.financialYear,
        EARNINGS: data.incomeEarned,

        DOWNLOADFYREPORT: (
          <div style={{justifyContent:"center",alignSelf:"center",display:"flex"}}>
          <Tooltip title={`Download PDF report up to: ${upToDate}`}>
            <span
              className="badge bg-info"
              type="button"
              style={{ cursor: "pointer",marginRight:"8px"}}
              onClick={() =>
                handleDownloadFYReportPDF(   
               data.startDate,
                data.endDate
                )
              }
            >
             <i className="fa-solid fa-download" style={{fontSize: "14px",marginRight:"5px"}}></i>{" "} <i className="fa-solid fa-file-pdf" style={{fontSize: "14px"}}></i> 
            </span>
          </Tooltip>
          {" "}
          <Tooltip title={`Download excel report up to: ${upToDate}`}>
            <span
              className="badge bg-success"
              type="button"
              onClick={() =>{
                console.log("Downloading FY Report Excel for:", data.startDate, "with up to date:", data.endDate);
                profitearnedCertificate(
                  data.startDate,
                  data.endDate,
                  "DOWNLOAD",
                  "dealsum"
                )
              }
              }
            >
             <i className="fa-solid fa-download" style={{fontSize: "14px",marginRight:"5px"}}></i>{" "} <i className="fa-solid fa-file-excel" style={{fontSize: "14px"}}></i>
            </span>
          </Tooltip>
          </div>
        ),

        DOWNLOADMONTREPORT: (
           <div style={{justifyContent:"center",alignSelf:"center",display:"flex"}}>
          <Tooltip title={`Monthwise report up to: ${upToDate}`}>
            <span
              className="badge bg-warning justify-content-center"
              type="button"
              style={{alignSelf:"center"}}
              onClick={() =>
                profitearnedCertificate(
                  data.startDate,
                  data.endDate,
                  "DOWNLOAD",
                  "dealsumMonthly"
                )
              }
            >
              <i className="fa-solid fa-download" style={{fontSize: "14px"}}></i> MonthWise
            </span>
          </Tooltip>
          </div>
        ),

        EMAILFYREPORT: (
           <div style={{justifyContent:"center",alignSelf:"center",display:"flex"}}>
          <Tooltip title={`Email report generated up to: ${upToDate}`}>
            <span
              className="badge bg-info align-items-center justify-content-center"
              type="button"
              onClick={() =>
                profitearnedCertificate(data.startDate, data.endDate, "EMAIL")
              }
            >
              <i className="fa-solid fa-envelope" style={{fontSize: "14px"}}></i>
            </span>
          </Tooltip>
          </div>
        ),
      });
    });
  }

  const columns = [
    { title: "SNO", dataIndex: "SO", sorter: (a, b) => a.SO - b.SO },
    { title: "FY", dataIndex: "FY" },
    { title: "EARNINGS", dataIndex: "EARNINGS", sorter: (a, b) => a.EARNINGS - b.EARNINGS },
    { title: "DOWNLOAD FY REPORT", dataIndex: "DOWNLOADFYREPORT" },
    { title: "DOWNLOAD MONTHWISE REPORT", dataIndex: "DOWNLOADMONTREPORT" },
    { title: "EMAIL FY REPORT", dataIndex: "EMAILFYREPORT" },
  ];

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <SideBar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
               <div className="row">
                <div className="col">
              <h3 className="page-title">Financial Reports</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Financial Reports</li>
              </ul>
             </div>
            </div>
          </div>

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">

                    <div className="report-download-section">
                        <h5 style={{ marginBottom: 8 }}>Generate Financial Report</h5>
                        <p style={{ marginBottom: 12, color: "#6c757d", fontSize: 13 }}>
                          Select the reporting period to generate and download the financial report in PDF format.
                        </p>

                        <div className="d-flex align-items-center">
                          <RangePicker
                            onChange={handleDateChange}
                            format="YYYY-MM-DD"
                            value={dateRange}
                            placeholder={["Start Date", "End Date"]}
                            style={{ marginRight: 12, minWidth: 260 }}
                          />

                          <Button
                            type="primary"
                            onClick={handleDownloadSummaryPdf}
                            loading={isLoading}
                          >
                            Download Financial Report (PDF)
                          </Button>
                        </div>
                      </div>

                    <Table
                      className="table-responsive"
                      pagination={{
                        total: datasource.length,
                        showTotal: (total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                        position: ["topRight"],
                      }}
                      columns={columns}
                      dataSource={myfyearnings.hasdata ? datasource : []}
                      loading={myfyearnings.loading}
                    />

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EarningCertificate;
