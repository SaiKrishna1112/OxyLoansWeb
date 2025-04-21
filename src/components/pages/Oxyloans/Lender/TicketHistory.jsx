import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import {
  TicketHistoryapi,
  handelListOfQueriesHisoryapi,
  ticketcommentapi,
} from "../../../HttpRequest/afterlogin";
import "./InvoiceGrid.css";
import Comment from "../Utills/Modals/Comment";
import { handletocancelticket } from "../../Base UI Elements/SweetAlert";

const TicketHistory = () => {
  const [ticket, setticketdata] = useState({});
  const [apires, setapires] = useState([]);
  const [dataapi, setdataapi] = useState();
  const [ticketcomment, setticketcommit] = useState(false);

  useEffect(() => {
    handleWriteClick();
    return () => { };
  }, []);
  const handleWriteClick = async () => {
    const response = TicketHistoryapi();
    response.then((data) => {
      if (data.request.status == 200) {
        setticketdata(data);
        // alert("success");
        var queryDetailsArray = data.data.listOfUserQueryDetailsResponseDto;

        // Initialize an array to store email addresses
        var emailAddresses = [];

        // Loop through the array and extract the "email" property for each item
        for (var i = 0; i < queryDetailsArray.length; i++) {
          var email = queryDetailsArray[i];
          emailAddresses.push(email);
        }

        setapires(queryDetailsArray);
      } else {
        alert("error");
      }
    });
  };

  const handeticketcomment = async (id) => {
    const response = ticketcommentapi(id);

    response.then((data) => {
      setdataapi(data);
      setticketcommit(!ticketcomment);
    });
  };


  const handelListOfQueriesHisory = async (id) => {
    const response = handelListOfQueriesHisoryapi(id);

    response.then((data) => {
      setdataapi(data);
      setticketcommit(!ticketcomment);
    });
  };
  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <Header />

        {/* Sidebar */}
        <SideBar />

        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <div className="page-sub-header">
                    <h3 className="page-title">Ticket History </h3>
                    <ul className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link to="/students">Dashboard</Link>
                      </li>
                      <li className="breadcrumb-item active">Ticket History</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row col-12">
                  <div className="col-xl-12 d-flex">
                    {/* Star Students */}
                    <div className="card flex-fill student-space comman-shadow">
                      {/* <div className="card-header d-flex align-items-center">
                        <h5 className="card-title">Investment / Wallet</h5>
                        <ul className="chart-list-out student-ellips">
                          <li className="star-menus">
                            <Link to="#">
                              <i className="fas fa-ellipsis-v" />
                            </Link>
                          </li>
                        </ul>
                      </div> */}
                      {/* {console.log(dataapi)} */}
                      {ticketcomment && <Comment data={dataapi} />}
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table border-0 star-student  table-center mb-0">
                            <thead>
                              <tr>
                                <th className=""> SNO</th>
                                <th className="">
                                  {/* Query Info */}
                                  Ticket Id
                                </th>
                                {/* <th className="text-center"> Received On</th>
                                <th className="text-center"> Status</th> */}
                                <th className=""> Query</th>
                                <th className="">Admin Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              {apires.map((item, index) => (
                                <>
                                  <tr
                                    key={index}
                                    className={`tablerow${index % 2 === 0 ? "event" : "odd"
                                      }`}
                                  >

                                    <td>
                                      {index + 1}
                                    </td>
                                    <td className="">
                                      <div style={{ fontSize: '12px' }}>

                                        <span className="spantext" >{item.ticketId}</span>

                                      </div>
                                      <div style={{ fontSize: '12px' }} >
                                        <span>Received On :  </span>
                                        <span className="spantext" >{item.receivedOn}</span>

                                      </div>

                                      <div
                                        className={
                                          item.status === "Completed"
                                            ? "badge badge-success"
                                            : "badge badge-danger"
                                        }
                                      >
                                        {item.status}
                                      </div>

                                      <div>
                                        {item.adminScreenshotUrl !== "" &&
                                          <><a
                                          href={item.adminScreenshotUrl}
                                          style={{ fontSize: '14px' }}
                                          download="screenshot.png"  // This triggers the download
                                        >
                                          <p>
                                            <i className="fa-regular fa-image"></i>
                                          {" "}  Download Screenshot
                                          </p>
                                        </a></>}
                                      </div>
                                    </td>
                                    {/* <td className="text-center"></td>
                                  <td className="text-center"></td> */}
                                    <td
                                      className=""
                                      style={{
                                        width: "4rem !important",
                                        whiteSpace: "break-spaces",
                                        fontSize: '12px'
                                      }}
                                    >
                                      {item.query}

                                      <br></br>
                                      {item.status === "Pending" ? <></> : <><span><strong>Admin comments :</strong> {item.query && item.comments}</span></>}
                                    </td>
                                    <td
                                      className=""

                                    >

                                      <div className="buttn">
                                        <div className="badgedat11" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          <button
                                            className={`badge badge-success outline-none  ${item.status == "Completed" ? "disabled" : ""}`}

                                            style={{ border: 'none' }}
                                            typeof="badge"
                                            onClick={() =>
                                              handeticketcomment(item.id)
                                            }
                                          >
                                            View Comments
                                          </button>
                                          <button
                                            className={`badge bg-info ${item.status == "Completed" ? "disabled" : ""}`} accordionstyle={{ border: 'none' }}
                                            typeof="button"
                                            style={{ border: 'none', backgroundColor: 'rgb(16, 142, 233)' }}

                                            onClick={() =>
                                              handelListOfQueriesHisory(item.id)
                                            }
                                          >
                                            View More
                                          </button>
                                        </div>
                                        <div className="badgedat11" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          {/* {item.status == "Completed" || "Completed" ? <></> : <> */}


                                          <button

                                            className="badge badge-warning" style={{ border: 'none', backgroundColor: '' }}

                                          >
                                            <Link
                                              className="text-white"
                                              to={item.status == "Completed" ? `/writetous?id=${item.id}&status=${item.status}` : `/writetous?id=${item.id}`}
                                            >
                                              {item.status == "Completed" ? "Reopen The Query" : "Write A Reply"}

                                            </Link>
                                          </button>
                                          {/* </>}  */}

                                          <button
                                            className={`badge badge-danger  ${item.status == "Completed" ? "disabled" : ""}`} style={{ border: 'none' }}
                                            disabled={item.status === "Cancelled" || "Completed" ? true : false}

                                            onClick={() => handletocancelticket(item.id)}>
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </td>

                                    {/* <p className="d-inline-flex gap-1">
                                      <a
                                        className="btn btn-primary"
                                        data-bs-toggle="collapse"
                                        href="#collapseExample"
                                        role="button"
                                        aria-expanded="false"
                                        aria-controls="collapseExample"
                                      >
                                        Link with href
                                      </a>
                                    </p> */}

                                    {/* <div className="collapse" id="collapseExample">
                                      <div className="card card-body">
                                        Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger.
                                      </div>
                                    </div>      */}
                                  </tr>

                                </>
                              ))}

                            </tbody>
                          </table>
                        </div>
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

export default TicketHistory;
