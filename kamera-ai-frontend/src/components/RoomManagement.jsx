import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/RoomManagement.css";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]); // State to hold rooms data
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const navigate = useNavigate(); // Hook to navigate to different routes
  const [newRoom, setNewRoom] = useState({
    number: "",
    floor: "",
    building: "",
    status: "",
    cctv_ip: "",
    cctv_port: "",
    cctv_username: "",
    cctv_password: "",
    stream_url: "",
  });

  // Fetch rooms from the backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/rooms");
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  // Handle room creation
  const handleRoomSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRoom),
      });
      const result = await response.json();
      if (response.ok) {
        setRooms([...rooms, result.room]); // Update rooms with the new room
        setNewRoom({
          number: "",
          floor: "",
          building: "",
          status: "",
          cctv_ip: "",
          cctv_port: "",
          cctv_username: "",
          cctv_password: "",
          stream_url: "",
        });
      } else {
        console.error("Error creating room:", result.message);
      }
    } catch (error) {
      console.error("Error submitting room:", error);
    }
  };

  return (
    <div className="room-management-page">
      <h1 className="title">Room Management</h1>

      <div className="controls">
        <div className="metric-card">
          <p>No. of Registered Rooms: {rooms.length}</p>
          <button className="btn-register" onClick={() => navigate('/register-new-room')}>
            Register New Room
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Room"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn-search">Search</button>
        </div>
      </div>

      <div className="dropdowns">
        <select className="dropdown">
          <option>Sort by Room Number</option>
        </select>
        <select className="dropdown">
          <option>Sort by Building Floor</option>
        </select>
        <select className="dropdown">
          <option>Sort by Date Registered</option>
        </select>
        <select className="dropdown">
          <option>Sort by Status</option>
        </select>
      </div>

      <table className="room-table">
        <thead>
          <tr>
            <th>Room Number</th>
            <th>CCTV Details</th>
            <th>Room Floor</th>
            <th>Status</th>
            <th>Date Registered</th>
            <th>Last Action</th>
            <th>More</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length > 0 ? (
            rooms.map((room, index) => (
              <tr key={index}>
                <td>{room.number}</td>
                <td>{room.cctv_ip}</td>
                <td>{room.floor}</td>
                <td>{room.status}</td>
                <td>{room.dateRegistered}</td>
                <td>{room.lastAction}</td>
                <td>
                  <button className="btn-more">View More</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RoomManagement;
