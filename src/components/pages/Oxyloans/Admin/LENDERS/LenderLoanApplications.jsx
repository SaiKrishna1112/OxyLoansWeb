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

import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { Modal } from "react-bootstrap";
import {
  searchCallLender,
  handleChangePrimaryType,
  handleChangeToTestUser,
  handleInterestStatus,
  handleComments,
  handlegetComments,
  handleupdatedob,
  handleSendStatement,
  handleEmiUpdateComments,
} from "../../../../HttpRequest/admin";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title, Text } = Typography;

const LenderLoanApplications = () => {
  const [dropdownValue, setDropdownValue] = useState("Choose");
  const [inputValue, setInputValue] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Initialize pagination with fixed settings
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  });
  
  const [show, setShow] = useState(false);
  const [changeToTest, setChangeToTest] = useState(false);
  const [interestStatus, setInterestStatus] = useState(false);
  const [comments, setComments] = useState("");
  const[getComments,setGetComments]=useState([])
  const [showComments, setShowComments] = useState(false);
  const [dobModal, setDobModal] = useState(false);
  const [userDob, setUserDob] = useState("");
  const [actualDob, setActualDob] = useState("");

  const handleClose = () => {
    setShow(false);
    setChangeToTest(false),
      setInterestStatus(false),
      setShowComments(false),
      setDobModal(false);
  };

  const accessToken = sessionStorage.getItem("accessToken");
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchLoanData();
  }, [pagination.current, pagination.pageSize]); // Trigger fetch when pagination changes

  const fetchLoanData = async () => {
    console.log("pagination",pagination.pageSize,pagination.current)
    try {
      setLoading(true);
      // Create the payload with pagination parameters
      const payload = {
        leftOperand: {
          fieldName: "userPrimaryType",
          fieldValue: "LENDER",
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
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        },
        sortBy: "loanRequestedDate",
        sortOrder: "DESC",
      };
      
      const response = await searchCallLender(payload);
      // console.log("response", response.data.results);
      
      if (response.status == 200) {
        setLoanData(response.data.results || []);
        setTotalCount(response.data?.totalCount || 0);

        // Update pagination if available in response
        if (response.data.totalElements) {
          setPagination((prev) => ({
            ...prev,
            total: response.data.totalElements,
          }));
        }
      } 
      else {
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

  // const buildFilter = () => {
  //   switch (dropdownValue) {
  //     case "Name":
  //       return {
  //         leftOperand: {
  //           fieldName: "user.personalDetails.firstName",
  //           fieldValue: inputValue,
  //           operator: "LIKE",
  //         },
  //         logicalOperator: "OR",
  //         rightOperand: {
  //           fieldName: "user.personalDetails.lastName",
  //           fieldValue: inputValue,
  //           operator: "LIKE",
            
  //         },
  //       };
  //     case "LenderId":
  //       return {
  //         fieldName: "user.id",
  //         fieldValue: inputValue,
  //         operator: "EQUALS",
  //       };

  //       case "MobileNumber":
  //       return {
  //         fieldName: "user.mobileNumber",
  //         fieldValue: inputValue,
  //         operator: "EQUALS",
  //       };
    
  //     default:
  //       return {};
  //   }
  // };

  const buildFilter = () => {
    const baseFilter = {
      leftOperand: {
        fieldName: "userPrimaryType",
        fieldValue: "LENDER", // changed from BORROWER to LENDER
        operator: "EQUALS",
      },
      logicalOperator: "AND",
      rightOperand: {
        fieldName: "parentRequestId",
        operator: "NULL",
      },
    };
  
    switch (dropdownValue) {
      case "Name":
        return {
          leftOperand: baseFilter,
          logicalOperator: "AND",
          rightOperand: {
            leftOperand: {
              fieldName: "user.personalDetails.firstName",
              fieldValue: inputValue,
              operator: "LIKE",
            },
            logicalOperator: "OR",
            rightOperand: {
              fieldName: "user.personalDetails.lastName",
              fieldValue: inputValue,
              operator: "LIKE",
            },
          },
        };
  
      case "LenderId": // you can rename this in dropdown to match
        return {
          leftOperand: baseFilter,
          logicalOperator: "AND",
          rightOperand: {
            fieldName: "user.id",
            fieldValue: inputValue.replace(/\D/g, ""),
            operator: "EQUALS",
          },
        };
  
      case "MobileNumber":
        return {
          leftOperand: baseFilter,
          logicalOperator: "AND",
          rightOperand: {
            fieldName: "user.mobileNumber",
            fieldValue: inputValue,
            operator: "EQUALS",
          },
        };
  
      default:
        return baseFilter;
    }
  };
  
  const handleSearch = async () => {
    if (!accessToken) {
      message.error("Missing access token");
      return;
    }

    setLoading(true);
    const filter = buildFilter();

    // Reset pagination to first page when searching
    setPagination(prev => ({
      ...prev,
      current: 1
    }));

    const payload = {
      leftOperand: {
        fieldName: "userPrimaryType",
        fieldValue: "LENDER",
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
        pageNo: pagination.current, // Starting from first page on new search
        pageSize: 10,
      },
      sortBy: "loanRequestedDate",
      sortOrder: "DESC",
    };

    // Merge filter into the leftOperand chain
    if (filter.fieldName || filter.leftOperand) {
      payload.leftOperand = {
        leftOperand: payload.leftOperand,
        logicalOperator: "AND",
        rightOperand: filter,
      };
    }

    try {
      const response = await searchCallLender(payload);
      console.log("searchCallLender response", response);

      setLoanData(response.data.results || []);
      // Update pagination
      if (response.data.totalElements) {
        setPagination((prev) => ({
          ...prev,
          total: response.data.totalElements,
          current: 1, // Reset to first page
        }));
      }
    } catch (error) {
      console.error("API Error:", error);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    console.log("Pagination changed:", paginationInfo);
    setPagination({
      ...pagination,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    });
    // fetchLoanData will be triggered by the useEffect hook
  };

  const viewDetails = async (record) => {
    console.log("View details for:", record);
    setSelectedRecord(record);
    setShow(true);
    // Implement view details functionality
  };

  const interestedStatus = (record) => {
    console.log("Change user status for:", record);
    setSelectedRecord(record);
    setInterestStatus(true);
    // Implement status change functionality
  };

  const viewComments = (record) => {
    console.log("View comments for:", record);
    // Implement comments view functionality
    setSelectedRecord(record);
    setChangeToTest(true);
  };

  const writeComments = (record) => {
    console.log("View comments for:", record);
    // Implement comments view functionality
    setSelectedRecord(record);
    getCommentsfun(record)
    setShowComments(true);
  };

  const updatedob = (record) => {
    console.log("update dob for:", record.user.dob);
    // Implement comments view functionality
    setSelectedRecord(record);
    setDobModal(true);
  };

  const changetoBorrower = async () => {
    if (selectedRecord) {
      try {
        setIsLoading(true);

        const response = await handleChangePrimaryType(selectedRecord,"BORROWER");
        console.log("response", response);
        setIsLoading(false);
        setShow(false);
        Swal.fire(
          "Success!",
          `The user has been successfully changed to a BORROWER`,
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

  const handleChangeToTest = async () => {
    if (selectedRecord) {
      try {
        const response = await handleChangeToTestUser(selectedRecord);
        console.log("response", response);
        setChangeToTest(false);
        Swal.fire(
          "Success!",
          `The user has been successfully converted to a test user`,
          "success"
        );
        
        // Refresh data after action
        fetchLoanData();
      } catch (error) {
        console.error("Error in changing to borrower:", error);
        setChangeToTest(false);
      }
    }
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

  const commentsFunc = async () => {
    console.log("comments", comments);
    if (selectedRecord) {
      try {
        const response = await handleComments(selectedRecord, comments);
        console.log("response", response);
        setShowComments(false);
        setComments('')
        if (response.status == 200) {
          Swal.fire(
            "Success!",
            `The comments has been successfully added`,
            "success"
          );
          
          // Refresh data after action
          fetchLoanData();
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
      } catch (error) {
        // console.error("Error in adding comments:", error.data);
        setShowComments(false);
      }
    }
  };

//Function to get Comments
const getCommentsfun=async(record)=>{
  const response =await handlegetComments(record)
  console.log(response.data)
  if(response.status==200){
    setGetComments(response.data)
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

}



  // Function to handle the update of DOB
  const updatedobfunc = async () => {
    console.log("comments", actualDob);
    if (selectedRecord) {
      try {
        const response = await handleupdatedob(selectedRecord, actualDob);
        console.log("response", response);
        setDobModal(false);
        setActualDob('')
        if (response.status == 200) {
          Swal.fire("Success!", `DOB updated successfully`, "success");
          
          // Refresh data after action
          fetchLoanData();
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
      } catch (error) {
        console.error("Error in changing to borrower:", error);
        setDobModal(false);
      }
    }
  };
 
  const sendLoanStatement = async (record) => {
    const response = await handleSendStatement(record);
    console.log("handleSendStatement", response);
  };

  const updateEmiComments = async (record) => {
    const response = await handleEmiUpdateComments(record);
    console.log("handleEmiUpdateComments", response);
  };

  const columns = [
    {
      title: "Lender Info",
      key: "lenderInfo",
      render: (_, record) => (
        <div>
          <div>LR{record?.lenderUser?.id || "N/A"}</div>
          <div>
            <strong>Loan Process:</strong> {record?.loanProcessType || "N/A"}
          </div>
          <div>
            <strong>Lender Group ID:</strong> {record?.groupId || "0"}
          </div>
          <div>
            <strong>Lender Group:</strong> {record?.groupName || "N/A"}
          </div>
          {record?.referredBy!=0?
          <div>
            <strong>Referred By :</strong> {record?.referredBy || "N/A"}
          </div>
          :null}
        </div>
      ),
    },

    {
      title: "Reg Date &Exp Date",
      key: "regDateandExpDate",
      render: (_, record) => (
        <div>
          <div>
            <strong>Regd Date:</strong> {record.loanRequestedDate || "N/A"}
          </div>
          <div>
            <strong>Exp Date:</strong> {record.expectedDate || "N/A"}
          </div>
          <div>
            <strong>Wallet Value:</strong> {record?.walletAmount}
          </div>
          <div>
            <strong>PAN:</strong> {record.user?.panNumber}
          </div>
          <div>
            <strong>DOB:</strong> {record.user?.dob}
          </div>
          <div>
          <strong>Actual DOB:</strong> {record.user.originalDob}
          </div>
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
          <div>
            <strong>Phone :</strong>
            {record.user?.mobileNumber || "N/A"}
          </div>

          <div>
            INR {record?.loanRequestAmount} <br/>
            {record?.rateOfInterest} % PA <br/>
            <strong>UTM SOURCE:</strong> {record.user?.utmSource}
          </div>
        </div>
      ),
    },

    {
      title: "Email & Address",
      key: "emailAndAddress",
      render: (_, record) => (
        <div>
          <div>
            <strong>Email:</strong>
            {record.user?.email || "N/A"}
          </div>
          <div>
            <strong>Address:</strong>
            {record.user?.address || "N/A"}
          </div>
          <div>
            <strong>Bank Account Details:</strong><br/>
            {record?.user.userNameAccordingToBank}<br />
            {record?.user.accountNumber}<br />
            {record?.user.ifscCode}<br />
            {record?.user.branchName}

          </div>
        </div>
      ),
    },
    {
      title: "View Documents",
      key: "viewdocs",
      render: (_, record) => (
        <></>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space
          size="small"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => viewDetails(record)}
          >
            Change to Borrower
          </Button>
          <Button size="small" onClick={() => viewComments(record)}>
            Change to Test Lender
          </Button>
          <Button
            type="default"
            icon={<UserSwitchOutlined />}
            size="small"
            onClick={() => interestedStatus(record)}
          >
            Interested
          </Button>
          <Button
            icon={<CommentOutlined />}
            size="small"
            onClick={() => writeComments(record)}
          >
            Write to Comments
          </Button>
          <Button size="small" onClick={() => updatedob(record)}>
            Update the DOB
          </Button>
        </Space>
      ),
    },
  ];

  const filterOptions = [
    { value: "Choose", label: "Choose" },
    { value: "Name", label: "Name" },
    { value: "LenderId", label: "Lender Id" },
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

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <Card>
            <Title level={4}>Lender Loan Applications</Title>

            <div className="mb-4 d-flex align-items-center flex-wrap">
              <Select
                style={{ width: 140, marginRight: 8 }}
                value={dropdownValue}
                onChange={handleDropdownChange}
              >
                {filterOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>

              {/* Dynamic input fields based on selection */}
              {showInput && (
                <>
                  {dropdownValue === "Name" && (
                    <Input
                      placeholder="Enter name"
                      style={{ width: 200, marginRight: 8 }}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  )}

                  {dropdownValue === "LenderId" && (
                    <Input
                      placeholder="Enter Lender ID"
                      style={{ width: 200, marginRight: 8 }}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  )}

                  {dropdownValue === "ROI" && (
                    <>
                      <Input
                        placeholder="Min ROI"
                        style={{ width: 120, marginRight: 8 }}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                      <Input
                        placeholder="Max ROI"
                        style={{ width: 120, marginRight: 8 }}
                        value={inputValue2}
                        onChange={(e) => setInputValue2(e.target.value)}
                      />
                    </>
                  )}

                  {dropdownValue === "Amount" && (
                    <Input
                      placeholder="Enter amount"
                      style={{ width: 200, marginRight: 8 }}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  )}

                  {dropdownValue === "AmountCity" && (
                    <>
                      <Input
                        placeholder="Enter amount"
                        style={{ width: 120, marginRight: 8 }}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                      <Input
                        placeholder="Enter city"
                        style={{ width: 120, marginRight: 8 }}
                        value={inputValue2}
                        onChange={(e) => setInputValue2(e.target.value)}
                      />
                    </>
                  )}

                  {dropdownValue === "City" && (
                    <Input
                      placeholder="Enter city"
                      style={{ width: 200, marginRight: 8 }}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  )}

                  {dropdownValue === "MobileNumber" && (
                    <Input
                      placeholder="Enter mobile number"
                      style={{ width: 200, marginRight: 8 }}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  )}

                  {/* Add other dropdown options here with their respective input fields */}
                </>
              )}

              <Button type="primary" onClick={handleSearch} loading={loading}>
                Search
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={loanData}
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
              loading={loading}
              onChange={handleTableChange}
              bordered
              scroll={{ x: 1000 }}
            />
          </Card>
        </div>

        {/* Change To Borrower */}
        <Modal show={show} onHide={handleClose} top>
          <Modal.Header closeButton>
            <Modal.Title>Confirmation</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>Are you sure you want to change to Borrower?</p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              No
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                changetoBorrower();
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

        {/* Change To Test User */}
        <Modal show={changeToTest} onHide={handleClose} top>
          <Modal.Header closeButton>
            <Modal.Title>Confirmation</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>Are You Sure ? You want to change these lender to Test lender</p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              No
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleChangeToTest();
                // Perform some action
              }}
            >
              Yes
            </Button>
          </Modal.Footer>
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

        {/* Write Comments */}
        <Modal show={showComments} onHide={handleClose} top>
          <Modal.Header closeButton>
            <Modal.Title>Comments</Modal.Title>
          </Modal.Header>
        
          <Modal.Body>
  <div className="col-12 col-sm-12">
    {/* Display Comments Section */}
    {getComments?.length > 0 && (
      <div
        className={`comment-section ${getComments.length > 2 ? 'scrollable-comments' : ''}`}
        style={{
          margin: '20px 0',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '10px',
        }}
      >
       {getComments.map((comment, index) => {
  const isLast = index === getComments.length - 1;
  const showBorder = getComments.length > 1 && !isLast;

  return (
    <div
      key={index}
      className={`single-comment mb-3 pb-2 ${showBorder ? 'border-bottom' : ''}`}
    >
      <p className="comment-user fw-bold mb-1">{comment.updatedByName}</p>
      <p className="comment-text mb-1">{comment.comment}</p>
      {/* <p className="comment-date text-muted small">{new Date(comment.commentedDate).toLocaleString()}</p> */}
    </div>
  );
})}

      </div>
    )}

    {/* Input Comment Box */}
    <div className="form-group local-forms">
      <label>
        Comments <span className="login-danger">*</span>
      </label>
      <textarea
        type="text"
        name="withdrawFeedback"
        className="form-control"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Enter Comments"
      />
    </div>
  </div>
</Modal.Body>


          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              No
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                commentsFunc();
                // Perform some action
              }}
            >
              Yes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Update DOB */}
        <Modal show={dobModal} onHide={handleClose} size="md" centered>
          <Modal.Header closeButton>
            <Modal.Title>Update DOB</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "15px",
                marginTop: "15px",
              }}
            >
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "500" }}>User DOB</label>
                {/* <p>{selectedRecord?.user?.dob}</p> */}
                <input
                  type="text"
                  className="form-control"
                  value=
                  {selectedRecord?.user.originalDob==null?selectedRecord?.user?.dob:selectedRecord?.user.originalDob}
                  readOnly
                  // onChange={(e) => setUserDob(e.target.value)}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "500" }}>Actual DOB</label>
                <input
                  type="date"
                  className="form-control"
                  value={actualDob}
                  onChange={(e) => setActualDob(e.target.value)}
                />
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => updatedobfunc()}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default LenderLoanApplications;