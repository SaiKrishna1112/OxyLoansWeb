import React, { useState } from 'react';
import axios from 'axios';
import { API_USER_URL } from '../../../../config';

const Fileconvension = () => {
    const [userId, setUserId] = useState('');
    const [status, setStatus] = useState('APPROVED');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const accessToken = 'eyJ1c2VySWQiOiI1NTU3MyIsImlhdCI6MTcyMTExMDIwNDE4MCwidHRsIjo3MjAwLCJ2ZXJzaW9uIjoidjEiLCJncmFudFR5cGUiOiJQV0QiLCJhbGdvcml0aG0iOiJSU0EifQ==.kKhxria0NG0MaLVqGmC9Gw/AOjrLsWokuPyeMyQ34/62CD4AjuNbX53bz3Y0UUIT4ixokgn+4ao1JaJbVyEWWxg+Z7Bb9H3LPf4o72b99f/uDqN8wHr1ftDAC2ZVWnCUjnmwUA0FDOAhyQkE0vPOVB6bXpsWDsL8v4IiGbUOgJBcyASaU+NnL9TrG9+s9hYjUtwDrwZsY2w2WyDocxHmq1n2foTXySQXKZgMYNWtqukBQ2TjWyOXOkJ7Upr1eKWTAxtA1Y+F1GPC4tnScjBKltI2sLrYvBF23fUld1BwtqCJgnKetzEPkYaBk+VZzUHLbiMb+570FAHhicdMXkq/BA==';

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `${API_USER_URL}getGmailAuthorization/gmailcontacts/BORROWER/REACT`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            setUserData(response.data);
        } catch (err) {
            setError('Failed to fetch user data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ width: '250px', backgroundColor: '#333', color: 'white', padding: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Sidebar</h2>
            </div>
            <div style={{ flex: '1', padding: '24px', backgroundColor: '#f1f1f1' }}>
                <header style={{ backgroundColor: 'white', padding: '16px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Header</h1>
                </header>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>

                    <label htmlFor="status" style={{ display: 'block', fontSize: '18px', fontWeight: '500', marginBottom: '8px', marginTop: '16px' }}>
                        Status
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ display: 'block', width: '100%', border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
                    >
                        <option value="APPROVED">APPROVED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="REJECTED">REJECTED</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        style={{ marginTop: '16px', backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    {error && <p style={{ marginTop: '16px', color: 'red' }}>{error}</p>}
                    {userData && (
                        <table style={{ marginTop: '24px', width: '100%', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <thead>
                                <tr>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Lender Id</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Lender Name</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Account Number</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Amount</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Transaction Date</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Transaction Screenshot</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Status</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Approve</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>{userData.lenderId}</td>
                                    <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>{userData.lenderName}</td>
                                    <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>{userData.accountNumber}</td>
                                    <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>{userData.amount}</td>
                                    <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>{userData.transactionDate}</td>
                                    <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
                                        <img src={userData.transactionScreenshot} alt="Screenshot" style={{ width: '64px', height: '64px' }} />
                                    </td>
                                    <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>{userData.status}</td>
                                    <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>{userData.approve}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Fileconvension;
