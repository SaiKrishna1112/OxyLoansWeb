import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from "react-router-dom";
import { Table, Button, Select, Modal, Spin } from 'antd';
import axios from "axios";
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import Header from "../../../Header/OxyloansAdminHeader";
import Sidebar from "../../../SideBar/OxyloansAdminSidebar";
import {handleGetCICReports} from "../../../HttpRequest/admin"
import Swal from 'sweetalert2';

export default function CICReports() {
  const [selectedSet, setSelectedSet] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('');
  const[selectedMonth_error,setSelectedMonth_error]=useState(false)
  const [selectedYear, setSelectedYear] = useState('');
  const[selectedYear_error,setSelectedYear_error]=useState(false)
  const [showData, setShowData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
  const[downloadLoading,setDownloadLoading]=useState(false)
  const [downloadedUrl, setDownloadedUrl] = useState(null);
  // const [downloadableItem, setDownloadableItem] = useState(null);
  const navigate = useNavigate();

  // Generate years from 2016 to current year
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let year = currentYear; year >= 2016; year--) {
    years.push(year);
  }
  

  // List of months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSetChange = (e) => {
    setSelectedSet(e.target.value);
    setSelectedMonth('');
    setSelectedYear('');
  };

 
  const handleReports = async () => {  

if(selectedSet!="All"){
if(selectedMonth==""){
  setSelectedMonth_error(true)
  return false
}
if(selectedYear==""){
  setSelectedYear_error(true)
  return false
}
}


    setLoading(true);

    // if(selectedSet === 'all') {
    const response = await handleGetCICReports(selectedSet,selectedMonth,selectedYear);
    // }else{

    //   const response = await handleGetCICReports(selectedSet);
    // }
    console.log("response",response)
    console.log("response Status",response.status)

    setLoading(false);  

    if(response.status == 200) {
      setShowData(true);
    setReports(response.data);
    setLoading(false);  

    }else{
if(response.response.status == 401){
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
  setLoading(false)

}
else{
Swal.fire({
  icon: 'error',
  title: 'Oops...',
  text: response.response.data.errorMessage,
  confirmButtonText: 'OK',
})
setLoading(false)
}  
    }

  };

  const filteredReports = reports.filter((item) => {
    const nameMatch = item.consumerName?.toLowerCase().includes(searchName.toLowerCase());
    const mobileMatch = item.telephoneNoMobile?.includes(searchMobile);
    return nameMatch && mobileMatch;
  });

  const regenerateOTP = async () => {
    try {
      const res = await axios.post('https://yourapi.com/regenerateOTP', {
        // your payload here
      });
      Swal.fire('Success', 'OTP has been regenerated.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to regenerate OTP.', 'error');
    }
  };

  const downloadableItem = reports.find(item => item.downloadUrl !== null);

  const handleDownloadReports = () => {
    setDownloadLoading(true);
    if (downloadableItem && downloadableItem.downloadUrl) {
      // setDownloadedUrl(downloadableItem.downloadUrl);
      setDownloadLoading(false);
      const link = document.createElement('a');
      link.href = downloadableItem.downloadUrl;
      link.download = 'cic-report.pdf'; // Change filename if needed
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No downloadable report available.'
      });
      
      // alert('');
      setDownloadLoading(false);
    }
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
                    <li className="breadcrumb-item">
                      <Link to="/oxyloansadmindashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">CIC Report </li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ minHeight: '100vh' }}>
              <div className="container">
                <div className="card shadow mb-4">
                  <div className="card-body">
                    <h1 className="text-center mb-4 text-primary">CIC Reports</h1>
                    
                    <div className="row g-3">
                      {/* Set Selection */}
                      <div className="col-auto" style={{ minWidth: '200px' }}>
                        <label className="form-label fw-bold">Select Set</label>
                        <select 
                          className="form-select"
                          value={selectedSet}
                          onChange={handleSetChange}
                        >
                          <option value="All">All</option>
                          <option value="1">Set 1</option>
                          <option value="2">Set 2</option>
                        </select>
                      </div>
                      
                      {/* Month Selection - Only show when Set1 or Set2 is selected */}
                      {selectedSet !== 'All' && (
                        <div className="col-auto" style={{ minWidth: '200px' }}>
                          <label className="form-label fw-bold">Select Month</label>
                          <select 
                            className="form-select"
                            value={selectedMonth}
                            error={selectedMonth_error}
                            onChange={(e) => {setSelectedMonth(e.target.value),setSelectedMonth_error(false)}}
                          >
                            <option value="">Select Month</option>
                            {months.map(month => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                          {selectedMonth_error && <p className="text-danger m-0">Please select month</p>}

                          {/* {selectedMonth_error && <p className="text-danger">Please select month</p>} */}
                        </div>
                      )}
                      
                      {/* Year Selection - Only show when Set1 or Set2 is selected */}
                      {selectedSet !== 'All' && (
                        <div className="col-auto" style={{ minWidth: '200px' }}>
                          <label className="form-label fw-bold">Select Year</label>
                          <select 
                            className="form-select"
                            value={selectedYear}
                            onChange={(e) => {setSelectedYear(e.target.value),setSelectedYear_error(false)}}
                            error={selectedYear_error}
                          >
                            <option value="">Select Year</option>
                            {years.map(year => (
                              <option key={year} value={year.toString()}>{year}</option>
                            ))}
                          </select>
                          {selectedYear_error && <p className="text-danger m-0">Please select year</p>}

                        </div>
                      )}
                      
                      {/* Submit Button */}
                      {/* Submit Button */}
{/* {(selectedSet === "All" || (selectedMonth && selectedYear)) && ( */}
  <div className="col-auto d-flex align-items-end">
    <Button 
      className="btn btn-primary px-4"
      onClick={handleReports}
      disabled={
        loading || 
        (selectedSet !== 'All' && (!selectedMonth || !selectedYear))
      }
      style={{
        background: 'linear-gradient(to right, #4776E6, #8E54E9)',
        border: 'none'
      }}
    >
      {loading ? <LoadingOutlined /> : 'Submit'}
    </Button>
  </div>
{/* )} */}

                    </div>
                  </div>
                </div>
                
                {/* Results Table */}
                {showData && (
                  <div>
                    <div>
                      <h2 className="mb-2 text-primary">Results</h2>


                      <div
                          style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            margin: '10px',
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Search by Name"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            style={{
                              padding: '8px',
                              minWidth: '200px',
                              border: '1px solid #ccc',
                              borderRadius: '5px',
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Search by Mobile"
                            value={searchMobile}
                            onChange={(e) => setSearchMobile(e.target.value)}
                            style={{
                              padding: '8px',
                              minWidth: '200px',
                              border: '1px solid #ccc',
                              borderRadius: '5px',
                            }}
                          />

                      <div className="col-auto">
                        <Button 
                          className="btn btn-primary px-4"
                          onClick={handleDownloadReports}
                          disabled={downloadLoading}
                          style={{
                            background: 'linear-gradient(to right, #4776E6, #8E54E9)',
                            border: 'none'
                          }}
                        >
                          {downloadLoading ? <LoadingOutlined /> : 'Download report'}
                        </Button>
                        {/* {downloadedUrl && (
        <p style={{ color: 'green' }}>
          ✅ Downloaded from: <a href={downloadedUrl} target="_blank" rel="noreferrer">{downloadedUrl}</a>
        </p>
      )} */}
                      </div>
                        </div>
                      {/* </div> */}
                      
                      {loading ? (
                        <div className="text-center py-5">
                          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
                          <p className="mt-3">Loading reports...</p>
                        </div>
                      ) : reports.length > 0 ? (
                        <div
  className="table-responsive"
  style={{
    // overflowX: 'auto',
    border: '1px solid #ccc',
    WebkitOverflowScrolling: 'touch',
  }}
>
  <table
    className="table table-striped table-hover"
    // style={{ minWidth: '700px', borderCollapse: 'collapse' }}
  >
    <thead
      className="text-white"
      style={{
        background: 'linear-gradient(to right, #4776E6, #8E54E9)',
        border: '1px solid #ccc',
      }}
    >
      <tr>
        <th className='col-2'>Personal Information</th>
        <th>ID & Membership Details</th>
        <th>Account Information</th>
        <th>Email & Contact</th>
      </tr>
    </thead>
    <tbody>
      {filteredReports.map((item, index) => (
        <tr key={index} className='table-row'>
          <td
            style={{
              width: '10px',
              border: '1px solid #ccc',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            <div><strong>Name:</strong> {item.consumerName}</div>
            <div><strong>Mobile:</strong> {item.telephoneNoMobile}</div>
            <div><strong>Address:</strong> {item.address}</div>
            <div><strong>PIN:</strong> {item.pincode}</div>
          </td>
          <td style={{ width: '200px', border: '1px solid #ccc' }}>
            <div><strong>Income Tax ID:</strong> {item.incomeTaxIdNumber}</div>
            <div><strong>Member Code:</strong> {item.currentNewMemberCode}</div>
            <div><strong>Member Short Name:</strong> {item.currentNewMemberShortName}</div>
          </td>
          <td style={{ width: '200px', border: '1px solid #ccc' }}>
            <div><strong>Account No:</strong> {item.newAccountNo}</div>
            <div><strong>Account Type:</strong> {item.accountType}</div>
            <div><strong>Date Opened:</strong> {item.dateOpend}</div>
            <div><strong>High Credit Sum:</strong> ₹{item.highCreditedSum?.toLocaleString() || 0}</div>
            <div><strong>Current Balance:</strong> ₹{item.currentBalance?.toLocaleString() || 0}</div>
          </td>
          <td style={{ width: '200px', border: '1px solid #ccc' }}>
            <div><strong>Email:</strong> {item.email || "N/A"}</div>
            <div><strong>Date of Birth:</strong> {item.dateOfBirth}</div>
            <div><strong>Gender:</strong> {item.gender === 2 ? "Male" : item.gender === 1 ? "Female" : "Other"}</div>
            <div><strong>State Code:</strong> {item.stateCode}</div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

                      
                      ) : (
                        <div className="text-center py-4 text-muted">
                          No data found for the selected filters.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}