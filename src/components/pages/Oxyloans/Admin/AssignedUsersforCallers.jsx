import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  Input,
  Button,
  Tag,
  Space,
  Typography,
  Card,
  message,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  UserSwitchOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import {  Spinner } from 'react-bootstrap';

import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import { Modal } from "react-bootstrap";
import {
    AssignedDataforUser,
} from "../../../HttpRequest/admin";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AssignedUsersforCallers = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

 const [dots, setDots] = useState('');
  const [usersList, setUserList] = useState([]); // FIXED: Initialize as array
  const[assignedUsersCount,setAssignedUsersCount]=useState()
    // const [currentPage, setCurrentPage] = useState(1);
    // const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  });


  const columns = [
    {
      title: "User Details",
      key: "userName",
      render: (_, record) => (
        <div>
          <div>{record?.userName .toUpperCase()|| "N/A"}</div>
          <div><strong>USER ID :</strong> {record?.userId}</div>
          <div>
  <strong>Registered On :</strong>{" "}
  {record?.registered_on
    ? new Date(record.registered_on).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata", // IST timezone
      })
    : "N/A"}
</div>

        </div>
      ),
    },
    {
      title: "Email",
      key: "email",
      render: (_, record) => (
        <div>
          <div> {record?.email || "N/A"}</div>
        </div>
      ),
    },
    {
      title: "Mobile Number",
      key: "mobileNumber",
      render: (_, record) => (
        <div>
          <div><strong>{record?.mobileNumber}</strong></div>
          <div><strong>Mobile Verified : {record?.mobileVerified}</strong></div>

        </div>
      ),
    },
  
  ];
  

  useEffect(() => {
    dataforuser();
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);    
    return () => clearInterval(interval);
  }, [pagination.current, pagination.pageSize]);

    const dataforuser = async () => {
      try {
        const page = {
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        };
        const response = await AssignedDataforUser(page);
        console.log(response.response.data)
        if(response.response.status){
          setUserList(Array.isArray(response.data.activeUsersResponse) ? response.data.activeUsersResponse : []); // Ensure it's an array
          console.log("response",response.data.activeUsersResponse)
          setAssignedUsersCount(response.data)
          setTotalCount(response.data.setTotalCount)
        }
        else{
                  if (response.response.status == 401) {
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: response.response.data.errorMessage,
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
                      text: response.response.data.errorMessage,
                      confirmButtonText: "OK",
                    });
                  }
        }
      
        
      } catch (error) {
        setUserList([]);
      }
    };

  const handleTableChange = (paginationInfo) => {
    setPagination({
      ...pagination,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    });
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <Card>
            {/* <Title level={4}>Lender Loan Applications</Title> */}

            <div>
  <h4>Assigned Users</h4>
</div>
{/* <div className="yellow-header-table">
<Table
                columns={columns}
                dataSource={usersList}
                rowKey={(record) => record.id || Math.random().toString()}
                pagination={pagination}
                onChange={handleTableChange}
              />
</div> */}

<Table
  columns={columns.map((col) => ({
    ...col,
    onCell: () => ({
      style: {
        border: '1px solid #dee2e6',
      },
    }),
    onHeaderCell: () => ({
      style: {
        backgroundColor: 'green',
        color: 'white',
        border: '1px solid #dee2e6',
        fontWeight: 'bold',
      },
    }),
  }))}
  dataSource={usersList}
  rowKey={(record) => record.id || Math.random().toString()}
  // pagination={pagination}
  pagination={{
    current: currentPage,
    pageSize :10,
    total: totalCount,
    onChange:(page)=> setCurrentPage(page),
    showSizeChanger: false,
    showLessItems: true, 
  }}
  bordered
  onChange={handleTableChange}
/>

          </Card>
        </div>


      </div>
    </div>
  );
};

export default AssignedUsersforCallers;