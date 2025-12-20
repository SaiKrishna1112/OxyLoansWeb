// import React from "react";
// import { Link,useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { Table } from "antd";
// import { onShowSizeChange } from "../../../Pagination";
// import Header from "../../../Header/Header";
// import SideBar from "../../../SideBar/SideBar";
// import Footer from "../../../Footer/Footer";
// import { Earning, referralEarningsInfo, referralEarningsInfoparam } from "../../../HttpRequest/afterlogin";
// import { Success, WarningBackendApi } from "../../Base UI Elements/SweetAlert";


// const MyEarnings = () => {
//   const [referalMyearnigs, setreferalMyearnigs] = useState({
//     apiData: "",
//     hasdata: false,
//     loading: true,
//     pageNo: 1,
//     pageSize: 5,
//     defaultPageSize: 5,
//     Invitelender: "",
//     inviteborrower: "",
//     invitenri: "",
//     paidlender: "",
//     borrowerlink: true,
//     earninglink: "",
//     lenderlink: true,
//     invitenrilink: true,
//   });
//   const navigate = useNavigate();
//   const referalMyearnigsPagination = (Pagination) => {
//     setreferalMyearnigs({
//       ...referalMyearnigs,
//       defaultPageSize: Pagination.pageSize,
//       pageNo: Pagination.current,
//       pageSize: Pagination.pageSize,
//     });
//   };

//   useEffect(() => {
//     const response = referralEarningsInfo(
//       referalMyearnigs.pageNo,
//       referalMyearnigs.pageSize
//     );
//     response.then((data) => {
//       if (data.request.status == 200) {
//         setreferalMyearnigs({
//           ...referalMyearnigs,
//           apiData: data.data,
//           loading: false,
//           hasdata: data.data.count == 0 ? false : true,
//         });
//       }
//     });
//     return () => { };
//   }, [referalMyearnigs.pageNo, referalMyearnigs.pageSize]);

//   const datasource = [];
//   {
//     referalMyearnigs.apiData != ""
//       ? referalMyearnigs.apiData.lenderReferenceAmountResponse.map((data) => {
//         datasource.push({
//           key: Math.random(),
//           RefereeName: data.userName,
//           RefereeId: data.refereeNewId,
//           EarnedAmount: data.amount,
//           PaymentStatus: data.paymentStatus,
//           TransferredOn:
//             data.transferredOn == ""
//               ? "Yet To be Credit"
//               : data.transferredOn,
//           Remarks: data.remarks == null ? "No Remarks" : data.remarks,
//         });
//       })
//       : "";
//   }

//   const Invitelender = async () => {
//     const userId = localStorage.getItem("userType");
//     const input = document.createElement("input");
//     input.value = `https://www.user.oxyloans.com/register?ref=${userId}`;
//     document.body.appendChild(input);
//     input.select();
//     document.execCommand("copy");
//     document.body.removeChild(input);

//     setreferalMyearnigs({
//       ...referalMyearnigs,
//       Invitelender: !referalMyearnigs.Invitelender,
//       lenderlink: false,
//     });
//   };
//   const Inviteborrower = async () => {
//     const userId = localStorage.getItem("userType");
//     const input = document.createElement("input");
//     input.value = `https://www.oxyloans.com/new/register_borrower?ref=${userId}`;
//     document.body.appendChild(input);
//     input.select();
//     document.execCommand("copy");
//     document.body.removeChild(input);

//     setreferalMyearnigs({
//       ...referalMyearnigs,
//       Inviteborrower: !referalMyearnigs.Inviteborrower,
//       borrowerlink: false,
//     });
//   };
//   const Invitenri = async () => {
//     const userId = localStorage.getItem("userType");
//     const input = document.createElement("input");
//     input.value = `https://www.oxyloans.com/new/nrilenderregistration?ref=${userId}`;
//     document.body.appendChild(input);
//     input.select();
//     document.execCommand("copy");
//     document.body.removeChild(input);

//     setreferalMyearnigs({
//       ...referalMyearnigs,
//       invitenri: !referalMyearnigs.invitenri,
//       invitenrilink: false,
//     });
//   };

//   const EarningStatementlink = async () => {
//     const response = Earning("");
//     response.then((data) => {
//       if (data.request.status == 200) {
//         setreferalMyearnigs({
//           ...referalMyearnigs,
//           earninglink: data.data.downloadLink,
//         });
//         Success("success", "File Sucessfully Downloaded");
//         window.open(data.data.downloadLink, "_blank");
//       } else if (data.response.data.errorCode != "200") {
//         WarningBackendApi("warning", `${data.response.data.errorMessage}`);
//       }
//     });
//   };

//   const handleChanges = () => {
//     navigate("/referalEaringsMonthWise");
//   }



//   const handelechanges = (event) => {
//     const { name, value } = event.target;
//     setreferalMyearnigs({
//       ...referalMyearnigs,
//       [name]: value
//     })
//   }

//   const column = [
//     {
//       title: "Referee Name",
//       dataIndex: "RefereeName",
//       sorter: (a, b) => a.RefereeName.length - b.RefereeName.length,
//     },

//     {
//       title: "Earned Amount",
//       dataIndex: "EarnedAmount",
//       sorter: (a, b) => a.EarnedAmount - b.EarnedAmount,
//     },
//     {
//       title: "Payment Status",
//       dataIndex: "PaymentStatus",
//       sorter: (a, b) => a.PaymentStatus.length - b.PaymentStatus.length,
//     },
//     {
//       title: "Transferred On",
//       dataIndex: "TransferredOn",
//       sorter: (a, b) =>
//         new Date(a.TransferredOn.length) - new Date(b.TransferredOn.length),
//     },
//     {
//       title: "Remarks",
//       dataIndex: "Remarks",
//       sorter: (a, b) => a.Remarks.length - b.Remarks.length,
//     },
//   ];

//   useEffect(() => {
//     const response = referralEarningsInfoparam(
//       referalMyearnigs.pageNo,
//       referalMyearnigs.pageSize,
//       referalMyearnigs.paidlender
//     );
//     response.then((data) => {
//       if (data.request.status == 200) {
//         setreferalMyearnigs({
//           ...referalMyearnigs,
//           apiData: data.data,
//           loading: false,
//           hasdata: data.data.count == 0 ? false : true,
//         });
//       }
//     });
//     return () => { };

//   }, [referalMyearnigs.paidlender])
//   const handledownloadlink = (param) => {

//     const response = Earning(param)
//     response.then((data) => {
//       console.log(data)
//       if (data.status === 200) {
//         console.log(data.data.downloadLink)
//         const downloadLink = data.data.downloadLink
//         window.open(downloadLink, "_blank");

//       } else {
//         console.log("error when download link");
//       }
//     })


//   }
//   return (
//     <>
//       <div className="main-wrapper">
//         {/* Header */}
//         <Header />

//         {/* Sidebar */}
//         <SideBar />

//         {/* Page Wrapper */}

//         <div className="page-wrapper">
//           <div className="content container-fluid">
//             {/* Page Header */}
//             <div className="page-header">
//               <div className="row align-items-center">
//                 <div className="col">
//                   <h3 className="page-title">
//                     My Earnings Through Invite Friend
//                   </h3>
//                   <ul className="breadcrumb">
//                     <li className="breadcrumb-item">
//                       <Link to="/dashboard">Dashboard</Link>
//                     </li>
//                     <li className="breadcrumb-item active">My Earnings</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//             {/* /Page Header */}
//             <div className="student-group-form">
//               <div className="row" style={{ display: "none" }}>
//                 <div className="col-lg-3 col-md-6">
//                   <div className="form-group">
//                     <input
//                       type="text"
//                       className="form-control"
//                       placeholder="Search by Payment Status "
//                     />
//                   </div>
//                 </div>

//                 <div className="col-lg-2 pull-right">
//                   <div className="search-student-btn">
//                     <button type="btn" className="btn btn-primary">
//                       Search
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="row">
//               <div className="col-sm-12">
//                 <div className="card card-table">
//                   <div className="card-header">
//                     <button
//                       onClick={Inviteborrower}
//                       className="btn btn-xs col-md-2 btn-info col-12 text-white"
//                     >
//                       {referalMyearnigs.borrowerlink ? (
//                         <>Invite Borrower</>
//                       ) : (
//                         <> copied</>
//                       )}
//                     </button>
//                     <button
//                       onClick={Invitelender}
//                       className="btn btn-xs col-md-2 btn-warning  mx-lg-1 col-12 text-white"
//                     >
//                       {referalMyearnigs.lenderlink ? (
//                         <>Invite Lender</>
//                       ) : (
//                         <> copied</>
//                       )}
//                     </button>
//                     <button
//                       onClick={Invitenri}
//                       className="btn btn-xs col-md-2 btn-success mx-lg-1  col-12"
//                     >
//                       {referalMyearnigs.invitenrilink ? (
//                         <>Invite An NRI</>
//                       ) : (
//                         <>copied</>
//                       )}
//                     </button>
//                     <button
//                       className="btn btn-xs col-md-3 btn-danger col-12"
//                       onClick={() => EarningStatementlink()}
//                     >
//                       <i className="fa-solid fa-download"></i> Earning Statement
//                     </button>
//                     {" "}
//                     <a href="https://sites.google.com/view/interestearningsfaqs/home" target="_blank">
//                       <button
//                         className="btn btn-xs btn-success ml-2"

//                       >
//                         Faq
//                       </button>
//                     </a>
//                   </div>
//                   <div className="card-body">
//                     <div className="page-header m-0 p-0">
//                       <div class="alert alert-success" role="alert">
//                         <h6 class="alert-heading" style={{ color: 'red' }}>Note: </h6>
//                         <span><strong>Invited : </strong> You have invited but your friend is not yet registered.</span>
//                         <br />
//                         <span><strong>Registered : </strong> Your friend has registered and reviewing Lending opportunities.</span>
//                         <br />
//                         <span><strong>Lent Money : </strong> Your friend has particiated in Lending and You started earning</span>
//                         <div className="row">
//                           <div className="col-md-3 col-12 mb-2">
//                             <button className="btn btn-xs btn-info text-white w-100" onClick={() => handledownloadlink("")}>
//                               <i className="fa fa-download"></i> Download Statement
//                             </button>
//                           </div>
//                           <div className="col-md-3 col-12 mb-2">
//     <button className="btn btn-xs btn-warning text-white w-100" onClick={() => handleChanges()}>
//       <i className="fa fa-calendar"></i> Month Wise Earning
//     </button>
//   </div>
//                           {/* <div className="col-md-3 col-12 mb-2">
//                             <select className="form-select" name="paidlender" onChange={handelechanges}>
//                               <option value="">--Choose Earned Status--</option>
//                               <option value="Paid">PAID</option>
//                               <option value="Unpaid">UNPAID</option>
//                               <option value="">BOTH</option>
//                             </select>
//                           </div>
//                         </div> */}

//            <div className="col-md-3 col-12 mb-2">
//   <select
//     className="form-select"
//     name="paidlender"
//     onChange={handelechanges}
//   >
//     <option value="">--Choose Earned Status--</option>
//     <option value="Paid">PAID</option>
//     <option value="Unpaid">UNPAID</option>
//     <option value="ALL">BOTH</option>
//   </select>
// </div>
// </div>
//                       </div>
//                     </div>
//                     <div className="table-responsive">
//                       <div className="table-data-total">
//                         <span><strong>Total Earnings : INR {referalMyearnigs.apiData?.totalAmountEarned}</strong> </span>
//                         <span><strong>Paid Earnings : INR {referalMyearnigs.apiData?.sumOfPaidAmount}</strong> </span>
//                         <span><strong>Unpaid Earnings :  INR {referalMyearnigs.apiData?.sumOfUnpaidAmount}</strong> </span>
//                       </div>
//                       <Table
//                         className="table table-stripped table-hover datatable"
//                         pagination={{
//                           total: referalMyearnigs.apiData.count,
//                           showTotal: (total, range) =>
//                             `Showing ${range[0]} to ${range[1]} of ${total} entries`,
//                           position: ["topRight"],
//                           showSizeChanger: false,
//                           onShowSizeChange: onShowSizeChange,
//                         }}
//                         columns={column}
//                         dataSource={referalMyearnigs.hasdata ? datasource : []}
//                         expandable={true}
//                         loading={referalMyearnigs.loading}
//                         onChange={referalMyearnigsPagination}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* Footer */}
//           <Footer />
//         </div>
//       </div>
//       {/* /Main Wrapper */}
//     </>
//   );
// };

// export default MyEarnings;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import { Earning, referralEarningsInfo, referralEarningsInfoparam } from "../../../HttpRequest/afterlogin";
import { Success, WarningBackendApi } from "../../Base UI Elements/SweetAlert";

const MyEarnings = () => {
  const [referalMyearnigs, setreferalMyearnigs] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
    Invitelender: "",
    inviteborrower: "",
    invitenri: "",
    paidlender: "",
    borrowerlink: true,
    earninglink: "",
    lenderlink: true,
    invitenrilink: true,
  });

  const [allData, setAllData] = useState([]);

  const navigate = useNavigate();

  const referalMyearnigsPagination = (Pagination) => {
    setreferalMyearnigs({
      ...referalMyearnigs,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  // Fetch ALL data based on paidlender filter
  useEffect(() => {
    const fetchData = async () => {
      setreferalMyearnigs(prev => ({ ...prev, loading: true }));
      
      // Fetch with a large page size to get all records
      const response = referalMyearnigs.paidlender 
        ? referralEarningsInfoparam(
            1,
            10000,
            referalMyearnigs.paidlender
          )
        : referralEarningsInfo(
            1,
            10000
          );

      response.then((data) => {
        if (data.request.status == 200) {
          // Store all data for client-side pagination
          const transformedData = data.data.lenderReferenceAmountResponse?.map((item) => ({
            key: Math.random(),
            RefereeName: item.userName,
            RefereeId: item.refereeNewId,
            EarnedAmount: item.amount,
            PaymentStatus: item.paymentStatus,
            TransferredOn: item.transferredOn == "" ? "Yet To be Credit" : item.transferredOn,
            Remarks: item.remarks == null ? "No Remarks" : item.remarks,
          })) || [];

          setAllData(transformedData);
          
          setreferalMyearnigs(prev => ({
            ...prev,
            apiData: data.data,
            loading: false,
            hasdata: data.data.count == 0 ? false : true,
          }));
        }
      });
    };

    fetchData();
    return () => {};
  }, [referalMyearnigs.paidlender]);

  // Get paginated data for current page
  const getPaginatedData = () => {
    const startIndex = (referalMyearnigs.pageNo - 1) * referalMyearnigs.pageSize;
    const endIndex = startIndex + referalMyearnigs.pageSize;
    return allData.slice(startIndex, endIndex);
  };

  const datasource = getPaginatedData();
  const filteredTotal = allData.length;

  const Invitelender = async () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.user.oxyloans.com/register?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setreferalMyearnigs({
      ...referalMyearnigs,
      Invitelender: !referalMyearnigs.Invitelender,
      lenderlink: false,
    });
  };

  const Inviteborrower = async () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.oxyloans.com/new/register_borrower?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setreferalMyearnigs({
      ...referalMyearnigs,
      Inviteborrower: !referalMyearnigs.Inviteborrower,
      borrowerlink: false,
    });
  };

  const Invitenri = async () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.oxyloans.com/new/nrilenderregistration?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setreferalMyearnigs({
      ...referalMyearnigs,
      invitenri: !referalMyearnigs.invitenri,
      invitenrilink: false,
    });
  };

  const EarningStatementlink = async () => {
    const response = Earning("");
    response.then((data) => {
      if (data.request.status == 200) {
        setreferalMyearnigs({
          ...referalMyearnigs,
          earninglink: data.data.downloadLink,
        });
        Success("success", "File Sucessfully Downloaded");
        window.open(data.data.downloadLink, "_blank");
      } else if (data.response.data.errorCode != "200") {
        WarningBackendApi("warning", `${data.response.data.errorMessage}`);
      }
    });
  };

  const handleChanges = () => {
    navigate("/referalEaringsMonthWise");
  };

  const handelechanges = (event) => {
    const { name, value } = event.target;
    // If "ALL" or empty is selected, clear the filter to show both
    const filterValue = (value === "ALL" || value === "") ? "" : value;
    setreferalMyearnigs({
      ...referalMyearnigs,
      [name]: filterValue,
      pageNo: 1, 
    });
  };

  const column = [
    {
      title: "Referee Name",
      dataIndex: "RefereeName",
      sorter: (a, b) => a.RefereeName.length - b.RefereeName.length,
    },
    {
      title: "Earned Amount",
      dataIndex: "EarnedAmount",
      sorter: (a, b) => a.EarnedAmount - b.EarnedAmount,
    },
    {
      title: "Payment Status",
      dataIndex: "PaymentStatus",
      sorter: (a, b) => a.PaymentStatus.length - b.PaymentStatus.length,
    },
    {
      title: "Transferred On",
      dataIndex: "TransferredOn",
      sorter: (a, b) => new Date(a.TransferredOn.length) - new Date(b.TransferredOn.length),
    },
    {
      title: "Remarks",
      dataIndex: "Remarks",
      sorter: (a, b) => a.Remarks.length - b.Remarks.length,
    },
  ];

  const handledownloadlink = (param) => {
    const response = Earning(param);
    response.then((data) => {
      console.log(data);
      if (data.status === 200) {
        console.log(data.data.downloadLink);
        const downloadLink = data.data.downloadLink;
        window.open(downloadLink, "_blank");
      } else {
        console.log("error when download link");
      }
    });
  };

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <SideBar />

        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">My Earnings Through Invite Friend</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">My Earnings</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-12">
                <div className="card card-table">
                  <div className="card-header">
                    <button onClick={Inviteborrower} className="btn btn-xs col-md-2 btn-info col-12 text-white">
                      {referalMyearnigs.borrowerlink ? <>Invite Borrower</> : <> copied</>}
                    </button>
                    <button onClick={Invitelender} className="btn btn-xs col-md-2 btn-warning mx-lg-1 col-12 text-white">
                      {referalMyearnigs.lenderlink ? <>Invite Lender</> : <> copied</>}
                    </button>
                    <button onClick={Invitenri} className="btn btn-xs col-md-2 btn-success mx-lg-1 col-12">
                      {referalMyearnigs.invitenrilink ? <>Invite An NRI</> : <>copied</>}
                    </button>
                    <button className="btn btn-xs col-md-3 btn-danger col-12" onClick={() => EarningStatementlink()}>
                      <i className="fa-solid fa-download"></i> Earning Statement
                    </button>{" "}
                    <a href="https://sites.google.com/view/interestearningsfaqs/home" target="_blank">
                      <button className="btn btn-xs btn-success ml-2">Faq</button>
                    </a>
                  </div>
                  <div className="card-body">
                    <div className="page-header m-0 p-0">
                      <div className="alert alert-success" role="alert">
                        <h6 className="alert-heading" style={{ color: "red" }}>
                          Note:{" "}
                        </h6>
                        <span>
                          <strong>Invited : </strong> You have invited but your friend is not yet registered.
                        </span>
                        <br />
                        <span>
                          <strong>Registered : </strong> Your friend has registered and reviewing Lending opportunities.
                        </span>
                        <br />
                        <span>
                          <strong>Lent Money : </strong> Your friend has particiated in Lending and You started earning
                        </span>
                        <div className="row">
                          <div className="col-md-3 col-12 mb-2">
                            <button className="btn btn-xs btn-info text-white w-100" onClick={() => handledownloadlink("")}>
                              <i className="fa fa-download"></i> Download Statement
                            </button>
                          </div>
                          <div className="col-md-3 col-12 mb-2">
                            <button className="btn btn-xs btn-warning text-white w-100" onClick={() => handleChanges()}>
                              <i className="fa fa-calendar"></i> Month Wise Earning
                            </button>
                          </div>
                          <div className="col-md-3 col-12 mb-2">
                            <select className="form-select" name="paidlender" onChange={handelechanges} value={referalMyearnigs.paidlender}>
                              <option value="">--Choose Earned Status--</option>
                              <option value="Paid">PAID</option>
                              <option value="Unpaid">UNPAID</option>
                              <option value="ALL">BOTH</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <div className="table-data-total">
                        <span>
                          <strong>Total Earnings : INR {referalMyearnigs.apiData?.totalAmountEarned}</strong>{" "}
                        </span>
                        <span>
                          <strong>Paid Earnings : INR {referalMyearnigs.apiData?.sumOfPaidAmount}</strong>{" "}
                        </span>
                        <span>
                          <strong>Unpaid Earnings : INR {referalMyearnigs.apiData?.sumOfUnpaidAmount}</strong>{" "}
                        </span>
                      </div>
                      <Table
                        className="table table-stripped table-hover datatable"
                        pagination={{
                          total: filteredTotal,
                          showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: false,
                          onShowSizeChange: onShowSizeChange,
                          pageSize: referalMyearnigs.pageSize,
                          current: referalMyearnigs.pageNo,
                        }}
                        columns={column}
                        dataSource={datasource}
                        expandable={true}
                        loading={referalMyearnigs.loading}
                        onChange={referalMyearnigsPagination}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default MyEarnings;