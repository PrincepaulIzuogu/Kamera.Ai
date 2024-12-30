import React, { useState } from 'react';
import '../styles/Register.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SetNewPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    capital: false,
    number: false,
    special: false,
    match: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to validate password
  const validatePassword = (password, confirmPassword) => {
    setPasswordValidation({
      length: password.length >= 8,
      capital: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password === confirmPassword,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Trigger password validation
    if (name === 'password' || name === 'confirmPassword') {
      validatePassword(updatedFormData.password, updatedFormData.confirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!passwordValidation.match) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // API call to reset password
      const response = await axios.post('https://kamera-ai-backend-aacmbegmdjcxfhdq.germanywestcentral-01.azurewebsites.net/set-new-password', {
        token: formData.token.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      if (response.data.message) {
        navigate('/sign-in'); // Redirect to sign-in page
      }
    } catch (error) {
      console.error('Error during password reset:', error);

      // Extract error details
      if (error.response && error.response.data && error.response.data.detail) {
        const errorDetail = Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map((err) => err.msg).join(', ')
          : error.response.data.detail;

        setErrorMessage(errorDetail); // Set the error message
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
        <h2>Set New Password</h2>
        <p>Please enter the token sent to your email and your new password below.</p>

        {/* Error Message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Token */}
        <div className="form-group">
          <input
            type="text"
            name="token"
            placeholder="Enter Token"
            value={formData.token}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Password Validation Points */}
        <div className="password-validation">
          <ul>
            <li className={passwordValidation.length ? 'valid' : ''}>Password must be at least 8 characters</li>
            <li className={passwordValidation.capital ? 'valid' : ''}>Password must include at least one capital letter</li>
            <li className={passwordValidation.number ? 'valid' : ''}>Password must include at least one number</li>
            <li className={passwordValidation.special ? 'valid' : ''}>Password must include at least one special character</li>
            <li className={passwordValidation.match ? 'valid' : ''}>Passwords must match</li>
          </ul>
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

export default SetNewPassword;
