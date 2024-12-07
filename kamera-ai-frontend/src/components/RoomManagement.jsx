import React from "react";
import "../styles/RoomManagement.css";

const RoomManagement = () => {
  const rooms = []; // Replace with fetched room data.

  return (
    <div className="room-management-page">
      <h1 className="title">Room Management</h1>

      <div className="controls">
        <div className="metric-card">
          <p>No. of Registered Rooms: {rooms.length}</p>
          <button className="btn-register">Register New Room</button>
        </div>

        <div className="search-bar">
          <input type="text" placeholder="Search Room" />
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
                <td>{room.cctvDetails}</td>
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
