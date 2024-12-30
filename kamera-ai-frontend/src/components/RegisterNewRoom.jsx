import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/RegisterNewRoom.css"; // Import the CSS

const RegisterNewRoom = () => {
  const navigate = useNavigate(); // Hook to navigate to different routes
  const [roomDetails, setRoomDetails] = useState({
    number: "",
    floor: "",
    building: "",
    status: "",
    cctv_ip: "",
    cctv_port: "",
    cctv_username: "",
    cctv_password: "",
    stream_url: "",
    total_bed: "", // New field for total_bed
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true); // Assume the user is subscribed initially

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  // Check subscription status when the component is mounted
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await fetch("https://kamera-ai-backend-aacmbegmdjcxfhdq.germanywestcentral-01.azurewebsites.net/api/subscription-status", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Subscription status check failed");
        }
        
        const data = await response.json();
        
        if (data.subscription_status !== "Subscribed") {
          setIsSubscribed(false);
          alert("You cannot register a new room without a subscription.");
          navigate("/subscription"); // Redirect to subscription page
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    checkSubscriptionStatus();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Check if all fields are filled
  const validateForm = () => {
    const isValid =
      roomDetails.number &&
      roomDetails.floor &&
      roomDetails.building &&
      roomDetails.status &&
      roomDetails.cctv_ip &&
      roomDetails.cctv_port &&
      roomDetails.cctv_username &&
      roomDetails.cctv_password &&
      roomDetails.stream_url &&
      roomDetails.total_bed;
    setIsFormValid(isValid);
  };

  // Trigger form validation when inputs change
  const handleInputChange = (e) => {
    handleChange(e);
    validateForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Room registered:", roomDetails);
    // You can make an API call here to register the room
  };

  return (
    <div className="register-new-room">
      <h2>Register New Room</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="number">Room Number:</label>
          <input
            type="text"
            id="number"
            name="number"
            value={roomDetails.number}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="floor">Floor:</label>
          <input
            type="text"
            id="floor"
            name="floor"
            value={roomDetails.floor}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="building">Building:</label>
          <input
            type="text"
            id="building"
            name="building"
            value={roomDetails.building}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <input
            type="text"
            id="status"
            name="status"
            value={roomDetails.status}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="cctv_ip">CCTV IP:</label>
          <input
            type="text"
            id="cctv_ip"
            name="cctv_ip"
            value={roomDetails.cctv_ip}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="cctv_port">CCTV Port:</label>
          <input
            type="number"
            id="cctv_port"
            name="cctv_port"
            value={roomDetails.cctv_port}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="cctv_username">CCTV Username:</label>
          <input
            type="text"
            id="cctv_username"
            name="cctv_username"
            value={roomDetails.cctv_username}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="cctv_password">CCTV Password:</label>
          <input
            type="password"
            id="cctv_password"
            name="cctv_password"
            value={roomDetails.cctv_password}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="stream_url">Stream URL:</label>
          <input
            type="text"
            id="stream_url"
            name="stream_url"
            value={roomDetails.stream_url}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="total_bed">Total Beds:</label>
          <input
            type="number"
            id="total_bed"
            name="total_bed"
            value={roomDetails.total_bed}
            onChange={handleInputChange}
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || !isSubscribed}
          className={isFormValid ? "enabled" : ""}
        >
          Register Room
        </button>
      </form>
    </div>
  );
};

export default RegisterNewRoom;
