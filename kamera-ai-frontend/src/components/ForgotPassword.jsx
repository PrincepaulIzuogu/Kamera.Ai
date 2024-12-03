import React, { useState, useEffect } from 'react';
import '../styles/Register.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', clinic_name: '' }); // Match backend field names
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      // API call to initiate password reset
      const response = await axios.post('http://127.0.0.1:5001/forgot-password', formData);

      if (response.data.message) {
        navigate('/set-new-password'); // Redirect to token verification page
      }
    } catch (error) {
      console.error('Error during password reset request:', error);

      // Extract error details
      if (error.response && error.response.data && error.response.data.detail) {
        const errorDetail = Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map((err) => err.msg).join(', ')
          : error.response.data.detail;

        setErrorMessage(errorDetail); // Set the error message as a string
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p>Enter your registered email and clinic name to reset your password.</p>

        {/* Error Message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Email */}
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Clinic Name */}
        <div className="form-group">
          <input
            type="text"
            name="clinic_name"
            placeholder="Enter your clinic name"
            value={formData.clinic_name}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn"
          style={{
            backgroundColor: !loading ? 'green' : '#ccc',
            cursor: !loading ? 'pointer' : 'not-allowed',
            color: 'white',
          }}
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
