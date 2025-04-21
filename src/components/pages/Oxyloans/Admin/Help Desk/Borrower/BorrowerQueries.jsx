import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { Table, Spin, message } from 'antd';
import Sidebar from '../../../../../SideBar/OxyloansAdminSidebar';
import Header from '../../../../../Header/OxyloansAdminHeader';
import Swal from 'sweetalert2';

export default function BorrowerQueries() {
  const [queryData, setQueryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState();
  const navigate = useNavigate();

  const fetchBorrowerQueries = async () => {
    setLoading(true);
    const accessToken = sessionStorage.getItem("accessToken");
    console.log({ accessToken });

    if (!accessToken) {
      setLoading(false);
      return;
    }

    const requestBody = {
      pageNo: currentPage,
      pageSize: 10,
      primaryType: "BORROWER",
      status: "pending",
    };

    const config = {
      headers: {
        accessToken: accessToken,
        "Content-Type": "application/json",
      },
    };

    try {
      console.log("Sending API call with body:", requestBody);

      const response = await axios.post(
        "https://fintech.oxyloans.com/oxyloans/v1/user/queryDetailsBasedOnPrimaryType",
        requestBody,
        config
      );

      // console.log("API response status:", response.status);
      // console.log("API response data:", response.data);
      
      const data = response?.data?.listOfUserQueryDetailsResponseDto || [];
      // const total = response?.data?.totalCount || 0;
      setTotalCount(response?.data?.borrowerCount)
      const formattedData = data.map((item, index) => ({
        key: index,
        sNo: (currentPage - 1) * 10 + index + 1,
        // userInfo: `${item.name?.trim()} (${item.userNewId})\n${item.mobileNumber}\n${item.email}\n`,
        userNewId :item.userNewId,
        mobileNumber:item.mobileNumber,
        email:item.email,
        name:item.name?.trim(),
        query: item.query,
        queryStatus: item.listOfPendingQueries?.[0]?.pendingQuereis
        ? `${item.listOfPendingQueries[0].pendingQuereis}, Status: ${item.status}`
        : `Status: ${item.status || "Unknown"}`,
        status: item.status,
        ticketId:item.ticketId,
        receivedOn:item.receivedOn
      }));

      setQueryData(formattedData);
    } catch (error) {
      console.error("API call failed:", error);

     if(error.response.status == 401){
       Swal.fire({
         icon: 'error',
         title: 'Oops...',
         text: error.response.data.errorMessage,
         confirmButtonText: 'Go to Login',
         denyButtonText: 'Regenerated',
     
       }).then((result) => {
         if (result.isConfirmed) {
           navigate('/');
         }
         // else if (result.isDenied) {
         //   // Call your API here
         //   regenerateOTP(); // Replace with your actual API call function
         // }
       });
       setLoading(false)
     
     }
     else{
     Swal.fire({
       icon: 'error',
       title: 'Oops...',
       text: error.response.data.errorMessage,
       confirmButtonText: 'OK',
     })
    }
  } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowerQueries();
  }, [currentPage]);

  const columns = [
    { title: "S.No", dataIndex: "sNo", key: "sNo", width: 20 },
    {
      title: "User Info",
      // dataIndex: "userInfo",
      key: "userInfo",
      width: 230,
      render: (_,text) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: 250 }}>
           <div><strong>User Id:</strong> {text.userNewId}</div>
          <div><strong>Mobile Number:</strong> {text.mobileNumber}</div>
          <div><strong>Email:</strong> {text.email}</div>
          <div><strong>User Name:</strong> {text.name}</div>
          <div><strong>Ticket Id:</strong> {text.ticketId}</div>
        </div>
      ),
    },
    {
      title: "Query",
      dataIndex: "query",
      key: "query",
      width: 200,
      render: (text) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: 300 }}>{text}</div>
      ),
    },
    {
      title: "Query Status",
      dataIndex: "queryStatus",
      key: "queryStatus",
      width: 150,
    },
    {
      title: "Status",
      // dataIndex: "status",
      key: "status",
      width: 150,
      render: (text) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: 300 }}>
          <div><strong>Status:</strong>{text.status}</div>
          <div><strong>RecievedOn:</strong>{text.receivedOn}</div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header mb-3">
              <div className="row">
                <div className="col">
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/oxyloansadmindashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Borrower Queries</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 overflow-y-auto h-full">
          <div className="bg-white rounded-md shadow-md p-4 overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4">Unresolved Borrower Queries</h3>
            <h6 className="text-xl font-semibold mb-4">No of Borrower Pending queries : {totalCount}</h6>

            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                dataSource={queryData}
                columns={columns}
                bordered
                scroll={{ x: "max-content" }}
                pagination={{
                  current: currentPage,
                  pageSize: 10,
                  total: totalCount,
                  onChange: (page) => setCurrentPage(page),
                  showSizeChanger: false,
                  showLessItems: true, 
                }}
              />
            )}
           </div>
         </div>
          </div>
          </div>
        </div>

     
      </div>
    </>
  );
}
