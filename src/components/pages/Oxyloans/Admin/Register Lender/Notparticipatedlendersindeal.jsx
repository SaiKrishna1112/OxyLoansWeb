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
import { searchCallLender } from "../../../../HttpRequest/admin";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { Modal } from "react-bootstrap";
import {
  handlefetchDownloadReport,
  handleNotParticipatedLendersindeal,
  // handleInterestStatus,
  // handleComments,
  // handleupdatedob,
  // handleSendStatement,
  // handleEmiUpdateComments,
} from "../../../../HttpRequest/admin";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { set } from "react-ga";

const Notparticipatedlendersindeal = () => {
  const [loading, setLoading] = useState(false);
  const [download, setDownload] = useState();
const[showDownload,setShowDownload]=useState(false)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});

 
  const navigate = useNavigate();

  const accessToken = sessionStorage.getItem("accessToken");
  const userId = sessionStorage.getItem("userId");

 

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = download;
    link.download = "sample.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleSearch = async() => {
    const newErrors = {};

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Start Date:', startDate);
      console.log('End Date:', endDate);
      // Proceed with search logic
    }
    
setLoading(true)
const response=await handleNotParticipatedLendersindeal(startDate,endDate);
console.log("handleNotParticipatedLendersindeal", response);
setLoading(false)
if (response.status === 200) {
      setDownload(response.data.downloadUrl);
      setShowDownload(true)
    }
else {
      if (response.response.status == 401) {
        console.log("error", response.response.status);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: response.response.data.errorMessage,
          confirmButtonText: "Go to Login",
          // denyButtonText: 'Regenerated',
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


  };


  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <h3 level={4}>Validity expired Lender</h3>

          <Card className="col-10">
            <div className="mb-4 d-flex align-items-center flex-wrap">
              <div>
                <strong>Note: </strong>
                <span className="bg-light text-danger px-1 py-1 rounded d-inline-block">
                Here Displaying Validity expired and stopped participating.
                </span>
              </div>
  
            </div>

            
            <div style={{ marginTop: 20 }}>
  <div className="d-flex flex-wrap gap-2 align-items-start">
    <div className="d-flex flex-column me-2" style={{ flex: '1 1 200px', minWidth: '150px' }}>
      <input
        type="date"
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          setErrors({ ...errors, startDate: '' });
        }}
        className="form-control"
      />
      {errors.startDate && (
        <span className="text-danger" style={{ fontSize: '12px' }}>{errors.startDate}</span>
      )}
    </div>

    <div className="d-flex flex-column me-2" style={{ flex: '1 1 200px', minWidth: '150px' }}>
      <input
        type="date"
        value={endDate}
        onChange={(e) => {
          setEndDate(e.target.value);
          setErrors({ ...errors, endDate: '' });
        }}
        className="form-control"
      />
      {errors.endDate && (
        <span className="text-danger" style={{ fontSize: '12px' }}>{errors.endDate}</span>
      )}
    </div>

    {loading === false ? (
      <button
        onClick={handleSearch}
        className="btn btn-primary"
        style={{ height: '38px', minWidth: '100px' }}
      >
        Search
      </button>
    ) : (
      <div className="d-flex align-items-center">
        <div className="spinner-border text-success" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )}
  </div>
</div>


            {showDownload && (
  <div className="mt-3">
    <button
      onClick={handleDownload}
      className="btn btn-success"
    >
      Download Report
    </button>
  </div>
)}

          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notparticipatedlendersindeal;
