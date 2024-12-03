import React, { useState, useEffect } from 'react';
import '../styles/Register.css'; 



const Dashboard = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="dashboard">
      <h1>Kamera.Ai</h1>
      <h3>Your partner for early clinical fall detection</h3>
      <button>Subscribe</button>
      <button>Register New Room</button>
    </div>
  );
};


export default Dashboard;