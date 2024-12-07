import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer2 = () => {
    return (
        <footer className="footer">
            <nav>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/profile">Profile</Link>
                <a href="mailto:Kamera.Ai.Support@gmail.com">Contact Support</a>
                <Link to="/privacy-policy">Privacy Policy</Link>
                <Link to="/terms-of-service">Terms of Service</Link>
            </nav>
            <p>&copy; 2024 Kamera.Ai. All rights reserved.</p>
        </footer>
    );
};

export default Footer2;
