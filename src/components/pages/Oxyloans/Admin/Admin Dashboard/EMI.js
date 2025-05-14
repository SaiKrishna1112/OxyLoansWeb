import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Button, Select, Modal, Spin, Checkbox } from 'antd';
import axios from "axios";
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import Header from "../../../../../components/Header/OxyloansAdminHeader";
import Sidebar from "../../../../../components/SideBar/OxyloansAdminSidebar";
import { handleBorrowerEmiRequest ,handleSendMessageNotification} from "../../../../HttpRequest/admin";
import Swal from "sweetalert2";
const { Option } = Select;


const EMI = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownValue, setDropdownValue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [pendingUsersDto, setPendingUsersDto] = useState([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const[loader,setLoader]=useState(false)
  // const[sendMessageSelectedUsers,setSendMessageSelectedUsers]

  const navigate = useNavigate();

  useEffect(() => {
    if (dropdownValue === "all" || dropdownValue === "message") {
      fetchPendingUsers();
      setShowCheckboxes(true);
    } else {
      setShowCheckboxes(false);
    }
  }, [dropdownValue]);




  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const response = await handleBorrowerEmiRequest(dropdownValue);
      setPendingUsers(response.data);
      // Initialize all checkboxes as unchecked
      const initialSelectedState = {};
      response.data.forEach(user => {
        initialSelectedState[user.userId] = false;
      });
      setSelectedUsers(initialSelectedState);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    setModalVisible(true);
    setModalAction(() => async () => {
      setLoading(true);
      setModalVisible(false);
      await fetchPendingUsers();
    });
  };

  const handleAddBorrower = () => {
    navigate('/addBorrower');
  };

  const handleCheckboxChange = (userId, mobileNumber) => {
    setSelectedUsers(prev => {
      const isChecked = !prev[userId];
  
      // Update pendingUsersDto only when checkbox is checked
      setPendingUsersDto(prevDto => {
        if (isChecked) {
          return [...prevDto, { mobileNumber }];
        } else {
          return prevDto.filter(user => user.mobileNumber !== mobileNumber);
        }
      });
  
      return {
        ...prev,
        [userId]: isChecked
      };
    });
  };


  const handleSelectAllChange = (checked) => {
    const newSelectedUsers = {};
    const newPendingUsersDto = [];
  
    pendingUsers.forEach(user => {
      newSelectedUsers[user.userId] = checked;
      if (checked) {
        newPendingUsersDto.push({ mobileNumber: user.mobileNumber });
      }
    });
  
    setSelectedUsers(newSelectedUsers);
    setPendingUsersDto(checked ? newPendingUsersDto : []);
  };
  
  
  const printSelectedMobileNumbers = async() => {
    const selectedUserIds = Object.keys(selectedUsers).filter(userId => selectedUsers[userId]);
    console.log({pendingUsersDto});
  setLoader(true)
try{
  const response = await handleSendMessageNotification(pendingUsersDto);
    setLoader(false)
    console.log(response.status)
     if (response.status == 200) {
             Swal.fire("Success!", `Message sent successfully`, "success");
             window.location.reload();
             // Refresh data after action
            //  fetchLoanData();
           } else {
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
  }
catch{

}

  }

  const columns = [
    {
      
      title: (
        dropdownValue === "message" && showCheckboxes ? (
          <div>
            <Checkbox
              checked={
                pendingUsers.length > 0 &&
                pendingUsers.every(user => selectedUsers[user.userId])
              }
              indeterminate={
                pendingUsers.some(user => selectedUsers[user.userId]) &&
                !pendingUsers.every(user => selectedUsers[user.userId])
              }
              onChange={(e) => handleSelectAllChange(e.target.checked)}
            />
            <span style={{ marginLeft: 8 }}>User Details</span>
          </div>
        ) : (
          <span>User Details</span>
        )
      ),
      
      key: 'userDetails',
      width: 250,
      render: (record) => (
        <div style={{ fontSize: '13px', lineHeight: '1.5', flexDirection: "row" }}>
          {dropdownValue=="message"?
          <>
          {showCheckboxes && (
            <div style={{ marginBottom: '5px' }}>
              <Checkbox 
                checked={selectedUsers[record.userId]} 
                onChange={() => handleCheckboxChange(record.userId,record.mobileNumber)}
              />
            </div>
          )}
          </>
          :null}
          <div><strong>User ID:</strong> {record.userId}</div>
          <div><strong>Name:</strong> {record.fullName}</div>
          <div><strong>Mobile:</strong> {record.mobileNumber}</div>
          <div><strong>Email:</strong> {record.email}</div>
        </div>
      ),
    },
    {
      title: 'Loan Details',
      key: 'loanDetails',
      width: 300,
      render: (record) => (
        <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
          <div><strong>Loan Amount:</strong> ₹{record.loanAmount}</div>
          <div><strong>Loan Created:</strong> {record.loanCreatedDate?.substring(0, 10)}</div>
          <div><strong>Paid:</strong> ₹{record.paidAmount}</div>
          <div><strong>Pending:</strong> ₹{record.pendingAmount}</div>
          <div><strong>Expires:</strong> {record.loanExpireDate?.substring(0, 10)}</div>
        </div>
      ),
    },
  ];

  // Count selected users
  const selectedCount = Object.values(selectedUsers).filter(Boolean).length;

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
                    <li className="breadcrumb-item active">Borrower EMI</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="container-fluid">
              <div className="card shadow border-0">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Borrower EMI Management</h4>
                  <Button
                    type="default"
                    icon={<PlusOutlined />}
                    onClick={handleAddBorrower}
                  >
                    Add Borrower
                  </Button>
                </div>

                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <label className="me-3 fw-bold">Select View:</label>
                    <Select
                      value={dropdownValue}
                      onChange={setDropdownValue}
                      style={{ width: 200 }}
                      placeholder="Select"
                      options={[
                        { label: 'Select', value: '' },
                        { label: 'All', value: 'all' },
                        { label: 'Message', value: "message" }
                      ]}
                    />
                    
                    {selectedCount > 0 && (
                      <Button
                        type="primary"
                        className="ms-3"
                        onClick={printSelectedMobileNumbers}
                        loading={loader}
                      >
                        Send Message ({selectedCount})
                      </Button>
                    )}
                  </div>

                  {(dropdownValue === 'all' || dropdownValue === 'message') && (
                    <Table
                      columns={columns}
                      dataSource={pendingUsers}
                      loading={loading}
                      rowKey="userId"
                      bordered
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                      }}
                      scroll={{ x: true }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          title="Confirm Message"
          visible={modalVisible}
          onOk={() => modalAction()}
          onCancel={() => setModalVisible(false)}
          okText="Yes, Send"
          cancelText="Cancel"
        >
          <p>Are you sure you want to send the message to all borrowers?</p>
        </Modal>
      </div>
    </>
  );
};

export default EMI;