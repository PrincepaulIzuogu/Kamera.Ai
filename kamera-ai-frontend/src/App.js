import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router
import HomePage from './components/HomePage'; // Import the HomePage component
import FallDetectionPage from './components/FallDetectionPage'; // Default import
import VideoRecordingPage from './components/VideoRecordingPage';
import FallVideoRecordingPage from './components/FallVideoRecordingPage';
import FallVideoConfirmation from './components/FallVideoConfirmation';
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
import CreateModel from './components/CreateModel';
import VideoConfirmationPage from './components/VideoConfirmationPage'; 
import PersonalisedFallDetectionPage from './components/PersonalisedFallDetectionPage';

function App() {
    // Function to handle scrolling to the About Us section
    const scrollToAboutUs = () => {
        const aboutUsSection = document.getElementById("about-us");
        if (aboutUsSection) {
            aboutUsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <React.StrictMode>
            <Router>
                <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Header scrollToAboutUs={scrollToAboutUs} /> {/* Pass the function to the header */}
                    <div style={{ flex: 1 }}>
                        <Routes>
                            <Route path="/" element={<HomePage />} /> {/* Render HomePage for the root route */}
                            <Route path="/fall-detection-page" element={<FallDetectionPage />} />
                            <Route path="/video-recording/:id" element={<VideoRecordingPage />} />  {/* Test ID is passed here */}
                            <Route path="/video-confirmation/:id" element={<VideoConfirmationPage />} /> {/* Test ID in URL for confirmation */}
                            <Route path="/video-recording/fall/:id" element={<FallVideoRecordingPage />} />
                            <Route path="/fall-video-confirmation/:id" element={<FallVideoConfirmation />} />
                            <Route path="/create-model/:testId" element={<CreateModel />} />
                            <Route path="/personalised-fall-detection/:testId" element={<PersonalisedFallDetectionPage />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/sign-in" element={<SignIn />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/authorization" element={<Authorization />} />
                            <Route path="/set-new-password" element={<SetNewPassword />} />
                        </Routes>
                    </div>
                    <Footer /> {/* Display the footer */}
                </div>
            </Router>
        </React.StrictMode>
    );
}

export default App;