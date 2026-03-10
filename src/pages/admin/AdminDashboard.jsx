import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./AdminDashboard.css";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isNightMode } = useNightMode();

  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/complaints");

        const data = response.data || [];
        setComplaints(data);

        const total = data.length;
        const pending = data.filter(
          (c) => c.status === "PENDING"
        ).length;
        const resolved = data.filter(
          (c) => c.status === "RESOLVED"
        ).length;

        setStats({ total, pending, resolved });

      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

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
    <div className={`admin-dashboard-container ${isNightMode ? 'night-mode' : ''}`}>
      {/* Enhanced Header */}
      <div className="admin-dashboard-header">
        <div className="admin-header-content">
          <div className="admin-greeting-section">
            <h1 className="admin-greeting-text">{getGreeting()}, Admin! 👨‍💼</h1>
            <p className="admin-greeting-subtext">Overview of all student complaints</p>
          </div>
          <div className="admin-header-actions">
            <NightModeToggle />
            <button 
              className="admin-quick-action-btn"
              onClick={() => navigate("/admin/complaints")}
            >
              <span className="admin-btn-icon">📋</span>
              Manage All
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner">
          <span className="error-icon">⚠️</span>
          <p className="admin-error-text">{error}</p>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="admin-stats-container">
        <div className={`admin-stat-card-wrapper ${animate ? "admin-animate-card" : ""}`}>
          <div className="admin-stat-card admin-total-card">
            <div className="admin-card-icon">📊</div>
            <div className="admin-card-content">
              <h3>Total Complaints</h3>
              <AnimatedNumber value={stats.total} />
            </div>
            <div className="admin-card-footer">All submissions</div>
          </div>
        </div>

        <div className={`admin-stat-card-wrapper ${animate ? "admin-animate-card" : ""}`}>
          <div className="admin-stat-card admin-pending-card">
            <div className="admin-card-icon">⏳</div>
            <div className="admin-card-content">
              <h3>Pending Review</h3>
              <AnimatedNumber value={stats.pending} />
            </div>
            <div className="admin-card-footer">Needs attention</div>
          </div>
        </div>

        <div className={`admin-stat-card-wrapper ${animate ? "admin-animate-card" : ""}`}>
          <div className="admin-stat-card admin-resolved-card">
            <div className="admin-card-icon">✅</div>
            <div className="admin-card-content">
              <h3>Resolved</h3>
              <AnimatedNumber value={stats.resolved} />
            </div>
            <div className="admin-card-footer">Successfully handled</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="admin-quick-actions-panel">
        <h3>Quick Actions</h3>
        <div className="admin-action-cards">
          <div 
            className="admin-action-card" 
            onClick={() => navigate("/admin/complaints")}
          >
            <div className="admin-action-icon">📋</div>
            <div className="admin-action-details">
              <h4>Manage All</h4>
              <p>View & update complaints</p>
            </div>
          </div>
          
          <div 
            className="admin-action-card"
            onClick={() => navigate("/admin/analytics")}
          >
            <div className="admin-action-icon">📊</div>
            <div className="admin-action-details">
              <h4>Analytics</h4>
              <p>View detailed reports</p>
            </div>
          </div>
          
          <div 
            className="admin-action-card"
            onClick={() => {
              const pendingComplaints = complaints.filter(c => c.status === "PENDING");
              if (pendingComplaints.length > 0) {
                navigate("/admin/complaints");
              }
            }}
          >
            <div className="admin-action-icon">🔔</div>
            <div className="admin-action-details">
              <h4>Pending ({stats.pending})</h4>
              <p>Review pending items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Section */}
      <div className="admin-recent-section">
        <div className="admin-section-header">
          <h2>Recent Complaints</h2>
          <button 
            className="admin-view-all-btn"
            onClick={() => navigate("/admin/complaints")}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-spinner"></div>
            <p>Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📭</div>
            <h3>No Complaints Yet</h3>
            <p>When students submit complaints, they will appear here.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-recent-table">
              <thead>
                <tr>
                  <th>
                    <div className="admin-th-content">
                      <span>Student</span>
                    </div>
                  </th>
                  <th>
                    <div className="admin-th-content">
                      <span>Description</span>
                    </div>
                  </th>
                  <th>
                    <div className="admin-th-content">
                      <span>Status</span>
                    </div>
                  </th>
                  <th>
                    <div className="admin-th-content">
                      <span>Submitted</span>
                    </div>
                  </th>
                  <th>
                    <div className="admin-th-content">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(-5).reverse().map((c) => (
                  <tr key={c.id} className="admin-table-row">
                    <td>
                      <div className="admin-student-cell">
                        <span className="student-avatar">👤</span>
                        <span className="student-name">{c.name || "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-complaint-title">
                        <span className="admin-title-text">{c.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge-${c.status?.toLowerCase()}`}>
                        <span className="admin-badge-icon">{getStatusIcon(c.status)}</span>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-date-cell">
                        <span className="admin-date-icon">📅</span>
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric"
                          })
                          : "N/A"}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="admin-action-btn-small"
                        onClick={() => navigate("/admin/complaints")}
                      >
                        Manage
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
      <div className="admin-dashboard-footer">
        <div className="admin-footer-actions">
          <button 
            className="admin-footer-btn secondary"
            onClick={() => navigate("/admin/analytics")}
          >
            <span className="admin-btn-icon">📊</span>
            View Analytics
          </button>

          <button 
            onClick={handleLogout} 
            className="admin-footer-btn logout"
          >
            <span className="admin-btn-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;