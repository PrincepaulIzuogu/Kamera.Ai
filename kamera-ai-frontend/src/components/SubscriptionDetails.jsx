import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SubscriptionDetails.css"; // Assuming you have styles for this component

const SubscriptionDetails = () => {
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found. Redirecting to login.");
          navigate("/sign-in");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await fetch("http://localhost:5001/api/subscription-details", {
          headers,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subscription details");
        }

        const data = await response.json();
        setSubscriptionDetails(data);
      } catch (error) {
        console.error("Error fetching subscription details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [navigate]);

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  // If no subscription details are available, show default 'Unsubscribed' values
  const subscriptionInfo = subscriptionDetails || {
    plan: "Unsubscribed",
    rooms: "Unsubscribed",
    price: "Unsubscribed",
    created_at: "Unsubscribed",
  };

  return (
    <div className="subscription-details-page">
      <h2>Subscription Details</h2>
      <div className="subscription-detail">
        <strong>Plan:</strong> {subscriptionInfo.plan}
      </div>
      <div className="subscription-detail">
        <strong>Total Rooms:</strong> {subscriptionInfo.rooms}
      </div>
      <div className="subscription-detail">
        <strong>Price:</strong> {subscriptionInfo.price}
      </div>
      <div className="subscription-detail">
        <strong>Subscription Start Date:</strong> {subscriptionInfo.created_at}
      </div>
      <button onClick={() => navigate("/subscription")}>Subscribe</button>
    </div>
  );
};

export default SubscriptionDetails;
