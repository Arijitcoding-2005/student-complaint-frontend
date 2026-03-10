import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../api/axios";
import "./StudentDashboard.css";
import { useNightMode } from "../../context/NightModeContext";
import NightModeToggle from "../../components/NightModeToggle";

const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const increment = value / (duration / 20);

    const counter = setInterval(() => {
      start += increment;
      if (start >= value) {
        start = value;
        clearInterval(counter);
      }
      setCount(Math.floor(start));
    }, 20);

    return () => clearInterval(counter);
  }, [value]);

  return <p>{count}</p>;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const { isNightMode } = useNightMode();

  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
    }, 100);
  }, []);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });

  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          "/student/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const complaints = response.data;
        setComplaints(complaints);

        const total = complaints.length;
        const pending = complaints.filter(
          (c) => c.status === "PENDING"
        ).length;
        const resolved = complaints.filter(
          (c) => c.status === "RESOLVED"
        ).length;

        setStats({ total, pending, resolved });

        // Extract user name if available
        if (complaints.length > 0 && complaints[0].name) {
          setUserName(complaints[0].name);
        }

      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getStatusIcon = (status) => {
    return status === "PENDING" ? "⏳" : "✅";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className={`dashboard-container ${isNightMode ? 'night-mode' : ''}`}>
      {/* Enhanced Header with Greeting */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="greeting-section">
            <h1 className="greeting-text">{getGreeting()}, {userName}! 👋</h1>
            <p className="greeting-subtext">Here's your complaint dashboard overview</p>
          </div>
          <div className="header-actions">
            <NightModeToggle />
            <button
              className="quick-action-btn create-btn"
              onClick={() => navigate("/student/new")}
            >
              <span className="btn-icon">➕</span>
              New Complaint
            </button>
            <button
              className="quick-action-btn profile-btn"
              onClick={() => navigate("/student/profile")}
            >
              <span className="btn-icon">👤</span>
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards with Icons */}
      <div className="stats-container">
        <div className={`stat-card-wrapper ${animate ? "animate-card" : ""}`}>
          <div className="stat-card total-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Total Complaints</h3>
              <AnimatedNumber value={stats.total} />
            </div>
            <div className="card-footer">All time submissions</div>
          </div>
        </div>

        <div className={`stat-card-wrapper ${animate ? "animate-card" : ""}`}>
          <div className="stat-card pending-card">
            <div className="card-icon">⏳</div>
            <div className="card-content">
              <h3>Pending</h3>
              <AnimatedNumber value={stats.pending} />
            </div>
            <div className="card-footer">Awaiting response</div>
          </div>
        </div>

        <div className={`stat-card-wrapper ${animate ? "animate-card" : ""}`}>
          <div className="stat-card resolved-card">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>Resolved</h3>
              <AnimatedNumber value={stats.resolved} />
            </div>
            <div className="card-footer">Successfully closed</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="quick-actions-panel">
        <h3>Quick Actions</h3>
        <div className="action-cards">
          <div
            className="action-card"
            onClick={() => navigate("/student/new")}
          >
            <div className="action-icon">📝</div>
            <div className="action-details">
              <h4>Submit New</h4>
              <p>File a new complaint</p>
            </div>
          </div>
          <div
            className="action-card"
            onClick={() => navigate("/student/analytics")}
          >
            <div className="action-icon">📊</div>
            <div className="action-details">
              <h4>Analytics</h4>
              <p>View your complaint trends</p>
            </div>
          </div>
          <div
            className="action-card"
            onClick={() => navigate("/student/complaints")}
          >
            <div className="action-icon">📋</div>
            <div className="action-details">
              <h4>View All</h4>
              <p>See all complaints</p>
            </div>
          </div>

          <div className="action-card" onClick={() => navigate("/student/track")}>
            <div className="action-icon">📈</div>
            <div className="action-details">
              <h4>Track Status</h4>
              <p>Monitor progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Complaints Section */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Complaints</h2>
          <button
            className="view-all-btn"
            onClick={() => navigate("/student/complaints")}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Complaints Yet</h3>
            <p>You haven't submitted any complaints. Start by creating one!</p>
            <button
              className="empty-action-btn"
              onClick={() => navigate("/student/new")}
            >
              Create Your First Complaint
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>
                    <div className="th-content">
                      <span>Title</span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>Status</span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>Submitted</span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(-5).reverse().map((c) => (
                  <tr key={c.id} className="table-row">
                    <td>
                      <div className="complaint-title">
                        <span className="title-text">{c.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${c.status?.toLowerCase()}`}>
                        <span className="badge-icon">{getStatusIcon(c.status)}</span>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date-icon">📅</span>
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric"
                          })
                          : "N/A"}
                      </div>
                    </td>
                    <td>
                      <button
                        className="action-btn-small"
                        onClick={() => navigate(`/student/complaints`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Footer Actions */}
      <div className="dashboard-footer">
        <div className="footer-actions">
          <button
            className="footer-btn secondary"
            onClick={() => navigate("/student/complaints")}
          >
            <span className="btn-icon">📋</span>
            Manage Complaints
          </button>

          <button
            onClick={handleLogout}
            className="footer-btn logout"
          >
            <span className="btn-icon"></span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;