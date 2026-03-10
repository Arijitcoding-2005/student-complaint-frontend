import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useNightMode } from '../context/NightModeContext';
import './StudentLayout.css';

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isNightMode } = useNightMode();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className={`student-layout ${isNightMode ? 'night-mode' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2> Student Panel</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${isActive('/student/dashboard') || isActive('/student') ? 'active' : ''}`}
            onClick={() => navigate('/student')}
          >
            Dashboard
          </button>

          <button
            className={`nav-item ${isActive('/student/complaints') ? 'active' : ''}`}
            onClick={() => navigate('/student/complaints')}
          >
            My Complaints
          </button>

          <button
            className={`nav-item ${isActive('/student/new') ? 'active' : ''}`}
            onClick={() => navigate('/student/new')}
          >
            Create Complaint
          </button>

          <button
            className="nav-item logout-item"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;