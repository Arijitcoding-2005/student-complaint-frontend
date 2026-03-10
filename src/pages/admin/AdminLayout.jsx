import { Link, Outlet } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/complaints">Manage Complaints</Link>
        <Link to="/admin/users">Users</Link>
      </div>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;