// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { Link } from "react-router-dom";

// import Header from "../../../Header/Header";
// import SideBar from "../../../SideBar/SideBar";
// import { Success, WarningBackendApi } from "../../Base UI Elements/SweetAlert";
// import { writequery, allQueriesCount1 } from "../../../HttpRequest/afterlogin";
// import "./InvoiceGrid.css";
// import "./media.css"
// import Footer from "../../../Footer/Footer";
// import { allqueries, cancelled, resolved, pending } from "../../../imagepath";

// import MyRichTextEditor from "./MyRichTextEditor";
// import { useSelector } from "react-redux";

// const Writetous = () => {
//   const getreducerprofiledata = useSelector((data) => data.counter.userProfile);
//   const url = new URLSearchParams(window.location.search);
//   const dealName = url.get("dealName");
//   const dealId = url.get("dealId");
//   const urlTickeRequestId = url.get("id");
//   const urlStatus = url.get("status");
 
//   const [writetous, setWriteTous] = useState({
//     query: "",
//     documentId: 0,
//     email: "",
//     mobileNumber: "",
//     id: urlTickeRequestId,
//     status: urlStatus,
//     respondedBy: "USER",
//     profiledata: [],
//     urlquery:
//       dealName == null ? "" : dealName + "/n" + dealId == null ? "" : dealId,
//     isval: false,
//     isVaild: true,
//     imagedocumentid: "",
//   });

//   const [queryresponse, setqueryresponse] = useState({
//     allQueriesCount: 3,
//     resolvedCount: 0,
//     cancelledCount: 0,
//     pendingCount: 3,
//   });

//   const setDataFun = (query) => {
//     setWriteTous({
//       ...writetous,
//       query: query,
//     });
//   };

//   const setImageUploadId = (id) => {
//     setWriteTous({
//       ...writetous,
//       documentId: id,
//     });
//   };

//   useMemo(() => {
//     setWriteTous({
//       ...writetous,
//       profiledata: getreducerprofiledata,
//     });
//   }, [getreducerprofiledata]);

//   useEffect(() => {
//     const fetchallQueriesCount1 = async () => {
//       try {
//         const response = await allQueriesCount1();

//         setqueryresponse({
//           ...queryresponse,

//           allQueriesCount: response.data.allQueriesCount,
//           resolvedCount: response.data.resolvedCount,
//           cancelledCount: response.data.cancelledCount,
//           pendingCount: response.data.pendingCount,
//         });
//       } catch {
//         console.log("error");
//       }
//     };

//     fetchallQueriesCount1();
//     return () => {};
//   }, []);
//   useEffect(() => {
//     if (writetous.query !== "") {
//       setWriteTous({
//         ...writetous,
//         isVaild: false,
//       });
//     } else {
//       setWriteTous({
//         ...writetous,
//         isVaild: true,
//       });
//     }
//     return () => {};
//   }, [writetous.query]);

//   const querySubmission = () => {
//     setWriteTous({
//       ...writetous,
//       isVaild: true,
//     });
//     const response = writequery(writetous);
//     response.then((data) => {
//       if (data.request.status == 200) {
//         Success("success", "You have sucessfully submitted the query");
//       } else if (data.response.data.errorCode != "200") {
//         WarningBackendApi("warning", `${data.response.data.errorMessage}`);
//       }
//     });
//   };
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
//                   <h3 className="page-title">Write to us </h3>
//                   <ul className="breadcrumb">
//                     <li className="breadcrumb-item">
//                       <Link to="/dashboard">Dashboard</Link>
//                     </li>
//                     <li className="breadcrumb-item active">Write to us</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//             {/* /Page Header */}
//             <div className="student-group-form">
//               <div className="row">
//                 <div className="col-xl-3 col-sm-6 col-12">
//                   <div className="card inovices-card">
//                     <div className="card-body">
//                       <div className="inovices-widget-header">
//                         <span className="inovices-widget-icon">
//                           <img src={allqueries} alt="" className="queyImage" />
//                         </span>
//                         <div className="inovices-dash-count">
//                           <div className="inovices-amount">
//                             {queryresponse.allQueriesCount}
//                           </div>
//                         </div>
//                       </div>
//                       <p className="inovices-all">
//                         All Queries <span></span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-xl-3 col-sm-6 col-12">
//                   <div className="card inovices-card">
//                     <div className="card-body">
//                       <div className="inovices-widget-header">
//                         <span className="inovices-widget-icon">
//                           <img src={resolved} alt="" className="queyImage" />
//                         </span>
//                         <div className="inovices-dash-count">
//                           <div className="inovices-amount">
//                             {queryresponse.resolvedCount}
//                           </div>
//                         </div>
//                       </div>
//                       <p className="inovices-all">
//                         Resolved Queries <span></span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-xl-3 col-sm-6 col-12">
//                   <div className="card inovices-card">
//                     <div className="card-body">
//                       <div className="inovices-widget-header">
//                         <span className="inovices-widget-icon">
//                           <img src={cancelled} alt="" className="queyImage" />
//                         </span>
//                         <div className="inovices-dash-count">
//                           <div className="inovices-amount">
//                             {queryresponse.cancelledCount}
//                           </div>
//                         </div>
//                       </div>
//                       <p className="inovices-all">
//                         Cancelled Queries <span></span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-xl-3 col-sm-6 col-12">
//                   <div className="card inovices-card">
//                     <div className="card-body">
//                       <div className="inovices-widget-header">
//                         <span className="inovices-widget-icon">
//                           <img src={pending} alt="" className="queyImage" />
//                         </span>
//                         <div className="inovices-dash-count">
//                           <div className="inovices-amount pull-left">
//                             {queryresponse.pendingCount}
//                           </div>
//                         </div>
//                       </div>
//                       <p className="inovices-all">
//                         Pending Queries <span></span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="row">
//               <div className="col-sm-14">
//                 <div className="card card-table">
//                   <div className="card-body">
//                     {/* Page Header */}
//                     <div className="page-header">
//                       <div className="row align-items-center">
//                         <div className="col">
//                           <h3 className="page-title">Write a query</h3>
//                         </div>
//                       </div>
//                     </div>
//                     {/* /Page Header */}

//                     <div className="row col-12">
//                       <div className="col-12 col-sm-12">
//                         <MyRichTextEditor
//                           data={writetous}
//                           setdata={setDataFun}
//                           documentUpload={setImageUploadId}
//                         />
//                       </div>

//                       <div className="row col-12 mobileView">
//                         <button
//                           className="btn btn-primary col-md-3 mx-3 my-5 querybtn"
//                           onClick={querySubmission}
//                           disabled={writetous.isVaild}
//                         >
//                           Submit
//                         </button>
//                       </div>
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

// export default Writetous;
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Success, WarningBackendApi } from "../../Base UI Elements/SweetAlert";
import { writequery, allQueriesCount1 } from "../../../HttpRequest/afterlogin";
import "./InvoiceGrid.css";
import "./media.css";
import Footer from "../../../Footer/Footer";
import { allqueries, cancelled, resolved, pending } from "../../../imagepath";

import MyRichTextEditor from "./MyRichTextEditor";
import { useSelector } from "react-redux";

const Writetous = () => {
  const getreducerprofiledata = useSelector((data) => data.counter.userProfile);
  const url = new URLSearchParams(window.location.search);
  const dealName = url.get("dealName");
  const dealId = url.get("dealId");
  const urlTickeRequestId = url.get("id");
  const urlStatus = url.get("status");

  const [writetous, setWriteTous] = useState({
    query: "",
    documentId: 0,
    email: "",
    mobileNumber: "",
    id: urlTickeRequestId,
    status: urlStatus,
    respondedBy: "USER",
    profiledata: [],
    urlquery:
      dealName == null ? "" : dealName + "/n" + (dealId == null ? "" : dealId),
    isval: false,
    isVaild: true, // submit disabled by default
    imagedocumentid: "",
  });

  const [queryresponse, setqueryresponse] = useState({
    allQueriesCount: 3,
    resolvedCount: 0,
    cancelledCount: 0,
    pendingCount: 3,
  });

  const setDataFun = (query) => {
    setWriteTous({
      ...writetous,
      query: query,
    });
  };

  const setImageUploadId = (id) => {
    setWriteTous({
      ...writetous,
      documentId: id,
    });
  };

  useMemo(() => {
    setWriteTous({
      ...writetous,
      profiledata: getreducerprofiledata,
    });
  }, [getreducerprofiledata]);

  useEffect(() => {
    const fetchallQueriesCount1 = async () => {
      try {
        const response = await allQueriesCount1();

        setqueryresponse({
          ...queryresponse,
          allQueriesCount: response.data.allQueriesCount,
          resolvedCount: response.data.resolvedCount,
          cancelledCount: response.data.cancelledCount,
          pendingCount: response.data.pendingCount,
        });
      } catch {
        console.log("error");
      }
    };

    fetchallQueriesCount1();
  }, []);

  // For disabling submit button
  useEffect(() => {
    if (writetous.query !== "") {
      setWriteTous({
        ...writetous,
        isVaild: false,
      });
    } else {
      setWriteTous({
        ...writetous,
        isVaild: true,
      });
    }
  }, [writetous.query]);

  // ***********************
  //     VALIDATION ADDED
  // ***********************
  const querySubmission = () => {
    // Remove HTML tags & spaces to check real content
    const cleanedQuery = writetous.query
      .replace(/<[^>]+>/g, "") // remove HTML tags
      .replace(/&nbsp;/g, "")  // remove &nbsp
      .trim();

    if (cleanedQuery.length === 0) {
      WarningBackendApi("warning", "Please enter your query before submitting");
      return;
    }

    setWriteTous({
      ...writetous,
      isVaild: true,
    });

    const response = writequery(writetous);
    response.then((data) => {
      if (data.request.status == 200) {
        Success("success", "You have successfully submitted the query");
      } else if (data.response.data.errorCode != "200") {
        WarningBackendApi("warning", `${data.response.data.errorMessage}`);
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
                  <h3 className="page-title">Write to us </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Write to us</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="student-group-form">
              <div className="row">
                <div className="col-xl-3 col-sm-6 col-12">
                  <div className="card inovices-card">
                    <div className="card-body">
                      <div className="inovices-widget-header">
                        <span className="inovices-widget-icon">
                          <img src={allqueries} alt="" className="queyImage" />
                        </span>
                        <div className="inovices-dash-count">
                          <div className="inovices-amount">
                            {queryresponse.allQueriesCount}
                          </div>
                        </div>
                      </div>
                      <p className="inovices-all">All Queries</p>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-sm-6 col-12">
                  <div className="card inovices-card">
                    <div className="card-body">
                      <div className="inovices-widget-header">
                        <span className="inovices-widget-icon">
                          <img src={resolved} alt="" className="queyImage" />
                        </span>
                        <div className="inovices-dash-count">
                          <div className="inovices-amount">
                            {queryresponse.resolvedCount}
                          </div>
                        </div>
                      </div>
                      <p className="inovices-all">Resolved Queries</p>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-sm-6 col-12">
                  <div className="card inovices-card">
                    <div className="card-body">
                      <div className="inovices-widget-header">
                        <span className="inovices-widget-icon">
                          <img src={cancelled} alt="" className="queyImage" />
                        </span>
                        <div className="inovices-dash-count">
                          <div className="inovices-amount">
                            {queryresponse.cancelledCount}
                          </div>
                        </div>
                      </div>
                      <p className="inovices-all">Cancelled Queries</p>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-sm-6 col-12">
                  <div className="card inovices-card">
                    <div className="card-body">
                      <div className="inovices-widget-header">
                        <span className="inovices-widget-icon">
                          <img src={pending} alt="" className="queyImage" />
                        </span>
                        <div className="inovices-dash-count">
                          <div className="inovices-amount">
                            {queryresponse.pendingCount}
                          </div>
                        </div>
                      </div>
                      <p className="inovices-all">Pending Queries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Write a Query */}
            <div className="row">
              <div className="col-sm-14">
                <div className="card card-table">
                  <div className="card-body">
                    <div className="page-header">
                      <div className="row align-items-center">
                        <div className="col">
                          <h3 className="page-title">Write a query</h3>
                        </div>
                      </div>
                    </div>

                    <div className="row col-12">
                      <div className="col-12 col-sm-12">
                        <MyRichTextEditor
                          data={writetous}
                          setdata={setDataFun}
                          documentUpload={setImageUploadId}
                        />
                      </div>

                      <div className="row col-12 mobileView">
                        <button
                          className="btn btn-primary col-md-3 mx-3 my-5 querybtn"
                          onClick={querySubmission}
                          disabled={writetous.isVaild}
                        >
                          Submit
                        </button>
                      </div>
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

export default Writetous;



