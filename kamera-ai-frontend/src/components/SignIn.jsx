import React, { useState } from 'react';
import '../styles/Register.css'; // Import the CSS for styling (same as Register)

const SignIn = () => {
  // State for inputs and validation checks
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [validation, setValidation] = useState({
    isPasswordValid: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  // Function to handle input changes and validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Password validation (at least 8 characters with a mix of letters and numbers)
    if (name === 'password') {
      const isPasswordValid = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(value);
      setValidation({
        ...validation,
        isPasswordValid: isPasswordValid
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="register-container">
      <form className="register-form">
        <h2>Sign In</h2>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="form-control"
          />
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
          <span className="eye-icon" onClick={togglePasswordVisibility}>👁</span>
          {!validation.isPasswordValid && form.password && (
            <small className="error">Password must be at least 8 characters and include letters and numbers</small>
          )}
        </div>

        <button type="submit" disabled={!validation.isPasswordValid} className="btn">
          Sign In
        </button>

        <div className="signin-link">
          <p>Don't have an account? <a href="/register">Register</a></p>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
