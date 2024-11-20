import React, { useState } from 'react';
import '../styles/Register.css'; // Reuse the CSS from Register
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const SignIn = () => {
  const navigate = useNavigate();

  // State for inputs and validation
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [validation, setValidation] = useState({
    isEmailValid: false,
    isPasswordValid: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes and validations
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'email') {
      // Simple email validation regex
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setValidation((prev) => ({
        ...prev,
        isEmailValid
      }));
    }

    if (name === 'password') {
      // Password validation: at least 8 characters with letters and numbers
      const isPasswordValid = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(value);
      setValidation((prev) => ({
        ...prev,
        isPasswordValid
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password'); // Navigate to ResetPassword.jsx
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // API call to backend for login
      const response = await axios.post('http://127.0.0.1:5001/sign-in', {
        email: form.email,
        password: form.password
      });

      if (response.data.message) {
        // Navigate to dashboard on successful login
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);

      // Extract error details
      if (error.response && error.response.data && error.response.data.detail) {
        const errorDetail = Array.isArray(error.response.data.detail)
          ? error.response.data.detail.join(', ')
          : error.response.data.detail;

        setErrorMessage(errorDetail);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = validation.isEmailValid && validation.isPasswordValid;

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>

        {/* Error Message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Email Input */}
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="form-control"
          />
          {!validation.isEmailValid && form.email && (
            <small className="error">Please enter a valid email address</small>
          )}
        </div>

        {/* Password Input */}
        <div className="form-group">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="form-control"
          />
          <span
            className="eye-icon"
            onClick={togglePasswordVisibility}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              right: '10px',
              top: '10px',
              zIndex: 1
            }}
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </span>
          {!validation.isPasswordValid && form.password && (
            <small className="error">Invalid Password</small>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="forgot-password">
          <p onClick={handleForgotPassword} style={{ color: 'green', cursor: 'pointer' }}>
            Forgot Password?
          </p>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="btn"
          style={{
            backgroundColor: isFormValid && !loading ? 'green' : '#ccc',
            cursor: isFormValid && !loading ? 'pointer' : 'not-allowed',
            color: 'white'
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Register Link */}
        <div className="signin-link">
          <p>
            Don't have an account?{' '}
            <a href="/register">Register</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
