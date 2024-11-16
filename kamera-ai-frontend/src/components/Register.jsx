import React, { useState } from 'react';
import '../styles/Register.css'; // Import the CSS for styling

const Register = () => {
  // State for inputs and validation checks
  const [form, setForm] = useState({
    initial: '', firstName: '', lastName: '', gender: '', position: '', clinicName: '', location: '', email: '', confirmEmail: '', password: '', confirmPassword: '', terms: false
  });

  const [validation, setValidation] = useState({
    emailMatch: false,
    passwordMatch: false,
    isPasswordValid: false,
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to handle input changes and validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Validation checks
    if (name === 'password' || name === 'confirmPassword') {
      const isPasswordValid = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(value); // Password must contain at least one letter, one number, and be at least 8 characters long
      const passwordMatch = form.password === form.confirmPassword;
      setValidation({
        ...validation,
        isPasswordValid: isPasswordValid,
        passwordMatch: passwordMatch
      });
    }

    if (name === 'email' || name === 'confirmEmail') {
      setValidation({
        ...validation,
        emailMatch: form.email === form.confirmEmail
      });
    }

    if (name === 'terms') {
      setValidation({
        ...validation,
        termsAccepted: e.target.checked
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register-container">
      <form className="register-form">
        <h2>Register</h2>
        
        <div className="input-row">
          <div className="form-group">
            <select name="initial" value={form.initial} onChange={handleChange} className="form-control">
              <option value="">Select Initial</option>
              <option value="Dr.">Dr.</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="form-control" />
          </div>

          <div className="form-group">
            <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="form-control" />
          </div>
        </div>

        <div className="input-row">
          <div className="form-group">
            <select name="gender" value={form.gender} onChange={handleChange} className="form-control">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <input type="text" name="position" placeholder="Position in Clinic" value={form.position} onChange={handleChange} className="form-control" />
          </div>

          <div className="form-group">
            <input type="text" name="clinicName" placeholder="Clinic Name" value={form.clinicName} onChange={handleChange} className="form-control" />
          </div>
        </div>

        <div className="input-row">
          <div className="form-group">
            <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} className="form-control" />
          </div>

          <div className="form-group">
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="form-control" />
          </div>

          <div className="form-group">
            <input type="email" name="confirmEmail" placeholder="Confirm Email" value={form.confirmEmail} onChange={handleChange} className="form-control" />
            {!validation.emailMatch && form.confirmEmail && <small className="error">Emails do not match</small>}
          </div>
        </div>

        <div className="input-row">
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
            {!validation.isPasswordValid && form.password && <small className="error">Password must be at least 8 characters and include letters and numbers</small>}
          </div>

          <div className="form-group">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              className="form-control" 
            />
            <span className="eye-icon" onClick={toggleConfirmPasswordVisibility}>👁</span>
            {!validation.passwordMatch && form.confirmPassword && <small className="error">Passwords do not match</small>}
          </div>
        </div>

        <div className="form-group">
          <label>
            <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} /> 
            I agree to the <a href="/terms-of-service" target="_blank">Terms & Conditions</a>
          </label>
          {!validation.termsAccepted && form.terms === false && <small className="error">You must accept the Terms & Conditions</small>}
        </div>

        <button type="submit" disabled={!validation.emailMatch || !validation.passwordMatch || !validation.isPasswordValid || !validation.termsAccepted} className="btn">Register</button>

        <div className="signin-link">
          <p>Already have an account? <a href="/sign-in">Sign In</a></p>
        </div>
      </form>
    </div>
  );
};

export default Register;
