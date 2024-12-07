import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2"; // Assuming you're using chart.js
import { Chart as ChartJS } from "chart.js/auto"; // For chart.js
import "../styles/FallsDetails.css"; // Import your styles

const FallsDetails = () => {
  const [fallsData, setFallsData] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // Default to table view

  // Fetch fall data when the component mounts
  useEffect(() => {
    const fetchFallsData = async () => {
      try {
        const response = await fetch("/api/falls"); // Replace with your actual API endpoint
        const data = await response.json();
        setFallsData(data); // Set fetched data into state
      } catch (error) {
        console.error("Error fetching fall data:", error);
      }
    };

    fetchFallsData();
  }, []);

  // Chart.js data configuration for the line graph
  const chartData = {
    labels: fallsData.map(fall => new Date(fall.timestamp).toLocaleString()), // Assuming 'timestamp' field
    datasets: [
      {
        label: "Falls Over Time",
        data: fallsData.map(fall => fall.count), // Assuming 'count' field represents the number of falls
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  };

  // Handle change of the view mode (table or chart)
  const handleViewChange = (event) => {
    setViewMode(event.target.value);
  };

  return (
    <div className="falls-details">
      <h2>Falls Details</h2>

      {/* Dropdown for choosing view mode */}
      <div className="view-mode-dropdown">
        <label htmlFor="viewMode">Choose View Mode: </label>
        <select id="viewMode" value={viewMode} onChange={handleViewChange}>
          <option value="table">Table View</option>
          <option value="chart">Chart View</option>
        </select>
      </div>

      {/* Display the selected view mode */}
      {viewMode === "table" ? (
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Date & Time</th>
              <th>Fall Count</th>
            </tr>
          </thead>
          <tbody>
            {fallsData.map((fall, index) => (
              <tr key={index}>
                <td>{fall.room}</td>
                <td>{new Date(fall.timestamp).toLocaleString()}</td>
                <td>{fall.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Line data={chartData} />
      )}
    </div>
  );
};

export default FallsDetails;

