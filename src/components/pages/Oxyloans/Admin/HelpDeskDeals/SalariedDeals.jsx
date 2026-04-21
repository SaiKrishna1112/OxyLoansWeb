import React, { useEffect, useState } from 'react';
import { Table, Button } from 'antd';
import axios from 'axios';
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { API_USER_URL } from '../../../../../config';

export default function SalariedDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealType, setDealType] = useState('HAPPENING');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDeals, setTotalDeals] = useState(0);
  const navigate = useNavigate();

  const fetchDeals = async (type = dealType, pageNo = currentPage) => {
    setLoading(true);
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      console.error('Access token is missing!');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        pageNo: currentPage,
        pageSize: 10,
        dealType: type,
        dealName: 'PERSONAL', // Updated dealName for personal deals
      };

      const response = await axios.post(
        `${API_USER_URL}40016/listOfDealsInformationForEquityDeals`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            accessToken,
          },
        }
      );

      const enrichedData = (response.data.listOfBorrowersDealsResponseDto || []).map((item) => ({
        dealId: item.dealId,
        dealName: item.dealName,
        agreementsGenerationStatus: item.agreementsGenerationStatus,
        firstParticipationDate: item.firstParticipationDate,
        lastParticipationDate: item.lastParticipationDate || 'NA',
        dealPaticipatedAmount: item.dealPaticipatedAmount,
        dealCurrentAmount: item.dealCurrentAmount,
        borrowerName: item.borrowerName,
        borrowerRateOfInterest: item.borrowerRateOfInterest,
        rateOfInterest: item.rateOfInterest,
        fundingStatus: item.fundingStatus,
        dealAmount: item.dealAmount,
        dealAmountReturnedToWallet: item.dealAmountReturnedToWallet,
        withdrawalAndPrincipalReturned: item.withdrawalAndPrincipalReturned
      }));

      setDeals(enrichedData);
      setTotalDeals(response.data?.count || 0);
    } catch (error) {
      console.error('Error fetching deals:', error);
      if(error.response.status==401){
        Swal.fire({
           icon: 'error',
           title: 'Oops...',
           text: error.response.data.errorMessage,
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
         text: error.response.data.errorMessage,
         confirmButtonText: 'OK',
       })
             }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals(dealType, currentPage);
  }, [dealType, currentPage]);

  const handleButtonClick = (type) => {
    setDealType(type);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      title: 'Deal Info',
      key: 'dealInfo',
      render: (_, record) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: 250 }}>
          <div><strong>Deal Name:</strong> {record.dealName}</div>
          <div><strong>Deal Id:</strong> {record.dealId}</div>
          <div><strong>Agreements:</strong> {record.agreementsGenerationStatus}</div>
          <div><strong>First Participation:</strong> {record.firstParticipationDate}</div>
          <div><strong>Last Participation:</strong> {record.lastParticipationDate}</div>
        </div>
      ),
    },
    {
      title: 'Participated Info',
      key: 'participatedInfo',
      render: (_, record) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: 250 }}>
          <div><strong>Participated Amount:</strong> {record.dealPaticipatedAmount}</div>
          <div><strong>Current Amount:</strong> {record.dealCurrentAmount}</div>
          <div><strong>To Wallet:</strong> {record.dealAmountReturnedToWallet}</div>
          <div><strong>Return Principal:</strong> {record.withdrawalAndPrincipalReturned }</div>
        </div>
      ),
    },
    {
      title: 'Deal User',
      key: 'dealUser',
      render: (_, record) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: 250 }}>
          <div><strong>Borrower Name:</strong> {record.borrowerName}</div>
          <div><strong>Rate of Interest:</strong> {record.rateOfInterest}</div>
          <div><strong>Borrower ROI:</strong> {record.borrowerRateOfInterest}</div>
          <div><strong>Funding Status:</strong> {record.fundingStatus}</div>
          <div><strong>Deal Amount:</strong> {record.dealAmount}</div>
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
          <div className="page-header">
            <div className="row">
              <h4 className="page-title"> Running & Closed Personal Deals</h4>
              <div className="col">
                <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', gap: 16 }}>
                  <Button
                    type={dealType === 'HAPPENING' ? 'primary' : 'default'}
                    onClick={() => handleButtonClick('HAPPENING')}
                  >
                    Personal Running Deals
                  </Button>
                  <Button
                    type={dealType === 'CLOSED' ? 'primary' : 'default'}
                    onClick={() => handleButtonClick('CLOSED')}
                  >
                    Personal Participation Closed Deals
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <Table
                    loading={loading}
                    columns={columns}
                    dataSource={deals}
                    rowKey="dealId"
                    bordered
                    pagination={{
                      current: currentPage,
                      pageSize: 10,
                      total: totalDeals,
                      onChange: (page) => setCurrentPage(page),
                      showSizeChanger: false,
                      showLessItems: true,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}