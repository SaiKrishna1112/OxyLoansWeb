import React, { useEffect, useState } from "react";
import {
  FaUserAlt,
  FaUsers,
  FaUserCheck,
  FaUserGraduate,
  FaCalendarDay,
  FaUserTag
} from "react-icons/fa";
import Swal from "sweetalert2";

import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import Footer from "../../../Footer/Footer";
import { useNavigate } from "react-router-dom";
import { base_url } from "../../../HttpRequest/admin";

export default function RadhaDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState('');
  const [callersData, setCallersData] = useState({
    totalCount: 0,
    todayCount: 0,
    callerDetails: [],
    allCallsCount: 0
  });
  const [chartData, setChartData] = useState([]);
const navigate = useNavigate();
  const accessToken = sessionStorage.getItem("accessToken");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchHelpDeskUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      fetchCallersData();
    }
  }, [users]);

  const fetchHelpDeskUsers = async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        console.error("Access token not found.");
        return;
      }

      const response = await fetch(`${base_url}getAllHelpDeskUsers`, {
        method: "GET",
        headers: {
          accessToken: accessToken,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
      fetchChartData();
    } catch (error) {
      console.error("Error fetching help desk users:", error);
      alert("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCallersData = async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        console.error("Access token not found.");
        return;
      }

      const callerIds = users.map((user) => user.userId);
      let allCallersData = [];
      let totalCallerCount = 0;
      let todayCallerCount = 0;
      let callerDetailsList = [];

      const todayStr = new Date().toISOString().split("T")[0];

      for (const callerId of callerIds) {
        try {
          const response = await fetch(
            `${base_url}commentshistorygetting/${callerId}`,
            {
              method: "GET",
              headers: {
                accessToken: accessToken,
                "Content-Type": "application/json"
              }
            }
          );
console.log("response", response.status);
          if (response.status==200) {
            const callerData = (await response.json()) || [];

            if (callerData.length > 0) {
              totalCallerCount++;
              const user = users.find((u) => u.userId === callerId);
              const callerName = user ? user.name || "Unknown" : "Unknown";

              const todayCalls = callerData.filter((call) => {
                const callDate = new Date(call.updated_at || call.created_at || call.date);
                return callDate.toISOString().split("T")[0] === todayStr;
              });

              if (todayCalls.length > 0) {
                todayCallerCount++;
              }

              callerDetailsList.push({
                callerId: callerId,
                callerName: callerName,
                totalCalls: callerData.length,
                todayCalls: todayCalls.length
              });

              allCallersData = [...allCallersData, ...callerData];
            } else {
              const user = users.find((u) => u.userId === callerId);
              if (user) {
                callerDetailsList.push({
                  callerId: callerId,
                  callerName: user.name || "Unknown",
                  totalCalls: 0,
                  todayCalls: 0
                });
              }
            }
          }
          else{
              if (response.status == 401) {
                              Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: response.data.errorMessage,
                                confirmButtonText: "Go to Login",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  navigate("/");
                                }
                              });
                            } else {
                              Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: response.data.errorMessage,
                                confirmButtonText: "OK",
                              });
                            }
          }
        } catch (error) {
          console.error(`Error fetching data for caller ID ${callerId}:`, error);
        }
      }

      callerDetailsList.sort((a, b) => b.todayCalls - a.todayCalls);

      setCallersData({
        totalCount: users.length,
        todayCount: todayCallerCount,
        callerDetails: callerDetailsList,
        allCallsCount: allCallersData.filter((call) => {
          const callDate = new Date(call.updated_at || call.created_at || call.date);
          return callDate.toISOString().split("T")[0] === todayStr;
        }).length
      });
    } catch (error) {
      console.error("Error in fetchCallersData:", error);
      alert("Failed to load caller data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartData([
        { name: "Jan", calls: 40 },
        { name: "Feb", calls: 30 },
        { name: "Mar", calls: 45 },
        { name: "Apr", calls: 55 },
        { name: "May", calls: 60 },
        { name: "Jun", calls: 48 }
      ]);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const handleViewDetails = (user) => {
    console.log("Viewing details for user:", user);
    // Example navigation:
    navigate("/userCommentDetails", { state: { details: user } });
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                {/* Optional header title */}
              </div>
            </div>
          </div>

          <div>
            <div className="container">
              <div className="mb-4">
                <h4 className="h4 fw-bold">Today Calls Count</h4>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <p className="fs-5">Loading{dots}</p>
                </div>
              ) : (
                <div className="row mb-4">
                  {/* <span>Today Call Count</span> */}

                  <div className="col-md-6 col-lg-3 mb-3">
                    <div className="card border-0 shadow h-100">
                      <div className="card-body p-3 d-flex justify-content-between align-items-center">
                        <div>
                          <p className="text-muted small mb-1">Active Callers</p>
                          <h3 className="fw-bold mb-0">{users.length}</h3>
                        </div>
                        <div className="fs-2 text-success">👥</div>
                      </div>
                      <div className="card-footer p-0">
                        <div className="bg-success" style={{ height: "4px" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3 mb-3">
                    <div className="card border-0 shadow h-100">
                      <div className="card-body p-3 d-flex justify-content-between align-items-center">
                        <div>
                          <p className="text-muted small mb-1">Total Calls</p>
                          <h3 className="fw-bold mb-0">{callersData.allCallsCount}</h3>
                        </div>
                        <div className="fs-2 text-danger">📞</div>
                      </div>
                      <div className="card-footer p-0">
                        <div className="bg-danger" style={{ height: "4px" }}></div>
                      </div>
                    </div>
                  </div>
                  {callersData.callerDetails.slice(0, 2).map((caller, index) => (
                    <div key={caller.callerId} className="col-md-6 col-lg-3 mb-3">
                      <div className="card border-0 shadow h-100">
                        <div className="card-body p-3 d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted small mb-1">{caller.callerName}</p>
                            <h3 className="fw-bold mb-0">{caller.todayCalls}</h3>
                          </div>
                          <div className="fs-2" style={{ color: index === 0 ? "#4e73df" : "#f6c23e" }}>📅</div>
                        </div>
                        <div className="card-footer p-0">
                          <div style={{ height: "4px", backgroundColor: index === 0 ? "#4e73df" : "#f6c23e" }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="card shadow mb-4">
                <div className="card-header py-3">
                  <h5 className="mb-0 fw-bold">Callers List</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    {loading ? (
                      <div className="text-center py-4">
                        <p>Loading{dots}</p>
                      </div>
                    ) : users.length > 0 ? (
                      <table className="table table-striped table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Caller ID</th>
                            <th>Name</th>
                            <th>Email  / Registered On</th>
                            {/* <th></th> */}
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.userId}>
                              <td>{user.userId}</td>
                              <td>{user.name || "N/A"}</td>
                              <td>{user.mail}<br/>{user.registredon}</td>
                              {/* <td></td> */}
                              <td>
                                <button
                                  className="btn btn-link p-0 text-decoration-none"
                                  onClick={() => handleViewDetails(user)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-4">
                        <p>No callers found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}