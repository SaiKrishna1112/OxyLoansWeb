import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  message,
  Upload,
  Card,
  Typography,
  Space
} from "antd";
import {
  UploadOutlined,
  FileExcelOutlined
} from "@ant-design/icons";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import { API_USER_URL } from "../../../../../config";

const { Title, Text } = Typography;

const UploadFile = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const accessToken = sessionStorage.getItem("accessToken");

  const beforeUpload = (file) => {
    const isXlsx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.name.endsWith(".xlsx");

    if (!isXlsx) {
      message.error("Only .xlsx files are allowed.");
      return Upload.LIST_IGNORE;
    }

    return false; 
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); 
  };

  const handleUpload = async () => {
    if (!fileList.length) {
      return message.warning("Please select a file to upload.");
    }

    if (!accessToken) {
      return message.error("Access token not found in session.");
    }

    const formData = new FormData();
    formData.append("file", fileList[0].originFileObj); 

    setUploading(true);
    try {
      const response = await axios.post(
        `${API_USER_URL}offlineUsers`,
        formData,
        {
          headers: {
            Authorization: accessToken,
           
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        message.success("File uploaded successfully!");
        setFileList([]);
      } else {
        message.error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="content container-fluid">
        <div className="page-header mb-4">
          <Title level={3}>Offline User Data</Title>
          <Text type="secondary">
            Upload Excel files (.xlsx) containing offline lender information.
          </Text>
        </div>

        <Card
          style={{ maxWidth: 500, padding: 24 }}
          bordered
          title={
            <span>
              <FileExcelOutlined style={{ color: "#52c41a", marginRight: 8 }} />
              Upload XLSX File
            </span>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Upload
              accept=".xlsx"
              beforeUpload={beforeUpload}
              onChange={handleChange}
              fileList={fileList}
              maxCount={1}
              action={undefined} 
            >
              <Button icon={<UploadOutlined />}>Choose File (.xlsx)</Button>
            </Upload>

            <Button
              type="primary"
              onClick={handleUpload}
              disabled={!fileList.length}
              loading={uploading}
              block
            >
              {uploading ? "Uploading..." : "Start Upload"}
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default UploadFile;
