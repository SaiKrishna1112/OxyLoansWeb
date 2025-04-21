import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Button, Select, Modal, message as AntMessage } from 'antd';
import axios from "axios";
import { PlusOutlined } from '@ant-design/icons';
import Header from "../../../../../components/Header/OxyloansAdminHeader";
import Sidebar from "../../../../../components/SideBar/OxyloansAdminSidebar";
import { handleBorrowerEmiRequest } from "../../../../HttpRequest/admin";

const { Option } = Select;
const { confirm } = Modal;

const EMI = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownValue, setDropdownValue] = useState("");
  const navigate = useNavigate();

  const handleTopDropdownChange = (value) => {
    setDropdownValue(value);
  };

  const columns = [
    {
      title: 'User Details',
      key: 'userDetails',
      width: 60,
      render: (text, record) => (
        <div style={{ fontSize: '12px' }}>
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
      width: 100,
      render: (text, record) => (
        <div style={{ fontSize: '12px' }}>
          <div><strong>Loan Amount:</strong> {record.loanAmount}</div>
          <div><strong>Loan Created Date:</strong> {record.loanCreatedDate?.substring(0, 10)}</div>
          <div><strong>Paid Amount:</strong> {record.paidAmount}</div>
          <div><strong>Pending Amount:</strong> {record.pendingAmount}</div>
          <div><strong>Loan Expire Date:</strong> {record.loanExpireDate?.substring(0, 10)}</div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (dropdownValue === "all") {
      fetchPendingUsers("all");
    }
  }, [dropdownValue]);

  const fetchPendingUsers = async (value) => {
    setLoading(true);
    try {
      const response = await handleBorrowerEmiRequest(value);
      setPendingUsers(response.data);
      setLoading(false);
      if (value === "message") {
        AntMessage.success("Message sent successfully!");
      }
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    confirm({
      title: 'Do you want to send the message?',
      content: 'Please confirm to send messages to users.',
      onOk() {
        fetchPendingUsers("message");
      },
      onCancel() {
        console.log('Cancelled sending messages.');
      },
    });
  };

  const handleAddBorrower = () => {
    navigate('/addBorrower');
  };

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <ul className="breadcrumb">
                    {/* <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li> */}
                    {/* <li className="breadcrumb-item active">EMI</li> */}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Borrower Details</h4>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddBorrower}
                    className="btn btn-light"
                  >
                    Add Borrower
                  </Button>
                </div>

                <div className="card-body">
                  <div className="mb-3 d-flex align-items-center">
                    <label className="me-2"><strong>Select View:</strong></label>
                    <Select
                      value={dropdownValue}
                      style={{ width: 200 }}
                      onChange={handleTopDropdownChange}
                      options={[
                        { label: 'Select', value: '' },
                        { label: 'All', value: 'all' },
                        { label: 'Message', value: 'message' },
                      ]}
                    />

                    {dropdownValue === 'message' && (
                      <>
                        <Button
                          type="primary"
                          onClick={handleSendMessage}
                          className="ms-3"
                          loading={loading}
                        >
                          {loading ? "Sending..." : "Send Message"}
                        </Button>
                      </>
                    )}
                  </div>

                  {dropdownValue === 'all' && (
                    <Table
                      columns={columns}
                      dataSource={pendingUsers}
                      loading={loading}
                      bordered
                      scroll={{ x: 500 }}
                      pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '30'],
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
};

export default EMI;
