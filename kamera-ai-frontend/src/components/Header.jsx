import React from 'react';
import { Link } from 'react-router-dom'; // Link for navigation
import logo from '../images/Logo.png'; // Import the logo image
import '../styles/Header.css';

const Header = () => {
    // Function to handle smooth scrolling
    const handleScroll = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light fixed-top">
            <div className="container-fluid">
                {/* Logo and Brand */}
                <Link className="navbar-brand" to="/">
                    <img src={logo} alt="Kamera.Ai Logo" className="logo" />
                    <span className="brand-text">Kamera.Ai</span>
                </Link>

                {/* Toggler button for mobile view */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar links */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/fall-detection">Fall Detection</Link>
                        </li>
                        <li className="nav-item dropdown">
                            <Link className="nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                About Us
                            </Link>
                            <ul className="dropdown-menu">
                                <li><button className="dropdown-item" onClick={() => handleScroll('about-kamera-ai')}>About Kamera.Ai</button></li>
                                <li><button className="dropdown-item" onClick={() => handleScroll('teams')}>Teams</button></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/register">Register</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/sign-in">Sign In</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
