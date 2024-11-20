import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <nav>
        <Link to="/">Home</Link>
        <a href="mailto:Kamera.Ai@gmail.com">Contact Us</a>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-of-service">Terms of Service</Link>
      </nav>
      <p>&copy; 2024 Kamera.Ai. All rights reserved.</p>
    </footer>
  );
};

export default Footer;