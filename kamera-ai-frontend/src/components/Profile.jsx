import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css"; // Assuming you have styles for this component

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
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

        const response = await fetch("http://localhost:5001/api/profile", {
          headers,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile details");
        }

        const data = await response.json();
        setUserDetails(data);
        setFormData(data); // Prepopulate the form with the current details
      } catch (error) {
        console.error("Error fetching profile details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch("http://localhost:5001/api/profile", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();
      setUserDetails(updatedData);
      setEditing(false); // Exit edit mode
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <h2>Profile Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="profile-detail">
          <label>First Name:</label>
          {editing ? (
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userDetails.first_name}</p>
          )}
        </div>
        <div className="profile-detail">
          <label>Last Name:</label>
          {editing ? (
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userDetails.last_name}</p>
          )}
        </div>
        <div className="profile-detail">
          <label>Email:</label>
          <p>{userDetails.email}</p>
        </div>
        <div className="profile-detail">
          <label>Gender:</label>
          {editing ? (
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userDetails.gender}</p>
          )}
        </div>
        <div className="profile-detail">
          <label>Clinic Name:</label>
          {editing ? (
            <input
              type="text"
              name="clinic_name"
              value={formData.clinic_name}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userDetails.clinic_name}</p>
          )}
        </div>
        <div className="profile-detail">
          <label>Location:</label>
          {editing ? (
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userDetails.location}</p>
          )}
        </div>

        <div className="profile-buttons">
          <button
            type="submit"
            disabled={!editing}
            className="save-btn"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="edit-btn"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
