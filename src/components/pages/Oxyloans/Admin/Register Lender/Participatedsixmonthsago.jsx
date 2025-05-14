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
  // handleChangeToTestUser,
  // handleInterestStatus,
  // handleComments,
  // handleupdatedob,
  // handleSendStatement,
  // handleEmiUpdateComments,
} from "../../../../HttpRequest/admin";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { set } from "react-ga";

const Participatedsixmonthsago = () => {
  const [loading, setLoading] = useState(false);
  const [download, setDownload] = useState();
  const navigate = useNavigate();

  const accessToken = sessionStorage.getItem("accessToken");
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchDownloadReport();
  }, []);

  const fetchDownloadReport = async () => {
    setLoading(true);
    const response = await handlefetchDownloadReport();
    console.log("handlefetchDownloadReport", response.response.status);
    setLoading(false);
    if (response.status === 200) {
      setDownload(response.data.downloadUrl);
    } else {
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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = download;
    link.download = "sample.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <h3 level={4}>Participated six months ago</h3>

          <Card className="col-10">
            <div className="mb-4 d-flex align-items-center flex-wrap">
              <div>
                <strong>Note: </strong>
                <span className="bg-light text-danger px-1 py-1 rounded d-inline-block">
                  Displaying users whose wallets are loaded but who have not
                  participated in the past six months.
                </span>
              </div>

             
            </div>
            {loading ? (
                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={handleDownload}
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    marginTop: 20,
                  }} // Custom green
                >
                  Download Report
                </Button>
              ) : (
                <div className="d-flex justify-content-center mt-3">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Participatedsixmonthsago;
