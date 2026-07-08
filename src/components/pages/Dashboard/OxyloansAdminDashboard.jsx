import React,{useEffect,useState} from "react";
import { FaUserAlt, FaUsers, FaUserCheck, FaUserGraduate, FaCalendarDay } from "react-icons/fa";
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";

import OxyloansAdminHeader from "../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../SideBar/OxyloansAdminSidebar";
import Footer from "../../Footer/Footer";
import { handleDashboardUsersData,fetchActiveLendersData } from "../../HttpRequest/admin";
import Swal from "sweetalert2";

const OxyloansAdminDashboard = () => {
  const[userData,setUserData]=useState({})
  const [ActiveLenders, setActiveLenders] = useState({});
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');
const primaryType=localStorage.getItem('primaryType') || sessionStorage.getItem('primaryType')
const email=sessionStorage.getItem('email')

console.log("primaryType",primaryType)
  const navigate = useNavigate();

useEffect(()=>{
  fetchUsersData()
  activeLendersData()
  const interval = setInterval(() => {
    setDots(prev => {
      if (prev.length >= 3) return '';
      return prev + '.';
    });
  }, 400);
  
  return () => clearInterval(interval);
},[])

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const response = await handleDashboardUsersData();
      setUserData(response.data);
    } catch (err) {
      console.log("error",err.response.data.errorCode);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to fetch user data!',
        footer: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const activeLendersData = async () => {
    setLoading(true);
        const response = await fetchActiveLendersData();
        console.log("fetchActiveLendersData",response)
        setLoading(false); 
      if(response.status == 200) {
              setActiveLenders(response.data);
            setLoading(false);  
        
            }else{
        if(response.response.status == 401){
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: response.response.data.errorMessage,
            confirmButtonText: 'Go to Login',
        
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/');
            }
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

  const statsCards = [
    { title: "Registered Users", value: `${userData?.registeredUsersCount}`, icon: <FaUserAlt size={40} color="#4e73df" /> },
    { title: "Lenders", value: `${userData?.lendersCount}`, icon: <FaUsers size={40} color="#1cc88a" /> },
    { title: "Active Lenders", value: `${ActiveLenders?.totalCount}`, icon: <FaUserCheck size={40} color="#36b9cc" /> },
    { title: "Borrowers", value: `${userData?.borrowersCount}`, icon: <FaUserGraduate size={40} color="#f6c23e" /> },
    { title: "Today's Registrations", value: `${userData?.todayRegisteredUsersCount}`, icon: <FaCalendarDay size={40} color="#e74a3b" /> },
  ];

  const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title text-primary">  Welcome {email ? capitalize(email.split("@")[0]) : capitalize(primaryType)}
                </h3>
              </div>
            </div>
          </div>

{loading==false?
          <>
            <div className="row">
              {statsCards.map((card, index) => (
                <div key={index} className="col-xl-3 col-sm-6 col-12 d-flex">
                  <div className="card w-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                    <div className="card-body d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="text-muted mb-1">{card.title}</h6>
                        <h3 className="mb-0">{card.value}</h3>
                      </div>
                      <div className="icon-wrapper">{card.icon}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
:
<>
<div className="d-flex justify-content-center p-3">
  <div className="bg-white shadow rounded-pill p-2 d-flex align-items-center">
    {[0, 0.1, 0.2].map((delay, i) => (
      <div 
        key={i}
        className={`spinner-grow spinner-grow-sm ${i < 2 ? 'me-2' : 'me-3'} ${['text-primary', 'text-info', 'text-success'][i]}`} 
        style={delay ? {animationDelay: `${delay}s`} : {}}
        role="status"
      >
        <span className="visually-hidden">Loading</span>
      </div>
    ))}
    <span className="fw-bold text-primary">Loading</span>
  </div>
</div>
</>
}

        </div>
        <Footer />
      </div>
    </div>
  );
};

export default OxyloansAdminDashboard;
