import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios for API requests
import '../styles/FallDetectionPage.css';

const FallDetectionPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false); // Track if email is already registered
  const [testId, setTestId] = useState(null); // Store the test_id from the backend
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email.');
      return;
    }

    try {
      // Log the form data to ensure it's in the correct format
      console.log('Submitting form data:', formData);

      // Send the registration data to the backend
      const response = await axios.post('http://127.0.0.1:5001/fall-detection-test', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const { test_id } = response.data;
        setTestId(test_id); // Store the test_id from the response
        navigate(`/video-recording/${test_id}`); // Navigate to video recording page
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const detail = error.response.data.detail;

        if (detail === 'Email already registered for fall detection test.') {
          setIsRegistered(true); // Mark as already registered
          setTestId(error.response.data.test_id); // Save the existing test_id
          setError('You are already registered for this test. Click continue to proceed.');
        } else {
          setError(detail || 'Failed to submit form. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const handleContinue = () => {
    if (testId) {
      navigate(`/video-recording/${testId}`); // Redirect to video recording page
    } else {
      setError('Cannot proceed. Please try submitting the form again.');
    }
  };

  return (
    <div className="fall-detection-page">
      <div className="form-container">
        <h2>Happy to test our fall detection model?</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {!isRegistered ? (
            <button type="submit" className="next-button">
              Next
            </button>
          ) : (
            <button type="button" onClick={handleContinue} className="continue-button">
              Continue
            </button>
          )}
        </form>
        {error && <p className="error-message">{error}</p>} {/* Display error message */}
      </div>
    </div>
  );
};

export default FallDetectionPage;
