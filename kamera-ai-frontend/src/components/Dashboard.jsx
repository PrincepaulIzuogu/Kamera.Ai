import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalFalls: 0,
    totalRooms: 0,
    subscriptionStatus: "Loading...",
    userGuideAccess: "Available",
    clinicName: "Loading...",
  });
  const [fallData, setFallData] = useState([]); // Falls Over Time Graph
  const [activePatientsData, setActivePatientsData] = useState([]); // Active Patients Pie Chart
  const [recentAlerts, setRecentAlerts] = useState([]); // Recent Alerts Table

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch dashboard data
        const dashboardResponse = await fetch("http://localhost:5001/api/dashboard", { headers });
        if (!dashboardResponse.ok) throw new Error(await dashboardResponse.text());
        const dashboard = await dashboardResponse.json();

        const mappedData = {
          clinicName: dashboard.clinic_name,
          totalFalls: dashboard.total_falls,
          totalRooms: dashboard.total_rooms,
          subscriptionStatus: dashboard.subscription_status,
          userGuideAccess: dashboard.user_guide_access,
        };

        setDashboardData((prevData) => ({
          ...prevData,
          ...mappedData,
        }));

        // Fetch Falls Over Time data
        const fallsResponse = await fetch("http://localhost:5001/api/falls-over-time", { headers });
        const fallGraphData = (await fallsResponse.json()) || [];
        setFallData(fallGraphData);

        // Fetch Active Patients data
        const activeResponse = await fetch("http://localhost:5001/api/active-patients", { headers });
        const activeGraphData = (await activeResponse.json()) || [];
        setActivePatientsData(
          Array.isArray(activeGraphData) && activeGraphData.length > 0
            ? activeGraphData
            : [{ name: "No Data", value: 1, color: "#d3d3d3" }] // Placeholder for no data
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [navigate]);

  const handleViewMore = (section) => {
    switch (section) {
      case "falls":
        navigate("/falls-details");
        break;
      case "rooms":
        navigate("/room-management");
        break;
      case "subscription":
        navigate("/subscription-details");
        break;
      case "userGuide":
        navigate("/user-guide");
        break;
      default:
        console.error("Unknown section:", section);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome {dashboardData.clinicName !== "Loading..." ? dashboardData.clinicName : "User"} Team!</h1>
      </div>
      <div className="dashboard-metrics">
        <div className="metric-card">
          <h3>Total Falls</h3>
          <div className="metric-value">{dashboardData.totalFalls}</div>
          <button className="view-more-btn" onClick={() => handleViewMore("falls")}>
            View More
          </button>
        </div>
        <div className="metric-card">
          <h3>Room Management</h3>
          <div className="metric-value">{dashboardData.totalRooms}</div>
          <button className="view-more-btn" onClick={() => handleViewMore("rooms")}>
            View More
          </button>
        </div>
        <div className="metric-card">
          <h3>Subscription Management</h3>
          <div className="metric-value">
            <span className="red-value">{dashboardData.subscriptionStatus}</span>
          </div>
          <button className="view-more-btn" onClick={() => handleViewMore("subscription")}>
            View More
          </button>
        </div>
        <div className="metric-card">
          <h3>User Guide</h3>
          <div className="metric-value">{dashboardData.userGuideAccess}</div>
          <button className="view-more-btn" onClick={() => handleViewMore("userGuide")}>
            View More
          </button>
        </div>
      </div>
      <div className="dashboard-charts">
        <div className="chart">
          <h3>Falls Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
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
        <div className="chart">
          <h3>Active Patients Monitored</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={activePatientsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                fill="#82ca9d"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {activePatientsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#8884d8"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="dashboard-logs">
        <h3>Recent Alerts</h3>
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Fall Time</th>
              <th>Patient Name</th>
            </tr>
          </thead>
          <tbody>
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert, index) => (
                <tr key={index}>
                  <td>{alert.room_number}</td>
                  <td>{alert.fall_time}</td>
                  <td>{alert.patient_name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">
                  No recent alerts available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;