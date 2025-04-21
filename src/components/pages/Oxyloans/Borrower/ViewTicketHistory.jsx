import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";

import {
  TicketHistoryapi,
  ticketcommentapi,
} from "../../../HttpRequest/afterlogin";
// import ".././InvoiceGrid.css";
import Comment from "../Utills/Modals/Comment";

const TicketHistory = () => {
  const [ticket, setticketdata] = useState({});
  const [apires, setapires] = useState([]);
  const [dataapi, setdataapi] = useState();
  const [ticketcomment, setticketcommit] = useState(false);

  useEffect(() => {
    handleWriteClick();
    return () => {};
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

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <BorrowerHeader />

        {/* Sidebar */}
        <BorrowerSidebar />

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
                      {ticketcomment && <Comment data={dataapi} />}
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table border-0 star-student  table-center mb-0">
                            <thead>
                              <tr>
                                <th className=""> Query Info</th>
                                {/* <th className="text-center"> Received On</th>
                                <th className="text-center"> Status</th> */}
                                <th className=""> Query</th>
                                <th className="">Admin Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              {apires.map((item, index) => (
                                <tr
                                  key={index}
                                  className={`tablerow${
                                    index % 2 === 0 ? "event" : "odd"
                                  }`}
                                >
                                  <td className="">
                                    <div>
                                      <h6>Ticket Id</h6>
                                      {item.ticketId}
                                    </div>
                                    <div>
                                      <h6>Received On</h6>
                                      {item.receivedOn}
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
                                  </td>
                                  {/* <td className="text-center"></td>
                                  <td className="text-center"></td> */}
                                  <td
                                    className=""
                                    style={{
                                      width: "4rem !important",
                                      whiteSpace: "break-spaces",
                                    }}
                                  >
                                    {item.query}
                                  </td>
                                  <td
                                    className=""
                                    style={{
                                      width: "4rem !important",
                                      whiteSpace: "break-spaces",
                                    }}
                                  >
                                    <div>{item.query && item.comments}</div>
                                    <div className="buttn">
                                      <div className="badgedat">
                                        {/* <button
                                          className="badge badge-success outline-none"
                                          typeof="badge"
                                          onClick={() =>
                                            handeticketcomment(item.id)
                                          }
                                        >
                                          View Comments
                                        </button> */}
                                        {/* <button
                                          className="badge bg-info"
                                          typeof="button"
                                        >
                                          Inquiries Reply
                                        </button> */}
                                      </div>
                                      <div className="badgedat">
                                        <button
                                          disabled={
                                            item.status == "Completed"
                                              ? true
                                              : false
                                          }
                                          className="btn btn-success"
                                        >
                                          <Link
                                            className="text-white"
                                            to={`/writetous?id=${item.id}`}
                                          >
                                            Write Reply
                                          </Link>
                                        </button>

                                        <button
                                          className="badge bg-success-dark"
                                          disabled={
                                            item.status == "Completed"
                                              ? true
                                              : false
                                          }
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
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
        </div>
      </div>
    </>
  );
};

export default TicketHistory;
