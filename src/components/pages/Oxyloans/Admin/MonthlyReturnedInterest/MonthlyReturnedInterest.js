import React, { useEffect, useState } from 'react';
import { Table, Spin, message, Button } from 'antd';
import axios from 'axios';
import OxyloansAdminHeader from '../../../../Header/OxyloansAdminHeader';
import OxyloansAdminSidebar from '../../../../SideBar/OxyloansAdminSidebar';
import { API_USER_URL } from '../../../../../config';

export default function MonthlyReturnedInterest() {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    fetchMonthlyReturnedInterest();
  }, []);

  const fetchMonthlyReturnedInterest = async () => {
    setLoading(true);
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      if (!accessToken) {
        message.error('Access token not found in session storage!');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_USER_URL}adminMonthlyReturnedInterestAmount/May/2025`,
        {
          headers: {
            accessToken: accessToken,
          },
        }
      );

      if (response.data) {
        const { lendersInterestReturns, downloadUrl } = response.data;

        setDownloadUrl(downloadUrl);

        if (Array.isArray(lendersInterestReturns)) {
          const mappedData = lendersInterestReturns.map((item, index) => {
            const dateObj = new Date(item.interestPaidDate);
            return {
              key: index,
              dealId: item.dealId,
              dealInterestAmount: item.dealInterestAmount,
              interestPaidDate: `${dateObj.toLocaleString('default', {
                month: 'long',
              })} ${dateObj.getFullYear()}`,
            };
          });
          setApiData(mappedData);
        } else {
          setApiData([]);
        }
      } else {
        setApiData([]);
      }
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch Monthly Returned Interest';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      message.error('Download link not available');
    }
  };

  const columns = [
    {
      title: 'S.No',
      key: 'index',
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Deal ID',
      dataIndex: 'dealId',
      key: 'dealId',
    },
    {
      title: 'Interest Amount',
      dataIndex: 'dealInterestAmount',
      key: 'dealInterestAmount',
    
      render: (value) =>
        value ? ` ${Number(value).toLocaleString('en-IN')}` : '-',
    },
    {
      title: 'Interest Paid Month',
      dataIndex: 'interestPaidDate',
      key: 'interestPaidDate',
    },
  ];

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div
            className="page-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 className="page-title">Monthly Returned Interest</h2>
            {downloadUrl && (
              <Button type="primary" onClick={handleDownload}>
                Download Report
              </Button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="small" />
            </div>
          ) : (
            <Table
              dataSource={apiData}
              columns={columns}
              rowKey="key"
              bordered
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: apiData.length,
                showSizeChanger: false, 
                onChange: (page) => {
                  setPagination((prev) => ({ ...prev, current: page }));
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
