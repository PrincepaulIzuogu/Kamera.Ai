import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../styles/FallsDetails.css"; // Import CSS for styling

const FallsDetails = () => {
  const [fallData, setFallData] = useState([]); // State to hold fall data
  const [view, setView] = useState("chart"); // State to toggle between chart and table
  const [searchQuery, setSearchQuery] = useState(""); // State to manage search query
  const [filteredData, setFilteredData] = useState([]); // State to store filtered data

  useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

  // Fetch fall data from the API
  useEffect(() => {
    const fetchFallData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/falls-over-time");
        const data = await response.json();
        if (data.time && data.falls) {
          setFallData([data]); // Assuming you get an array of data with "time" and "falls"
        } else {
          console.error("No data available.");
        }
      } catch (error) {
        console.error("Error fetching fall data:", error);
      }
    };

    fetchFallData();
  }, []);

  // Filter fall data based on the search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = fallData.filter((item) =>
        item.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.falls.toString().includes(searchQuery)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(fallData);
    }
  }, [searchQuery, fallData]);

  const handleSwitchView = (viewType) => {
    setView(viewType);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="falls-details">
      <h2>Falls Data</h2>

      {/* View Switcher */}
      <div className="view-switcher">
        <button
          className={`view-btn ${view === "chart" ? "active" : ""}`}
          onClick={() => handleSwitchView("chart")}
        >
          View as Chart
        </button>
        <button
          className={`view-btn ${view === "table" ? "active" : ""}`}
          onClick={() => handleSwitchView("table")}
        >
          View as Table
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Falls Data"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Chart View */}
      {view === "chart" && (
        <div className="chart-container">
          <h3>Falls Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={fallData.length > 0 ? fallData : [{ time: "No Data", falls: 0 }]}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="falls" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="table-container">
          <h3>Falls Over Time - Table</h3>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Falls</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.time}</td>
                    <td>{data.falls}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FallsDetails;
