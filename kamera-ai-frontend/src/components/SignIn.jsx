import React, { useState, useEffect } from 'react';
import '../styles/Register.css'; // Reuse the CSS from Register
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const SignIn = ({ onSignIn }) => {
  const navigate = useNavigate();

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'email') {
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setValidation((prev) => ({ ...prev, isEmailValid }));
    }

    if (name === 'password') {
      const isPasswordValid = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(value);
      setValidation((prev) => ({ ...prev, isPasswordValid }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
  
    try {
      const response = await axios.post('https://kamera-ai-backend-aacmbegmdjcxfhdq.germanywestcentral-01.azurewebsites.net/sign-in', {
        email: form.email,
        password: form.password
      });
  
      const { access_token, user } = response.data;
  
      if (access_token) {
        console.log("Storing access token:", access_token);
        localStorage.setItem('access_token', access_token); // Store token securely
  
        onSignIn(user); // Pass user data to parent
        navigate('/dashboard'); // Redirect to dashboard
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
  
      if (error.response && error.response.data && error.response.data.detail) {
        setErrorMessage(error.response.data.detail);
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
        {errorMessage && <div className="error-message">{errorMessage}</div>}

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

        <div className="forgot-password">
          <p onClick={handleForgotPassword} style={{ color: 'green', cursor: 'pointer' }}>
            Forgot Password?
          </p>
        </div>

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
