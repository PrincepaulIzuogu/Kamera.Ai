import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For navigation
import '../styles/AboutKameraAi.css';
import '../styles/TeamsSection.css';
import '../styles/HomePage.css';

const HomePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [isAssistantVisible, setIsAssistantVisible] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    clinic: '',
    time: '',
    email: '',
  });

  useEffect(() => {
    setShowForm(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/schedule-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Appointment scheduled successfully.');
        setFormData({ name: '', clinic: '', time: '', email: '' }); // Reset form
      } else {
        alert('Failed to schedule the appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('An error occurred while scheduling the appointment.');
    }
  };

  const handleYesClick = () => {
    setShowForm(true);
    setIsAssistantVisible(false);
  };

  const handleNoClick = () => {
    setIsAssistantVisible(false);
    setShowForm(false);
  };

  const handleExitClick = () => {
    setIsAssistantVisible(true);
    setShowForm(false);
  };

  return (
    <div className="homepage">
      {/* Homepage Section */}
      <section className="homepage-section text-center">
        <div className="container">
          <p className="about-text">We are Kamera.Ai, dedicated to early clinical fall detection using AI-driven solutions.</p>
          <video className="fall-video img-fluid" autoPlay loop muted>
            <source src={require('../videos/FallVideo01.mp4')} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* About Kamera.Ai Section */}
      {/* Content omitted for brevity */}

      {/* Ai Assist (Yes/No Form) */}
      {isAssistantVisible && (
        <div className="ai-assist">
          <h3>Ai Assist</h3>
          <p>Book a Call Appointment?</p>
          <div className="buttons">
            <button className="yes-button" onClick={handleYesClick}>Yes</button>
            <button className="no-button" onClick={handleNoClick}>No</button>
          </div>
        </div>
      )}

      {/* Appointment Form */}
      {showForm && !isAssistantVisible && (
        <div className="appointment-form">
          <h3>Schedule Appointment</h3>
          <form onSubmit={handleFormSubmit}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your Name"
              required
            />
            <label>Clinic:</label>
            <input
              type="text"
              name="clinic"
              value={formData.clinic}
              onChange={handleInputChange}
              placeholder="Clinic Name"
              required
            />
            <label>Time:</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your Email"
              required
            />
            <button type="submit">Schedule</button>
          </form>
          <button className="exit-button" onClick={handleExitClick}>Exit</button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
