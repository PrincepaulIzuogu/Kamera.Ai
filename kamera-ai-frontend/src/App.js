import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router
import HomePage from './components/HomePage'; // Import the HomePage component
import FallDetection from './components/FallDetection'; // Import the FallDetection component
import Dashboard from './components/Dashboard'; // Import the Dashboard component
import Register from './components/Register'; // Import Register component
import SignIn from './components/SignIn'; // Import SignIn component
import Header from './components/Header'; // Import Header component
import Footer from './components/Footer'; // Import Footer component
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // This includes both Bootstrap JS and Popper.js
import ForgotPassword from './components/ForgotPassword';
import Authorization from './components/Authorization';
import SetNewPassword from './components/SetNewPassword';



function App() {
    // Function to handle scrolling to the About Us section
    const scrollToAboutUs = () => {
        const aboutUsSection = document.getElementById("about-us");
        if (aboutUsSection) {
            aboutUsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Router>
            <Header scrollToAboutUs={scrollToAboutUs} /> {/* Pass the function to the header */}
            <Routes>
                <Route path="/" element={<HomePage />} /> {/* Render HomePage for the root route */}
                <Route path="/fall-detection" element={<FallDetection />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/register" element={<Register />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/authorization" element={<Authorization />} />
                <Route path="/set-new-password" element={<SetNewPassword />} />
            </Routes>
            <Footer /> {/* Display the footer */}
        </Router>
    );
}

export default App;