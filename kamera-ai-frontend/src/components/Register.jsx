import React, { useState, useEffect } from 'react';
import '../styles/Register.css';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    initial: '',
    firstName: '',
    lastName: '',
    gender: '',
    position: '',
    clinicName: '',
    location: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [validation, setValidation] = useState({
    emailMatch: true,
    emailValid: true,
    passwordMatch: true,
    isPasswordValid: true,
    termsAccepted: true,
  });

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    capital: false,
    number: false,
    special: false,
    match: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Button loading state
  const [errorMessage, setErrorMessage] = useState(''); // Display error messages

  // Validate password strength
  const checkPasswordValidation = (password, confirmPassword) => {
    setPasswordValidation({
      length: password.length >= 8,
      capital: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password === confirmPassword,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updatedForm = {
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    };
    setForm(updatedForm);

    // Update password validation
    if (name === 'password' || name === 'confirmPassword') {
      checkPasswordValidation(updatedForm.password, updatedForm.confirmPassword);
    }

    // Update other validation checks
    setValidation({
      emailMatch: updatedForm.email === updatedForm.confirmEmail,
      emailValid: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(updatedForm.email),
      passwordMatch: updatedForm.password === updatedForm.confirmPassword,
      isPasswordValid: passwordValidation.length && passwordValidation.capital && passwordValidation.number && passwordValidation.special,
      termsAccepted: updatedForm.terms,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setErrorMessage('Please fill out all required fields correctly.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      // API call to backend register endpoint
      const response = await axios.post('https://kamera-ai-backend-aacmbegmdjcxfhdq.germanywestcentral-01.azurewebsites.net/register', {
        initial: form.initial,
        first_name: form.firstName, // Ensure this matches the Pydantic model
        last_name: form.lastName,
        gender: form.gender,
        position: form.position,
        clinic_name: form.clinicName,
        location: form.location,
        email: form.email,
        password: form.password,
        confirm_password: form.confirmPassword,
      });

      if (response.data.message) {
        navigate('/authorization');
      }
    } catch (error) {
      console.error('Error during registration:', error);

      // Check if error response contains details
      if (error.response && error.response.data && error.response.data.detail) {
        // If detail is an array of errors, map them into a string
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const goToSignIn = () => {
    navigate('/sign-in');
  };

  const isFormValid = validation.emailMatch && validation.emailValid && validation.passwordMatch && validation.isPasswordValid && validation.termsAccepted;

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>

        {/* Error Message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Initial */}
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

        {/* First Name */}
        <div className="form-group">
          <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="form-control" />
        </div>

        {/* Last Name */}
        <div className="form-group">
          <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="form-control" />
        </div>

        {/* Gender */}
        <div className="form-group">
          <select name="gender" value={form.gender} onChange={handleChange} className="form-control">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Position */}
        <div className="form-group">
          <select name="position" value={form.position} onChange={handleChange} className="form-control">
            <option value="">Select Position in Clinic</option>
            <option value="Physician">Physician</option>
            <option value="Nurse">Nurse</option>
            <option value="Administrator">Administrator</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Clinic Name */}
        <div className="form-group">
          <input type="text" name="clinicName" placeholder="Clinic Name" value={form.clinicName} onChange={handleChange} className="form-control" />
        </div>

        {/* Location */}
        <div className="form-group">
          <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} className="form-control" />
        </div>

        {/* Email */}
        <div className="form-group">
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="form-control" />
          {!validation.emailValid && <small className="error">Please enter a valid email</small>}
        </div>

        {/* Confirm Email */}
        <div className="form-group">
          <input type="email" name="confirmEmail" placeholder="Confirm Email" value={form.confirmEmail} onChange={handleChange} className="form-control" />
          {!validation.emailMatch && <small className="error">Emails do not match</small>}
        </div>

        {/* Password */}
        <div className="form-group" style={{ position: 'relative' }}>
          <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} className="form-control" />
          <span onClick={togglePasswordVisibility} style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '10px', zIndex: 1 }}>
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="form-control" />
          <button type="button" onClick={toggleConfirmPasswordVisibility} className="eye-icon">
            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
          {!validation.passwordMatch && <small className="error">Passwords do not match</small>}
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

        {/* Terms and Conditions */}
        <div className="form-group">
          <label>
            <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} />
            I agree to the <a href="/terms-of-service" target="_blank">Terms & Conditions</a>
          </label>
          {!validation.termsAccepted && <small className="error">You must accept the Terms & Conditions</small>}
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={!isFormValid || loading} style={{ backgroundColor: isFormValid ? 'green' : 'grey', cursor: isFormValid ? 'pointer' : 'not-allowed' }}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        {/* Link to Sign In */}
        <p>
          Already have an account? <span onClick={goToSignIn} style={{ color: 'blue', cursor: 'pointer' }}>Sign In</span>
        </p>
      </form>
    </div>
  );
};

export default Register;
