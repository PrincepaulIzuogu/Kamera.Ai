import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/UserGuild.css'; // Make sure to update this for the new styles

const UserGuild = () => {
  const [isSubscribed, setIsSubscribed] = useState(false); // Replace this with actual logic to check if the user is subscribed

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="user-guide-container">

      {/* Navigation to sections */}
      <div className="guide-navigation">
        
        <button
          onClick={() => document.getElementById('app-guide').scrollIntoView({ behavior: 'smooth' })}
        >
          Go to App User Guide
        </button>
      </div>

      {/* Training & Data Collection Process Guide Section */}
      <section id="training-guide" className="guide-section">
        <h2>Training & Data Collection Process Guide</h2>

        <div className="image-container">
          <img src={require('../images/collection.png')} alt="Data Collection Process" className="guide-image"/>
        </div>

        <p>
          Accurate fall detection depends on high-quality training data collected in specific scenarios. This guide provides 
          detailed instructions on how to capture the necessary data to train our AI-powered fall detection model. The video 
          footage should cover various postures and activities, with careful attention to angles that accurately represent real-world scenarios.
        </p>

        <h3>Data Collection Scenarios</h3>
        <ul>
          <li>Walking</li>
          <li>Standing</li>
          <li>Sitting and Rising</li>
          <li>Rotational Falls</li>
          <li>Lying Down</li>
          <li>Getting up</li>
          <li>Forward Falls</li>
          <li>Backward Falls</li>
          <li>Sideways Falls</li>
          <li>Falls from Heights</li>
          <li>Trip-Induced Falls</li>
        </ul>

        <p>
          It's important to collect both fall and non-fall data from various angles to ensure the model is trained to accurately 
          identify different types of falls. You can use a real person or a dummy to simulate these actions in the video. 
          The videos should be captured in a controlled environment, ensuring the camera captures precise angles as described.
        </p>

        <h3>Download Resources</h3>
        <div className="download-buttons">
          {/* Disable download button for non-subscribed users */}
          <button className="download-btn" disabled={!isSubscribed}>
            {isSubscribed ? (
              <Link to="/downloads/training-guide.mp4" target="_blank">Download Training Video</Link>
            ) : (
              <span style={{ color: 'red' }}>Only Subscribed Users Can Access</span>
            )}
          </button>

          <button className="download-btn" disabled={!isSubscribed}>
            {isSubscribed ? (
              <Link to="/downloads/training-guide.pdf" target="_blank">Download Training Guide (PDF)</Link>
            ) : (
              <span style={{ color: 'red' }}>Only Subscribed Users Can Access</span>
            )}
          </button>
        </div>
      </section>

      {/* App User Guide Section */}
      <section id="app-guide" className="guide-section">
        <h2>App User Guide</h2>
        <p>
          The Kamera.Ai app provides an intuitive and user-friendly interface for monitoring patient safety and detecting falls in real-time. This guide walks you through the app's key features and functionality, ensuring you can effectively use the platform for patient monitoring.
        </p>

        <h3>Key Features</h3>
        <ul>
          <li>Real-time fall detection using AI</li>
          <li>Alerts sent to responsible staff upon fall detection</li>
          <li>Comprehensive logs of fall incidents</li>
        </ul>

        <h3>How to Use the App</h3>
        <p>
          The app is designed to integrate with existing hospital systems, providing real-time updates on patient status and fall incidents. 
          Once the system is set up, it continuously monitors the area using CCTV cameras and AI technology. When a fall is detected, 
          an alert is sent immediately to the responsible department for quick action.
        </p>

        <h3>Download Resources</h3>
        <div className="download-buttons">
          <button className="download-btn">
            <Link to={require('../images/statements.pdf')} target="_blank">Download PDF User Guide</Link>
          </button>
          <button className="download-btn">
            <Link to={require('../videos/userguild.mp4')} target="_blank">Download User Guide Video</Link>
          </button>
        </div>
      </section>
    </div>
  );
};

export default UserGuild;
