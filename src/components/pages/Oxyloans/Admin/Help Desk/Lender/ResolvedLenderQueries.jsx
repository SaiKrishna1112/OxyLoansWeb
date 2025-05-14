import React, { useEffect, useState } from "react";
import { Table, Spin, message ,Modal} from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

import Sidebar from '../../../../../SideBar/OxyloansAdminSidebar';
import Header from '../../../../../Header/OxyloansAdminHeader';

const ResolvedLenderQueries = () => {
  const [queryData, setQueryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  const fetchLenderQueries = async () => {
    setLoading(true);
    const accessToken = sessionStorage.getItem("accessToken");
    console.log({ accessToken });

    if (!accessToken) {
      console.error("Access token is missing!");
      message.error("Access token not found.");
      setLoading(false);
      return;
    }

    const requestBody = {
      pageNo: currentPage,
      pageSize: 10,
      status: "Completed",
      primaryType: "LENDER",
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

   

      const data = response?.data?.listOfUserQueryDetailsResponseDto || [];
      // const total = response?.data?.totalCount || 0;
       setTotalCount(response?.data?.lenderCount)
      const formattedData = data.map((item, index) => ({
        key: index,
        sNo: (currentPage - 1) * 10 + index + 1,
        userNewId :item.userNewId,
        mobileNumber:item.mobileNumber,
        email:item.email,
        name:item.name?.trim(),
        query: item.query,
        queryStatus: item.listOfPendingQueries?.[0]?.pendingQuereis
  ? `${item.listOfPendingQueries[0].pendingQuereis}, Status: ${item.status}`
  : `Status: ${item.status || "Unknown"}`,
         status:item.status,
        comments: item.comments,
        screenshotUrl: item.screenshotUrl,
        ticketId:item.ticketId,
        respondedOn:item.respondedOn,
       pendingQuereis: item.listOfPendingQueries?.[0]?.pendingQuereis || "No pending queries",
      resolvedBy:item.resolvedBy
      }));

      setQueryData(formattedData);
      setTotalCount(total);
    }
    
    catch (error) {
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
      })}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLenderQueries();
  }, [currentPage]);

  const columns = [
    { title: "S.No", dataIndex: "sNo", key: "sNo", width: 20 },

    {
      title: "Mobile Number & Email",
      //dataIndex: "queryData",
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
      )
    },
    {
      title: "Query",
      dataIndex: "query",
      key: "query",
      width: 230,
      render: (text) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: 300 }}>{text}</div>
      ),
    },
    {
      title: "Admin Comments & User Replies",
      // dataIndex: "queryStatus",
      key: "queryStatus",
      width: 230,
      render: (_,text) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: 300 }}>
         <div><strong>{text.resolvedBy} : </strong>{text.comments}</div>
        {/* <div><strong>Resolved By:</strong>{text.resolvedBy} </div> */}
        {/* <div><strong>Document:</strong><p>Click here </p> </div> */}

       {text.screenshotUrl !== ""? <div><strong>Document :</strong> <p 
        style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
        onClick={() => showModal(text.screenshotUrl)}
      >
        View File
      </p></div>:null}

        </div>
      ),
    },
    {
      title: "Responded On",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (_,text) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: 300 }}>
          {/* <div><strong>Status:</strong>{text.status}</div> */}
          <div><strong>Responded On:</strong>{text.respondedOn}</div>
        </div>
      ),
    },
  ];



  const showModal = (url) => {
    console.log({url})
    setImageUrl(url);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setImageUrl("");
  };

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
                  <li className="breadcrumb-item active">Lender Queries</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 overflow-y-auto h-full">
        <div className="bg-white rounded-md shadow-md p-4 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">Resolved Lender Queries</h3>
          <h6 className="text-xl font-semibold mb-4">No of Lender Resolved queries : {totalCount}</h6>

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

      <Modal
  open={isModalOpen}
  footer={null}
  onCancel={handleCancel}
  closable={false} // no default close button unless you want it
  centered
  style={{
    top: 0,
    padding: 0,
    height: '100vh',
    // width: '100vw',
    // maxWidth: '100vw',
  }}
  bodyStyle={{
    height: '100vh',
    // width: '100vw',
    padding: 0,
    overflow: 'hidden',
    backgroundColor: 'black', // optional, looks better
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
  maskStyle={{
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // darken background
  }}
  zIndex={2000} // make sure it comes above header/sidebar
>
<div style={{ position: "absolute", top: 20, right: 20, zIndex: 1000 }}>
  <button
    onClick={handleCancel}
    style={{
      background: "transparent",
      border: "none",
      fontSize: "24px",
      color: "#fff",
      cursor: "pointer",
    }}
  >
    ✖
  </button>
</div>

  <img
    src={imageUrl}
    alt="Preview"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain', // keeps aspect ratio
      borderRadius: 0,
    }}
  />
</Modal>



    </div>
  </>
  );
};

export default ResolvedLenderQueries;

const styles = {
  modalOverlay: {
    position: "fixed", top: 0, left: 0, width: "auto", height: "auto",alignSelf:"center",
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",margin:100,
    zIndex: 999,
  },
  modalContent: {
    background: "#fff", padding: 20, borderRadius: 10, width: "80%", maxWidth: "400px",
    position: "relative",
  },
  closeButton: {
    position: "absolute", top: 10, right: 10, fontSize: "1.2rem", cursor: "pointer",
  }
};
