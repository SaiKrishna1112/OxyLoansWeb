import React from 'react'
import './user.css'
import { useLocation } from 'react-router-dom';

export default function Usercard_user({ data }) {

  console.log(data);

  
  return (
    <>
      {data.map((userData, index) => (
        <div key={index}>
          <div className="card_user">
            <div className="card_user-subtitle">{userData.userId}</div>
            <div className="card_user-title">{userData.name}</div>
            <div className="card_user-subtitle">{userData.email}</div>
            <hr className="card_user-divider" />
            <div className="card_user-footer card_user-footer11">
              <button className="card_user-btn">
                Login
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
