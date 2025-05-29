import React, { useState, useEffect } from 'react';
import { Button, Input, Card, DatePicker, Pagination } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import Swal from 'sweetalert2';
import { base_url } from '../../../../HttpRequest/admin';
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { useLocation, useNavigate } from 'react-router-dom';

export default function CallsDataBasedOnID() {
  const [users, setUsers] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [radhaComment, setRadhaComment] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const userId = sessionStorage.getItem('userId');
  const accessToken = sessionStorage.getItem('accessToken');

  const location = useLocation();
  const navigate = useNavigate();

  const thStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    textAlign: 'left',
  };

  const tdStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    verticalAlign: 'top',
  };

  const formattedDate = new Date().toISOString().split('T')[0];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr.replace(" ", "T"));
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(',', '');
  };

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${base_url}commentshistorygetting/${userId}`, {
        headers: {
          accessToken,
          'Content-Type': 'application/json',
        },
      });
      setCurrentUserDetails(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchHelpDeskUsers = async () => {
    try {
      const response = await axios.get(`${base_url}getAllHelpDeskUsers`, {
        headers: {
          accessToken,
          'Content-Type': 'application/json',
        },
      });
      setUsers(response.data);
    //   if (location.state?.details?.userId) {
    //     fetchUserDetails(location.state.details.userId);
    //   }
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    const message = error?.response?.data?.errorMessage || "Something went wrong.";
    const status = error?.response?.status;

    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      confirmButtonText: status === 401 ? "Go to Login" : "OK",
    }).then((result) => {
      if (status === 401 && result.isConfirmed) {
        navigate("/");
      }
    });
  };

  const handleRadhaClick = (item) => {
    setActiveRow(Number(item.id)); // Ensure ID is a number
    setRadhaComment("");
  };
  

  const handleRadhaComments = async (item) => {
    const data = {
      updatedByUserId: item.updatedByUserId,
      id: item.id,
      adminname: "Radha",
      admincreated_at: formattedDate,
      adminid: userId,
      admincomments: radhaComment,
    };

    try {
      const response = await axios.post(`${base_url}admincommentsupdated`, data, {
        headers: {
          accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Comment saved successfully!",
        });
        setActiveRow(null);
        setRadhaComment("");
        fetchUserDetails(location.state.details.userId); // Refresh comments
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const disableFutureDates = (current) => {
    return current && current > dayjs().endOf('day');
  };

  const handleSearch = async (page = 1) => {
    console.log("Start Date:", startDate ? startDate.format("YYYY-MM-DD") : "Not selected");
    console.log("End Date:", endDate ? endDate.format("YYYY-MM-DD") : "Not selected");
    console.log("Page Number:", page);

    try {
      const response = await axios.get(
        `${base_url}commentsindaterange/${userId}/${startDate?.format("YYYY-MM-DD")}/${endDate?.format("YYYY-MM-DD")}/${page}/10`,
        {
          headers: {
            accessToken,
            'Content-Type': 'application/json',
          },
        }
      );
      setCurrentUserDetails(response.data);
    //   setTotalCount(response.data?.totalCount || 0);
    //   setCurrentPage(page);
    } catch (error) {
      handleError(error);
    }
  };

  const onPageChange = (page) => {
    handleSearch(page);
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminSidebar />
      <OxyloansAdminHeader />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <Card>
            <div className="page-header mb-4">
              <h4 className="text-2xl font-semibold">User Comments</h4>
            </div>
            <div style={{ padding: 20 }}>
              <DatePicker
                style={{ marginRight: 10 }}
                placeholder="Start Date"
                value={startDate}
                onChange={setStartDate}
                disabledDate={disableFutureDates}
              />
              <DatePicker
                style={{ marginRight: 10 }}
                placeholder="End Date"
                value={endDate}
                onChange={setEndDate}
                disabledDate={disableFutureDates}
              />
              {startDate && endDate && (
    <Button type="primary" onClick={() => handleSearch(1)}>
      Search
    </Button>
  )}
            </div>
            <span><b>Total Count : {currentUserDetails.length}</b></span>
            {Array.isArray(currentUserDetails) && currentUserDetails.length > 0 ? (
              <>
                <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ccc' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>User Details</th>
                      <th style={thStyle}>Comments</th>
                      {/* <th style={thStyle}>Action</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {currentUserDetails.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>
                          {item.updatedByUserId} <br />
                          {item.userName}
                        </td>
                        <td style={tdStyle}>
                          {item.comment}<br />
                          {formatDate(item.updated_at)}<br />
                          {item.admincomments && (
                            <span><b>RADHA comments:</b> {item.admincomments}</span>
                          )}
                        </td>
                        {/* <td style={tdStyle}>
  {Number(activeRow) === Number(item.id) ? (
    <>
      <Input.TextArea
        rows={2}
        value={radhaComment}
        onChange={(e) => setRadhaComment(e.target.value)}
        placeholder="Enter your comment"
      />
      <Button
        type="primary"
        size="small"
        style={{ marginTop: '8px' }}
        onClick={() => handleRadhaComments(item)}
      >
        Save Comment
      </Button>
    </>
  ) : (
    <Button
      type="default"
      size="small"
      onClick={() => handleRadhaClick(item)}
    >
      Radha Comments
    </Button>
  )}
</td> */}

                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 20, textAlign: 'right' }}>
                  <Pagination
                    current={currentPage}
                    total={totalCount}
                    pageSize={10}
                    onChange={onPageChange}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <p>No comment details found.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
