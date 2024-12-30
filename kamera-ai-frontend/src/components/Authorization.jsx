import React, { useState, useEffect } from 'react';
import '../styles/Register.css'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Authorization = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');



  const handleCodeChange = (e) => {
    const value = e.target.value;

    if (value.length <= 15) {
      setCode(value);
      setIsCodeValid(true);
    } else {
      setIsCodeValid(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim() || !isCodeValid) {
      setErrorMessage('Please enter a valid code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.post('https://kamera-ai-backend-aacmbegmdjcxfhdq.germanywestcentral-01.azurewebsites.net/confirm-token', {
        token_data: code.trim(),
      });

      if (response.data.message) {
        // Redirect to login upon successful verification
        navigate('/sign-in');
      }
    } catch (error) {
      console.error('Error during token verification:', error);

      if (error.response && error.response.data && error.response.data.detail) {
        const errorDetail = Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map((err) => err.msg).join(', ')
          : error.response.data.detail;

        setErrorMessage(errorDetail);
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
        <h2>Verify Your Account</h2>
        <p>Please enter the verification code sent to your email to verify your account.</p>

        {/* Error Message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Code Input */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter Verification Code"
            value={code}
            onChange={handleCodeChange}
            className="form-control"
          />
          {(!isCodeValid || !code.trim()) && (
            <small className="error">
              {code.trim() ? 'Code should be 15 characters or less' : 'Code cannot be empty'}
            </small>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!code.trim() || !isCodeValid || loading}
          className="btn"
          style={{
            backgroundColor: code.trim() && isCodeValid && !loading ? 'green' : '#ccc',
            cursor: code.trim() && isCodeValid && !loading ? 'pointer' : 'not-allowed',
            color: 'white',
          }}
        >
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>

        {/* Back to Sign In Link */}
        <div className="signin-link">
          <p>
            Already verified?{' '}
            <span
              onClick={() => navigate('/sign-in')}
              style={{ color: 'green', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign In
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Authorization;
