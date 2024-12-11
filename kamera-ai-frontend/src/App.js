import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import FallDetectionPage from "./components/FallDetectionPage";
import VideoRecordingPage from "./components/VideoRecordingPage";
import FallVideoRecordingPage from "./components/FallVideoRecordingPage";
import FallVideoConfirmation from "./components/FallVideoConfirmation";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import SignIn from "./components/SignIn";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Footer2 from "./components/Footer2";
import ForgotPassword from "./components/ForgotPassword";
import Authorization from "./components/Authorization";
import SetNewPassword from "./components/SetNewPassword";
import CreateModel from "./components/CreateModel";
import VideoConfirmationPage from "./components/VideoConfirmationPage";
import PersonalisedFallDetectionPage from "./components/PersonalisedFallDetectionPage";
import Header2 from "./components/Header2";
import FallsDetails from "./components/FallsDetails";
import RoomManagement from './components/RoomManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleSignIn = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <React.StrictMode>
      <Router>
        {isAuthenticated ? (
          <Header2 handleLogout={handleLogout} /> // Pass handleLogout to Header2
        ) : (
          <Header />
        )}
        <div
          className="app-container"
          style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/fall-detection-page" element={<FallDetectionPage />} />
              
              <Route path="/video-recording/:id" element={<VideoRecordingPage />} />
              <Route path="/video-confirmation/:id" element={<VideoConfirmationPage />} />
              <Route path="/video-recording/fall/:id" element={<FallVideoRecordingPage />} />
              <Route path="/fall-video-confirmation/:id" element={<FallVideoConfirmation />} />
              <Route path="/personalised-fall-detection/:testId" element={<PersonalisedFallDetectionPage />} />
              <Route path="/create-model/:testId" element={<CreateModel />} />
              <Route
                path="/dashboard"
                element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/sign-in" />}
              />
              <Route
                path="/room-management"
                element={isAuthenticated ? <RoomManagement /> : <Navigate to="/sign-in" />}
              />
              
              {/* Public routes */}
              <Route path="/sign-in" element={<SignIn onSignIn={handleSignIn} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/authorization" element={<Authorization />} />
              <Route path="/set-new-password" element={<SetNewPassword />} />
              
              <Route path="/header2" element={<Header2 />} />
              <Route
                path="/falls-details"
                element={isAuthenticated ? <FallsDetails /> : <Navigate to="/sign-in" />}
              />
            </Routes>
          </div>
          {isAuthenticated ? <Footer2 /> : <Footer />}
        </div>
      </Router>
    </React.StrictMode>
  );
}

export default App;
