import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Card,
  message,
  Button
} from "antd";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import {fetchonlyonceparticipatedusers} from "../../../../HttpRequest/admin";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Onlyonceparticipatedlenders = () => {

  const [details, setDetails] = useState([]);
  const[download,setDownload]=useState('')
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });


  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchonlyonceparticipatedusers();
      setLoading(false);
      const downloadObj = JSON.parse(response.data?.lenderPaticipationExcelLink);
      console.log("Download URL:", downloadObj?.downloadUrl);
      if (response.status == 200) {
        setDetails(response.data.lendersRespose || []);
        setDownload(downloadObj?.downloadUrl)
      } else {
        if (response.response.status == 401) {
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
    } catch (error) {
      console.error("Failed to fetch loan data:", error);
      message.error("Failed to load loan applications");
    } finally {
      setLoading(false);
    }
  };


  const handleTableChange = (pagination) => {
    setPagination(pagination);
    // You can trigger a new search here with updated pagination
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = download;
    link.download = "sample.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 


  const columns = [
    {
      title: "User Id",
      key: "userId",
      render: (_, record) => (
        <div>
          <div>{record.userId || "N/A"}</div>
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
              {record?.firstName || ""} {record?.lastName || ""}
            </strong>
          </div>
          <div>
            <strong>Mobile Number : </strong>
            {record?.mobileNumber || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Pan Number",
      key: "panNumber",
      render: (_, record) => (
        <div>
          {record?.panNumber || "N/A"}
        </div>
      ),
    },
    {
      title: "Email/Address",
      key: "emailAndAddress",
      render: (_, record) => (
        <div>
          <div>
            <strong>Email : </strong>
            {record?.email || "N/A"}
          </div>
          <div>
            <strong>Address : </strong>
            {record?.address || "N/A"}
          </div>
         
        </div>
      ),
    },
    {
      title: "Primary Type",
      key: "primaryType",
      render: (_, record) => (
        <div>
          <div>
            {record?.primaryType || "N/A"}
          </div>
        </div>
      ),
    },
  ];



  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
        <Title level={4}>Only Once Participated Lenders</Title>

          <Card>
          <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={handleDownload}
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    margin: 20,
                  }} // Custom green
                >
                  Download Report
                </Button>

            <Table
              columns={columns}
              dataSource={details}
              rowKey={(record) => record.id || Math.random().toString()}
              pagination={pagination}
              loading={loading}
              onChange={handleTableChange}
              bordered
              scroll={{ x: 1000 }}
            />
          </Card>
        </div>

     
      </div>
    </div>
  );
};

export default Onlyonceparticipatedlenders;
 