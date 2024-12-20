import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For navigation
import '../styles/AboutKameraAi.css'; // Import the existing CSS for About Kamera.Ai
import '../styles/TeamsSection.css'; // Import the new CSS for Teams section
import '../styles/HomePage.css'; // Import the existing CSS for the homepage

const HomePage = () => {
  const [showForm, setShowForm] = useState(false); // Whether the form is visible
  const [isAssistantVisible, setIsAssistantVisible] = useState(true); // Whether the assistant form is visible
  const [formData, setFormData] = useState({
    name: '',
    clinic: '',
    time: '',
    email: '',
  });
  const [isScheduling, setIsScheduling] = useState(false); // Track whether the scheduling is in progress

  useEffect(() => {
    // Automatically show the assistant form when the page loads and trigger slide-up animation
    setShowForm(true);
  }, []);

  const handleYesClick = () => {
    setShowForm(true); // Show the form
    setIsAssistantVisible(false); // Hide the assistant
  };

  const handleNoClick = () => {
    setIsAssistantVisible(false); // Hide the assistant
    setShowForm(false); // Slide down the form
  };

  const handleExitClick = () => {
    setIsAssistantVisible(true); // Show the assistant
    setShowForm(false); // Slide down the form
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Start scheduling process
    setIsScheduling(true);

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
    } finally {
      // Reset scheduling state after attempt
      setIsScheduling(false);
    }
  };

  return (
    <div className="homepage">
      {/* Homepage Section (Full Screen) */}
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
      <section id="about-kamera-ai" className="about-kamera-ai-section">
        <h2>About Kamera.Ai</h2>
        <p>At Kamera.Ai, we are dedicated to enhancing healthcare technology with cutting-edge AI-driven solutions. Our primary mission is to detect early falls and trigger early responses, as sick patients are particularly prone to falls. We aim to protect their well-being while maintaining the highest standards of data privacy.</p>

        <h3>Our Mission</h3>
        <p>Our mission is simple yet powerful: to detect falls early and respond quickly to prevent further harm. Falls in hospitals or care facilities can be devastating, especially for patients with serious health conditions. By leveraging our advanced AI technology, we ensure that falls are detected in real time. The AI compares video footage to our trained model, determining whether a fall has occurred or not. Importantly, <strong>we do not save any patient data or videos</strong>.</p>

        <p>When a fall is detected, an alert is sent immediately to the responsible department in the clinic, notifying them through one of three possible channels: email, phone, or directly within the app itself. This ensures a fast and efficient response, protecting patients from further harm.</p>

        <div className="about-kamera-ai-images">
          <img src={require('../images/image08.jpg')} alt="App Workflow 1" />
          <img src={require('../images/image07.jpg')} alt="App Workflow 2" />
        </div>
        <p>The images above show how our app works: a fall detection system that operates in real-time, ensuring patient safety at all times.</p>

        <h3>Our Vision</h3>
        <p>As we continue to evolve, our vision is to expand the system's capabilities to not only detect falls but also to identify factors that contribute to falls. This includes detecting hazardous situations like spilled water, misplaced sharp objects, and more. By proactively identifying these risks, we can help reduce falls and further improve patient safety across healthcare facilities.</p>

        <div className="about-kamera-ai-images">
          <img src={require('../images/image06.avif')} alt="Data Privacy 1" />
          <img src={require('../images/image05.webp')} alt="Data Privacy 2" />
        </div>
        <p>As shown in the images above, we prioritize data privacy. Our AI model processes videos in real time and compares them with our model, but no patient data is ever stored. This ensures that the privacy and security of patients' personal information is never compromised.</p>

        <p>Our goal is to help clinics provide safer environments for their patients while ensuring the highest standards of confidentiality and data protection. We are committed to using AI responsibly and ethically to improve healthcare outcomes.</p>
      </section>

      {/* Teams Section */}
      <section id="teams" className="teams-section">
        <h2>Our Teams</h2>
        <p>Meet the people who drive innovation at Kamera.Ai.</p>

        <div className="teams-images">
          <div className="team-member">
            <img src={require('../images/image11.jpeg')} alt="Noura Eltahawi - Frontend Developer" />
            <h3>Noura Eltahawi</h3>
            <p>Frontend Developer & Business Lead</p>
            
          </div>
          <div className="team-member">
            <img src={require('../images/image12.jpg')} alt="Princepaul Izuogu - Backend Developer" />
            <h3>Princepaul Izuogu</h3>
            <p>Backend Developer & Product Manager</p>
            
          </div>
        </div>

        <p>Our team is composed of passionate professionals committed to making healthcare safer through innovative AI-driven solutions.</p>
      </section>

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
            <button type="submit">
              {isScheduling ? "Scheduling..." : "Schedule"} {/* Dynamic text */}
            </button>
          </form>
          <button className="exit-button" onClick={handleExitClick}>Exit</button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
