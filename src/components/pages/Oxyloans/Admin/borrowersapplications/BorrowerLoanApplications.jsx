import React, { useEffect, useState } from "react";
import { Table, Select, Input, Button, Tag, Space, Typography, Card, message, } from "antd";
import {  Spinner } from 'react-bootstrap';

import { EyeOutlined, EditOutlined, UserSwitchOutlined, CommentOutlined,FileSearchOutlined  } from "@ant-design/icons";
import { commentsAdminApiCall, searchCall, handleChangePrimaryType, handleInterestStatus, adminBorrowerSecureInfo, calculateRoiBasedOnCibilScore } from "../../../../HttpRequest/admin";
import Swal from 'sweetalert2';
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { base_url } from "../../../../HttpRequest/afterlogin";
import { Modal,  Form } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title, Text } = Typography;

const BorrowerLoanApplications = () => {
  const [dropdownValue, setDropdownValue] = useState("Choose");
  const [inputValue, setInputValue] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord,setSelectedRecord]=useState(null);
  // const [show, setShow] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const[commentsAdmin,setCommentsAdmin]=useState(false);
  const [borrowerCommentsDetails, setborrowerCommentsDetails] = useState(null);
  const [selectedCommentIndex, setSelectedCommentIndex] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
    const [interestStatus, setInterestStatus] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyForm, setVerifyForm] = useState({ verifiedMonthIncome: "", cibilScore: "", adminComments: "", verificationStatus: "VERIFIED" });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [roiResult, setRoiResult] = useState(null);

  const pageSize = 10; // Fixed page size
  const navigate = useNavigate();

  const [show, setShow] = useState(false);

  const handleClose = () => { setShow(false); setCommentsAdmin(false); setInterestStatus(false); setShowVerifyModal(false); };
  
  const [formData, setFormData] = useState({
    location: "",
    locationResidence: "",
    companyName: "",
    companyResidence: "",
    role: "",
    loanRequirement: "",
    emi: "",
    salary: "",
    eligibility: "",
    cibilPassword: "",
    comments: "",
    commentedBy: "",
    aadharPassword: "",
    panPassword: "",
    bankPassword: "",
    payslipsPassword: ""
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleviewAdmin = async (data) => {
    console.log(data);
    console.log("View Admin clicked");
    setShow(true);

    try {
      const response = await commentsAdminApiCall(data);

      if (response && response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Admin comment submitted successfully!',
          confirmButtonColor: '#3085d6',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while submitting the comment.',
        });
      }
      
      console.log(response);

    } catch (error) {
      console.error("API call failed", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send comment. Please try again later.',
      });
    }
  };

  const accessToken = sessionStorage.getItem("accessToken");
  const userId = sessionStorage.getItem("userId") || "9652";

  useEffect(() => {
    fetchLoanData(currentPage);
  }, [currentPage]); // Fetch data when current page changes

  const fetchLoanData = async () => {
    try {
      setLoading(true);
      
      // Create a payload that includes simple pagination
      const payload = {
        leftOperand: {
          fieldName: "userPrimaryType",
          fieldValue: "BORROWER",
          operator: "EQUALS",
        },
        logicalOperator: "AND",
        rightOperand: {
          leftOperand: {
            fieldName: "parentRequestId",
            operator: "NULL",
          },
          logicalOperator: "AND",
          rightOperand: {
            leftOperand: {
              fieldName: "loanStatus",
              fieldValue: "Requested",
              operator: "EQUALS",
            },
            logicalOperator: "OR",
            rightOperand: {
              fieldName: "loanStatus",
              fieldValue: "Edit",
              operator: "EQUALS",
            },
          },
        },
        page: {
          pageNo: currentPage,
          pageSize: 10,
        },
        sortBy: "loanRequestedDate",
        sortOrder: "DESC",
      };
      
      const response = await searchCall(payload);
      console.log("response", response);
      if(response.status === 200) {
      setLoanData(response.data.results || []);
      
      // Update total count from response
      if (response.data.totalCount) {
        setTotalItems(response.data.totalCount);
      }
    }
    else{
    // console.log("jhdgf")
    if(response.response.status==401){
      Swal.fire({
         icon: 'error',
         title: 'Oops...',
         text: response.response.data.errorMessage,
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
           }
           else{
     Swal.fire({
       icon: 'error',
       title: 'Oops...',
       text: response.response.data.errorMessage,
       confirmButtonText: 'OK',
     })
           }
    }
    } catch (error) {
      console.error("Failed to fetch loan data:", error);
      message.error("Failed to load loan applications");
     
     
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (value) => {
    setDropdownValue(value);
    setShowInput(true);
    setInputValue("");
    setInputValue2("");
  };

  const buildFilter = () => {
    console.log("dropdownValue", dropdownValue);
  
    switch (dropdownValue) {
      case "Name":
        return {
          filter: {
            leftOperand: {
              logicalOperator: "AND",
              rightOperand: {
                logicalOperator: "OR",
                rightOperand: {
                  fieldName: "user.personalDetails.firstName",
                  operator: "LIKE",
                  fieldValue: inputValue,
                },
                leftOperand: {
                  fieldName: "user.personalDetails.lastName",
                  operator: "LIKE",
                  fieldValue: inputValue,
                },
              },
              leftOperand: {
                fieldName: "userPrimaryType",
                fieldValue: "BORROWER",
                operator: "EQUALS",
              },
            },
            logicalOperator: "AND",
            rightOperand: {
              fieldName: "parentRequestId",
              operator: "NULL",
            },
          },
          page: { pageNo: 1, pageSize: 10 },
          sortBy: "loanRequestedDate",
          sortOrder: "DESC",
        };
  
      case "BorrowerId":
        return {
          filter: {
            leftOperand: {
              fieldName: "userId",
              fieldValue: inputValue,
              operator: "EQUALS",
            },
            logicalOperator: "AND",
            rightOperand: {
              leftOperand: {
                fieldName: "parentRequestId",
                operator: "NULL",
              },
              logicalOperator: "AND",
              rightOperand: {
                leftOperand: {
                  fieldName: "loanStatus",
                  fieldValue: "Requested",
                  operator: "EQUALS",
                },
                logicalOperator: "OR",
                rightOperand: {
                  fieldName: "loanStatus",
                  fieldValue: "Edit",
                  operator: "EQUALS",
                },
              },
            },
          },
        };
  
      case "MobileNumber":
        return {
          filter: {
            leftOperand: {
              fieldName: "user.mobileNumber",
              fieldValue: inputValue,
              operator: "EQUALS",
            },
            logicalOperator: "AND",
            rightOperand: {
              leftOperand: {
                fieldName: "parentRequestId",
                operator: "NULL",
              },
              logicalOperator: "OR",
              rightOperand: {
                fieldName: "parentRequestId",
                operator: "NOT_NULL",
              },
            },
          },
          page: { pageNo: 1, pageSize: 10 },
          sortBy: "loanRequestedDate",
          sortOrder: "DESC",
        };
  
      default:
        return {}; // fallback if no matching case
    }
  };
  

  const handleSearch = async () => {
    if (!accessToken) {
      message.error("Missing access token");
      return;
    }
    
    setLoading(true);
    const payload = buildFilter();
    console.log("Payload:", payload);
    try {
      const response = await searchCall(payload.filter);
      setLoanData(response.data.results || []);
      
      // Update total count
      if (response.data.totalCount) {
        setTotalItems(response.data.totalCount);
      }
    } catch (error) {
      console.error("API Error:", error);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };





  // Fixed the handlePageChange function
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLoanData(); // This will use the updated currentPage state
  };

  const viewDetails = async (record) => {
    console.log("View details for:", record);
    setSelectedRecord(record);
    // console.log("Selected Record:", selectedRecord);
    setShow(true);
    // Implement view details functionality
  };

  const viewDetailsBorrower = async (record) => {
     console.log("View details for:", record);
    navigate(`/borrowerDocuments/${record.userDisplayId}`)
  }

    const changetoLender = async () => {
      if (selectedRecord) {
        try {
          setIsLoading(true);

          const response = await handleChangePrimaryType(selectedRecord,"LENDER");
          console.log("response", response);
          setIsLoading(false);

          setShow(false);
          Swal.fire(
            "Success!",
            `The user has been successfully changed to a LENDER.`,
            "success"
          );
          
          // Refresh data after action
          fetchLoanData();
        } catch (error) {
          setIsLoading(false);

          console.error("Error in changing to borrower:", error);
        }
      }
    };
  


  const interestedStatus = (record) => {
    console.log("Change user status for:", record);
    setSelectedRecord(record);
    setInterestStatus(true);
    // Implement status change functionality
  };


    const InterestedStatusFunc = async () => {
      if (selectedRecord) {
        try {
          const response = await handleInterestStatus(selectedRecord);
          console.log("response", response);
          setInterestStatus(false);
          
          // Refresh data after action
          fetchLoanData();
        } catch (error) {
          console.error("Error in changing interest status:", error);
          setInterestStatus(false);
        }
      }
    };

  const changeUserStatus = (record) => {
    console.log("Change user status for:", record);
  };

  const openVerifyModal = (record) => {
    setSelectedRecord(record);
    setVerifyForm({ verifiedMonthIncome: "", cibilScore: "", adminComments: "", verificationStatus: "VERIFIED" });
    setRoiResult(null);
    setShowVerifyModal(true);
  };

  const handleVerifySubmit = async () => {
    if (!selectedRecord) return;
    setVerifyLoading(true);
    setRoiResult(null);
    try {
      const response = await adminBorrowerSecureInfo({
        userId: String(selectedRecord.userDisplayId),
        verifiedMonthIncome: verifyForm.verifiedMonthIncome,
        cibilScore: verifyForm.cibilScore,
        adminComments: verifyForm.adminComments,
        userType: "ADMIN",
        verificationStatus: verifyForm.verificationStatus,
      });
      if (response?.status === 200) {
        // Only call ROI calculation if status is VERIFIED
        if (verifyForm.verificationStatus === "VERIFIED") {
          const roiRes = await calculateRoiBasedOnCibilScore(
            verifyForm.cibilScore,
            selectedRecord.userDisplayId
          );
          if (roiRes?.status === 200) {
            setRoiResult(roiRes.data);
          } else {
            Swal.fire({ icon: "success", title: "Success!", text: "Borrower verified. ROI calculation unavailable.", confirmButtonColor: "#3085d6" });
            setShowVerifyModal(false);
          }
        } else {
          Swal.fire({ icon: "success", title: "Success!", text: `Borrower status updated to ${verifyForm.verificationStatus}.`, confirmButtonColor: "#3085d6" });
          setShowVerifyModal(false);
        }
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: response?.response?.data?.errorMessage || "Something went wrong." });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: "Request failed. Please try again." });
    } finally {
      setVerifyLoading(false);
    }
  };

  const viewComments = (record) => {
    console.log("View comments for:", record);
    // Implement comments view functionality
  };
  
  const viewAdmin = (record) => {
    console.log("View Admin Comments:", record);
  };
  
  const viewCibil = (record) => {
    console.log("cibil:", record);
  };
  
  const viewUpload = (record) => {
    setSelectedRow(record); // Assuming `record` contains the relevant data
    setShowComments(!showComments); // Toggle the visibility of the comment fields
  };

  const ViewTheComments = (index, data) => {
    if (index === selectedCommentIndex) {
      // Clicking again hides the comment
      setSelectedCommentIndex(null);
      setborrowerCommentsDetails(null);
    } else {
      setSelectedCommentIndex(index);
      setborrowerCommentsDetails(data[index]?.borrowerCommentsDetails);
    }
  };

  const columns = [
    {
      title: "Borrower Info",
      key: "borrowerInfo",
      render: (_, record) => (
        <div>
          <div>BR{record.borrowerUser?.id || "N/A"}</div>
          <div><strong>Status:</strong>{record.borrowerUser?.status}</div>
          <div><strong>Regd Date:</strong> {record.loanRequestedDate || "N/A"}</div>
          <div><strong>Exp Date:</strong> {record.expectedDate || "N/A"}</div>
          {record.cifNo && <div><strong>CIF NO:</strong> {record.cifNo}</div>}
        </div>
      ),
    },
    {
      title: "Name & Mobile",
      key: "nameAndMobile",
      render: (_, record) => (
        <div>
          <div>
            <strong>
              {record.user?.firstName || ""} {record.user?.lastName || ""}
            </strong>
          </div>
          <div><strong>Mob:</strong>{record.user?.mobileNumber || "N/A"}</div>
          {record.utmSource && (
            <div>
              <strong>UTM SOURCE:</strong> {record.utmSource}
            </div>
          )}
          {record.user?.oxyScore && (
            <div>
              <strong>OXY SCORE:</strong> {record.user.oxyScore}
            </div>
          )}
          {record.user?.panNumber && (
            <div>
              <strong>PAN:</strong> {record.user.panNumber}
            </div>
          )}
          {record.user?.dob && (
            <div>
              <strong>DOB:</strong> {record.user.dob}
            </div>
          )}
        </div>
      ),
    },
    
    {
      title: "Email & Address",
      key: "emailAndAddress",
      render: (_, record) => (
        <div>
          <div><strong>Email:</strong>{record.user?.email || "N/A"}</div>
          <div><strong>Address:</strong>{record.user?.address || "N/A"}</div>
          <div><strong>Bank Account:</strong> {record.bankAccount ? "Available" : "Not Available"}</div>
        </div>
      ),
    },
    {
      title: "Amount & ROI",
      key: "amountAndRoi",
      render: (_, record) => (
        <div>
          <div><strong>INR₹{record.loanRequestAmount?.toLocaleString() || "0"}</strong></div>
          <div><strong>ROI:</strong> {record.rateOfInterest || 0}%</div>
          <div><strong>Duration:</strong> {record.duration} {record.durationType}</div>
          <div><strong>Repayment:</strong> {record.repaymentMethod === "I" ? "Monthly" : record.repaymentMethod}</div>
        </div>
      ),
    },
   
    // {
    //   title: "View Documents",
    //   key: "viewDocuments",
    //   render: (_, record) => (
    //     <div>

    //     </div>
    //   ),
    // },
    {
      title: "Comments",
      key: "comments",
      render: (_, record, index) => (
        <div>
          <Space
            size="small"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' , textAlign:'center' }}
          >
            <Button
              type="primary"
              icon={<CommentOutlined style={{textAlign:'center'}}/>}
              size="small"
              onClick={() => {
                viewAdmin(record);
                setCommentsAdmin(!commentsAdmin);
                localStorage.setItem("admincomment", record.id);
              }}
            >
              Comments by Admin
            </Button>
    
            <Button
              icon={<UserSwitchOutlined />}
              size="small"
              onClick={() => {
                setIsUploadModalOpen(true);
                setSelectedRecord(record);
              }}
            >
              Upload Cibil
            </Button>
    
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => ViewTheComments(index, loanData)}
            >
              Click here to View the Comments
            </Button>
    
            {/* Render comment block conditionally */}
            {selectedCommentIndex === index && borrowerCommentsDetails && (
              <div style={{ backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "6px" }}>
                <p><strong>Location:</strong> {borrowerCommentsDetails.location || "N/A"}</p>
                <p><strong>Residence Address:</strong> {borrowerCommentsDetails.locationResidence || "N/A"}</p>
                <p><strong>Company Name:</strong> {borrowerCommentsDetails.companyName || "N/A"}</p>
                <p><strong>Company Address:</strong> {borrowerCommentsDetails.companyResidence || "N/A"}</p>
                <p><strong>Role:</strong> {borrowerCommentsDetails.role || "N/A"}</p>
                <p><strong>Loan Requirement:</strong> {borrowerCommentsDetails.loanRequirement ?? "N/A"}</p>
                <p><strong>Salary:</strong> {borrowerCommentsDetails.salary ?? "N/A"}</p>
                <p><strong>Loan Eligibility:</strong> {borrowerCommentsDetails.eligibility ?? "N/A"}</p>
                <p><strong>Current EMIs:</strong> {borrowerCommentsDetails.emi ?? "N/A"}</p>
                <p><strong>PAN Password:</strong> {borrowerCommentsDetails.panPassword || "N/A"}</p>
                <p><strong>Payslips Password:</strong> {borrowerCommentsDetails.payslipsPassword || "N/A"}</p>
                <p><strong>Aadhar Password:</strong> {borrowerCommentsDetails.aadharPassword || "N/A"}</p>
                <p><strong>Bank Password:</strong> {borrowerCommentsDetails.bankPassword || "N/A"}</p>
                <p><strong>Cibil Password:</strong> {borrowerCommentsDetails.cibilPassword || "N/A"}</p>
                <p><strong>Comments:</strong> {borrowerCommentsDetails.comments || "N/A"}</p>
              </div>
            )}
          </Space>
        </div>
      ),
    },
    
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small" style={{display:'flex', flexDirection:'column'}}>
          <Button 
            type="primary" 
            icon={<FileSearchOutlined />} 
            size="small"
            onClick={() => viewDetailsBorrower(record)}
          >
            View Documents
          </Button>
          <Button 
            type="primary" 
            icon={<UserSwitchOutlined />} 
            size="small"
            onClick={() => viewDetails(record)}
          >
            Change to Lender
          </Button>
          <Button 
            icon={<CommentOutlined />} 
            size="small"
            onClick={() => interestedStatus(record)}
          >
            Interested
          </Button>
          <Button 
            type="default" 
            icon={<UserSwitchOutlined />} 
            size="small"
            onClick={() => changeUserStatus(record)}
          >
            View Experian Report
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openVerifyModal(record)}
          >
            Verify Borrower
          </Button>
        </Space>
      ),
    },
  ];

  const filterOptions = [
    { value: "Choose", label: "Choose" },
    { value: "Name", label: "Name" },
    { value: "BorrowerId", label: "Borrower Id" },
    // { value: "ROI", label: "ROI" },
    // { value: "Amount", label: "Amount" },
    // { value: "AmountCity", label: "Amount & City" },
    // { value: "City", label: "City" },
    { value: "MobileNumber", label: "Mobile Number" },
    // { value: "OxyScore", label: "OxyScore" },
    // { value: "UTM", label: "UTM" },
    // { value: "UTMAmount", label: "UTM & Amount" },
    // { value: "UTMCity", label: "UTM & City" },
    // { value: "PanNumber", label: "Pan Number" },
  ];

  const uploadCibilFile = async (recordId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("loanId", recordId); // Modify according to backend requirement
  
    try {
      const response = await fetch(`${base_url}/api/upload-cibil`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        message.success("CIBIL file uploaded successfully!");
        console.log("Response:", data);
      } else {
        message.error("Failed to upload CIBIL file.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      message.error("Something went wrong!");
    }
  };
  
  return (
    <div className="main-wrapper">
      <OxyloansAdminSidebar />
      <OxyloansAdminHeader />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <Card>
            <Title level={4}>Borrower Loan Applications</Title>
  
            <div className="mb-4 flex items-center">
              <Select
                style={{ width: 160, marginRight: 8 }}
                value={dropdownValue}
                onChange={handleDropdownChange}
              >
                {filterOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
  
              {showInput && (
                <>
                  <Input
                    style={{ width: 200, marginRight: 8 }}
                    placeholder={`Enter ${dropdownValue}`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  {(dropdownValue.includes("&") ||
                    dropdownValue.includes("AmountCity") ||
                    dropdownValue.includes("UTM")) && (
                    <Input
                      style={{ width: 200, marginRight: 8 }}
                      placeholder={`Enter Second Value`}
                      value={inputValue2}
                      onChange={(e) => setInputValue2(e.target.value)}
                    />
                  )}
                </>
              )}
  
              <Button
                type="primary"
                onClick={handleSearch}
                loading={loading}
              >
                Search
              </Button>
            </div>
  
            <Table
              columns={columns}
              dataSource={loanData}
              rowKey={(record) => record.id || Math.random().toString()}
              pagination={{
                current: currentPage,
                pageSize: 10,
                total: totalItems,
                onChange: handlePageChange,
                showLessItems: true,
                showSizeChanger: false
              }}
              loading={loading}
              bordered
              scroll={{ x: 1000 }}
            />
          </Card>
        </div>
      </div>
  
      {/* Admin Comments Modal */}
      <Modal show={commentsAdmin} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Required Fields</Modal.Title>
        </Modal.Header>
  
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
            <Form.Label>Location</Form.Label>
              <Form.Control
                name="location"
                placeholder="Enter location"
                value={formData.location}
                onChange={handleChange}
              />
            </Form.Group>
          
            <Form.Group className="mb-2">
            <Form.Label>Company Name</Form.Label>
              <Form.Control
                name="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
            <Form.Label>Role</Form.Label>
              <Form.Control
                name="role"
                placeholder="Enter Role "
                value={formData.role}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
            <Form.Label>Salary</Form.Label>
              <Form.Control
                name="salary"
                placeholder="Enter salary"
                value={formData.salary}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-2">
            <Form.Label>Cibil Password</Form.Label>
              <Form.Control
                name="cibilPassword"
                placeholder="Enter cibil password"
                value={formData.cibilPassword}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
            <Form.Label>Pan Password</Form.Label>
              <Form.Control
                name="panPassword"
                placeholder="Enter pan password"
                value={formData.panPassword}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-2">
            <Form.Label>Payslips Password</Form.Label>
              <Form.Control
                name="payslipsPassword"
                placeholder="Enter Payslips Password"
                value={formData.payslipsPassword}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
            <Form.Label>Comments</Form.Label>
              <Form.Control
                name="comments"
                placeholder="Enter comments"
                value={formData.comments}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
            <Form.Label>Residence Address</Form.Label>
            <Form.Control
              name="locationResidence"
              placeholder="Enter Residence Address"
              value={formData.locationResidence}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
          <Form.Label>Company Address</Form.Label>
            <Form.Control
              name="companyResidence"
              placeholder="Enter Company Address"
              value={formData.companyResidence}
              onChange={handleChange}
            />
          </Form.Group>
            
            <Form.Group className="mb-2">
            <Form.Label>Loan Requirement</Form.Label>
              <Form.Control
                name="loanRequirement"
                placeholder="Enter Loan requirement"
                value={formData.loanRequirement}
                onChange={handleChange}
              />
            </Form.Group>
  
            <Form.Group className="mb-2">
            <Form.Label>Loan Eligibility</Form.Label>
              <Form.Control
                name="eligibility"
                placeholder="Enter Loan Eligibility"
                value={formData.eligibility}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
            <Form.Label>Aadhar Password</Form.Label>
              <Form.Control
                name="aadharPassword"
                placeholder="Aadhar Password"
                value={formData.aadharPassword}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
            <Form.Label>Bank Statement Password</Form.Label>
              <Form.Control
                name="bankPassword"
                placeholder="Enter Bank Statement Password"
                value={formData.bankPassword}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
            <Form.Label>Current Emi</Form.Label>
              <Form.Control
                name="emi"
                placeholder="Current Emi"
                value={formData.emi}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Commented By</Form.Label>
              <Form.Select
                name="commentedBy"
                value={formData.commentedBy}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Admin">Admin</option>
                <option value="Agent">Jyothi</option>
                <option value="Support">Hema</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
  
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            handleviewAdmin(formData); 
            console.log(formData);
          }}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload CIBIL Modal */}
      <Modal show={isUploadModalOpen} onHide={() => setIsUploadModalOpen(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Upload CIBIL Report</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select CIBIL File</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              {selectedFile && (
                <p className="mt-2"><strong>Selected File:</strong> {selectedFile.name}</p>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (selectedFile && selectedRecord) {
                uploadCibilFile(selectedRecord.id, selectedFile);
                setIsUploadModalOpen(false);
              } else {
                message.warning("Please select a file first");
              }
            }}
          >
            Upload
          </Button>
        </Modal.Footer>
      </Modal>

        {/* Change To Lender */}
              <Modal show={show} onHide={handleClose} top>
                <Modal.Header closeButton>
                  <Modal.Title>Confirmation</Modal.Title>
                </Modal.Header>
      
                <Modal.Body>
                  <p>Are you sure you want to change to Lender?</p>
                </Modal.Body>
      
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    No
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      changetoLender();
                      // Perform some action
                    }}
                  >
                    {/* Yes */}
                    {isLoading ? (
            <>
              <Spinner animation="border" size="sm" /> Processing...
            </>
          ) : (
            'Yes'
          )}
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Verify Borrower Modal */}
      <Modal show={showVerifyModal} onHide={handleClose} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Verify Borrower — {selectedRecord?.user?.firstName} {selectedRecord?.user?.lastName} (ID: {selectedRecord?.userDisplayId})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {roiResult ? (
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              {/* Status banner */}
              <div style={{
                background: roiResult.status === "ELIGIBLE_LOW_INTEREST" ? "linear-gradient(135deg,#1a7a4a,#28a745)" :
                  roiResult.status === "ELIGIBLE_HIGH_INTEREST" ? "linear-gradient(135deg,#b45309,#f59e0b)" :
                  "linear-gradient(135deg,#991b1b,#dc3545)",
                borderRadius: 14, padding: "20px 24px 16px", color: "#fff", marginBottom: 20,
                boxShadow: "0 6px 24px rgba(0,0,0,0.13)"
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, opacity: 0.85, marginBottom: 6 }}>ELIGIBILITY STATUS</div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.5, marginBottom: 4 }}>
                  {roiResult.status?.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>User ID: {roiResult.userId}</div>
              </div>

              {/* Metrics row */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                {[
                  { label: "CIBIL Score", value: roiResult.cibilScore, icon: "fa-bar-chart", color: "#3d5ee1" },
                  { label: "Rate of Interest", value: `${roiResult.roi}%`, icon: "fa-percent", color: "#28a745" },
                  { label: "Record ID", value: `#${roiResult.id}`, icon: "fa-hashtag", color: "#6c757d" },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} style={{
                    flex: "1 1 120px", background: "#f8f9fa", borderRadius: 10, padding: "14px 10px",
                    border: `1.5px solid ${color}22`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                  }}>
                    <i className={`fa ${icon}`} style={{ fontSize: 20, color, marginBottom: 6, display: "block" }} />
                    <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 11, color: "#6c757d", marginTop: 4, fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ borderRadius: 20, padding: "5px 22px", fontSize: 12 }}
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Verified Monthly Income</Form.Label>
                <Form.Control
                  placeholder="e.g. 15000"
                  value={verifyForm.verifiedMonthIncome}
                  onChange={(e) => setVerifyForm((p) => ({ ...p, verifiedMonthIncome: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>CIBIL Score</Form.Label>
                <Form.Control
                  placeholder="e.g. 750"
                  value={verifyForm.cibilScore}
                  onChange={(e) => setVerifyForm((p) => ({ ...p, cibilScore: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Admin Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter comments"
                  value={verifyForm.adminComments}
                  onChange={(e) => setVerifyForm((p) => ({ ...p, adminComments: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Verification Status</Form.Label>
                <Form.Select
                  value={verifyForm.verificationStatus}
                  onChange={(e) => setVerifyForm((p) => ({ ...p, verificationStatus: e.target.value }))}
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="HOLD">HOLD</option>
                  <option value="REJECTED">REJECTED</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        {!roiResult && (
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" onClick={handleVerifySubmit} disabled={verifyLoading}>
              {verifyLoading ? <><Spinner animation="border" size="sm" /> Submitting...</> : "Submit"}
            </Button>
          </Modal.Footer>
        )}
      </Modal>

        {/* Interest Status */}
                      <Modal show={interestStatus} onHide={handleClose} top size="sm">
                        <Modal.Header closeButton>
                          <Modal.Title>Confirmation</Modal.Title>
                        </Modal.Header>
              
                        <Modal.Body>
                          <p>Are you sure?</p>
                        </Modal.Body>
              
                        <Modal.Footer>
                          <Button variant="secondary" onClick={handleClose}>
                            No
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => {
                              InterestedStatusFunc();
                              // Perform some action
                            }}
                          >
                            Yes
                          </Button>
                        </Modal.Footer>
                      </Modal>
    </div>
  );
};  

export default BorrowerLoanApplications