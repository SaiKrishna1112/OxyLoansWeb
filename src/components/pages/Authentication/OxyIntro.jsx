import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
// import 'antd/dist/antd.css'; // Import Ant Design styles

function OxyIntro() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleInputChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    localStorage.setItem('userData', JSON.stringify(updated));

    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.number.trim()) {
        newErrors.number = 'Mobile number is required';
      }
    } else if (currentStep === 2) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (currentStep === 3) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const confirmExit = async () => {
    await fetch('https://your-api.com/drop-user', {
      method: 'POST',
    });
    localStorage.removeItem('userData');
    setFormData({ name: '', number: '', email: '' });
    setStep(1);
    setExitModalVisible(false);
  };

  const handleRegister = async () => {
    localStorage.setItem('userData', JSON.stringify(formData));
    try {
      const res = await fetch('https://your-api.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Registered Successfully');
        setStep(1);
      } else {
        alert('Registration failed');
      }
    } catch (err) {
      console.error('Register Error:', err);
    }
  };

  const cardStyle = {
    borderTop: '2px solid #0384d5',
    borderRadius: '0.25rem',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="card" style={cardStyle}>
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Find the Right Match</h4>
            </div>
            <div className="card-body">
              <h5 className="card-title">Welcome to OxyLoans</h5>
              <ul className="list-unstyled">
                <li className="mb-3"><span className="text-success me-2">✓</span><strong>RBI approved P2P NBFC</strong></li>
                <li className="mb-3"><span className="text-success me-2">✓</span><strong>Connects borrowers directly with lenders</strong></li>
                <li className="mb-3"><span className="text-success me-2">✓</span><strong>We are currently targeting borrowers from Hyderabad.</strong></li>
              </ul>
              <div className="mb-3">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="number"
                  className={`form-control ${errors.number ? 'is-invalid' : ''}`}
                  placeholder="Enter your Mobile Number"
                  value={formData.number}
                  // maxLength={10}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                />
                {errors.number && <div className="invalid-feedback">{errors.number}</div>}
              </div>
              <div className="d-grid gap-2 mt-4">
                <button type="button" className="btn btn-lg" style={{ backgroundColor: '#0384d5', color: 'white' }} onClick={handleNextStep}>Next →</button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="card" style={cardStyle}>
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">We promote your loan application; lenders review and decide to approve or reject it.<br/>(మేము మీ రుణ దరఖాస్తును ప్రమోట్ చేస్తాము; రుణదాతలు సమీక్షించి, దానిని ఆమోదించాలని లేదా తిరస్కరించాలని నిర్ణయించుకుంటారు.)</h4>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-3"><span className="text-success me-2">✓</span><strong>We'll share your profile with lenders.</strong></li>
                <li className="mb-3"><span className="text-success me-2">✓</span><strong>They will review it and decide on their own.</strong></li>
                <li className="mb-3"><span className="text-success me-2">✓</span><strong>We do not promise or guarantee any loan.</strong></li>
              </ul>
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={handlePreviousStep}>← Back</button>
                <button type="button" className="btn" style={{ backgroundColor: '#0384d5', color: 'white' }} onClick={handleNextStep}>Next →</button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="card" style={cardStyle}>
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">No Upfront Charges (ముందుగా ఎటువంటి ఫీజులు లేవు)</h4>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-3"><span className="text-success me-2">✓</span><strong>We charge 0–4% only if a lender approves your loan.</strong></li>
                <li className="mb-3"><span className="text-success me-2">✓</span><strong>Fair and safe for all borrowers.</strong></li>
              </ul>
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={handlePreviousStep}>← Back</button>
                <button type="button" className="btn" style={{ backgroundColor: '#0384d5', color: 'white' }} onClick={handleNextStep}>Next →</button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="card" style={cardStyle}>
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Before You Register...</h4>
            </div>
            <div className="card-body">
              <h5 className="card-title mb-4">Please read and choose:</h5>
              <div className="bg-light border rounded p-4 mb-4">
                <ul className="list-unstyled">
                  <li className="mb-3"><span className="text-success me-2">✓</span><strong>I Understand & Want to Register</strong></li>
                  <li className="mb-3"><span className="text-success me-2">✓</span><strong>OxyLoans is an RBI-approved P2P NBFC</strong></li>
                  <li className="mb-3"><span className="text-success me-2">✓</span><strong>We connect borrowers and lenders to discuss loan amount, tenure, ROI, and terms</strong></li>
                  <li className="mb-3"><span className="text-success me-2">✓</span><strong>We facilitate and promote connections — we don't guarantee approvals</strong></li>
                  <li className="mb-3"><span className="text-success me-2">✓</span><strong>I confirm that the information I provide is truthful and complete.</strong></li>
                </ul>
              </div>
              <div className="d-flex gap-3 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={handlePreviousStep}>← Back</button>
                <button type="button" className="btn btn-outline-danger flex-fill" onClick={handleExit}>I Am Not Sure / I Want to Exit</button>
                <button type="button" className="btn btn-success flex-fill" onClick={() => navigate('/borrower_register')}>I Agree & Register</button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };



  const handleExit = () => {
  setExitModalVisible(true);
};

const exitAndReset = async () => {
  await fetch('https://your-api.com/drop-user', {
    method: 'POST',
  });
  localStorage.removeItem('userData');
  setFormData({ name: '', number: '', email: '' });
  setStep(1);
  setExitModalVisible(false);
};
  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h2 className="fw-bold" style={{ color: '#0384d5' }}>OxyLoans Borrower Registration</h2>
          <p className="lead">Connect with lenders who can fulfill your financial needs</p>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-12">
          <div className="position-relative d-flex justify-content-between align-items-start px-5">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="text-center position-relative" style={{ width: '25%' }}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 mx-auto ${step >= stepNum ? 'text-white' : 'bg-light border'}`} style={{ width: '40px', height: '40px', backgroundColor: step >= stepNum ? '#0384d5' : '' }}>{stepNum}</div>
                <div className={`small ${step >= stepNum ? 'fw-bold' : 'text-muted'}`} style={{ color: step >= stepNum ? '#0384d5' : '' }}>
                  {stepNum === 1 && 'Mobile Number'}
                  {stepNum === 2 && 'Email'}
                  {stepNum === 3 && 'Name'}
                  {stepNum === 4 && 'Confirmation'}
                </div>
              </div>
            ))}
            <div className="position-absolute bg-light" style={{ height: '2px', top: '20px', left: '10%', right: '10%', zIndex: '-1' }} />
            <div className="position-absolute" style={{ height: '2px', backgroundColor: '#0384d5', top: '20px', left: '10%', width: `${(step - 1) * 30}%`, zIndex: '-1' }} />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-8 mx-auto">
          {renderStep()}
        </div>
      </div>

      <Modal
  title="Are You Sure You Want to Exit?"
  visible={exitModalVisible}
  onOk={() => navigate('/borrower_register')} // ✅ Call the register API
  onCancel={() => {
    setExitModalVisible(false);
    setStep(1); // ✅ Go back to Step 1 (Mobile Number tab)
  }}
  okText="Complete Registration"
  cancelText="Yes, Exit"
>
  <p>You haven’t completed your registration yet.</p>
  <p>By exiting now, you may miss out on connecting with lenders who can help you.</p>
  <p>Would you like to stay and complete your registration?</p>
</Modal>

    </div>
  );
}

export default OxyIntro;
